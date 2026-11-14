package ledger

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
)

// The integration test reads a real Logbook as pub_ro. scripts/integration.sh
// builds one and sets CONN_TEST_DATABASE_URL (and CONN_TEST_PASSWORD).
func openTest(t *testing.T) *PG {
	t.Helper()
	url := os.Getenv("CONN_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("CONN_TEST_DATABASE_URL is not set")
	}
	p, err := Open(url, os.Getenv("CONN_TEST_PASSWORD"), 3*time.Second)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { p.Close() })
	return p
}

// openBare opens a pool without the read-only default on the connection, so a
// test can show the transaction option does its own work.
func openBare(t *testing.T) *PG {
	t.Helper()
	url := os.Getenv("CONN_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("CONN_TEST_DATABASE_URL is not set")
	}
	p, err := open(url, os.Getenv("CONN_TEST_PASSWORD"), 3*time.Second, false)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { p.Close() })
	return p
}

func TestPGTransactionIsReadOnlyWithoutTheConnectionDefault(t *testing.T) {
	p := openBare(t)
	ctx := context.Background()
	var def string
	if err := p.db.QueryRowContext(ctx, `SHOW default_transaction_read_only`).Scan(&def); err != nil || def != "off" {
		t.Fatalf("the bare pool should not be read-only by default: %q, %v", def, err)
	}
	err := p.readOnly(ctx, func(ctx context.Context, tx *sql.Tx) error {
		_, err := tx.ExecContext(ctx, `CREATE TEMP TABLE leak (x int)`)
		if code := pgCode(err); code != "25006" {
			t.Errorf("a write inside readOnly: code %q, err %v", code, err)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestPGHistoryKeepsTheNewestAndCountsAll(t *testing.T) {
	p := openTest(t)
	p.historyLimit = 3
	item, trans, err := p.Item(context.Background(), "PA-0003")
	if err != nil {
		t.Fatal(err)
	}
	if item.Changes != 5 {
		t.Errorf("Changes = %d, want 5", item.Changes)
	}
	var notes []string
	for _, tr := range trans {
		notes = append(notes, tr.Note)
	}
	if got := strings.Join(notes, ","); got != "change 3,change 4,change 5" {
		t.Errorf("history = %q, want the newest three, oldest first", got)
	}
	p.historyLimit = 1000
	if _, all, _ := p.Item(context.Background(), "PA-0003"); len(all) != 5 {
		t.Errorf("uncut history has %d rows", len(all))
	}
}

func TestPGItem(t *testing.T) {
	p := openTest(t)
	item, trans, err := p.Item(context.Background(), "PA-0001")
	if err != nil {
		t.Fatal(err)
	}
	if item.ID != "PA-0001" || item.Title != "Sample wrap rate" || item.State != "recorded" {
		t.Errorf("item = %+v", item)
	}
	if !item.RecordedAt.Equal(time.Date(2026, 1, 5, 9, 0, 0, 0, time.UTC)) ||
		!item.ChangedAt.Equal(time.Date(2026, 1, 5, 9, 10, 0, 0, time.UTC)) {
		t.Errorf("times = %v, %v", item.RecordedAt, item.ChangedAt)
	}
	if len(trans) != 3 {
		t.Fatalf("%d transitions, want 3", len(trans))
	}
	for i := 1; i < len(trans); i++ {
		if trans[i].EntryID <= trans[i-1].EntryID {
			t.Errorf("not in entry_id order: %v", trans)
		}
	}
	first, second, third := trans[0], trans[1], trans[2]
	if first.Actor != "trawl" || first.From != "" || first.To != "discovered" || first.ErrorCode != "" || first.Note != "" {
		t.Errorf("first = %+v (NULL columns must read as empty)", first)
	}
	if second.From != "discovered" || second.To != "recorded" || second.Note != "Recorded from the sample source." {
		t.Errorf("second = %+v", second)
	}
	if third.Actor != "sextant" || third.ErrorCode != "E_TIMEOUT" {
		t.Errorf("third = %+v", third)
	}
}

func TestPGItemWithQuietHistoryAndUnknown(t *testing.T) {
	p := openTest(t)
	if _, trans, err := p.Item(context.Background(), "PA-0002"); err != nil || len(trans) != 1 {
		t.Errorf("PA-0002: %v, %d transitions", err, len(trans))
	}
	if _, _, err := p.Item(context.Background(), "PA-9999"); !errors.Is(err, ErrNotFound) {
		t.Errorf("unknown id: err = %v, want ErrNotFound", err)
	}
}

func TestPGIsReadOnlyAndSeesOnlyPub(t *testing.T) {
	p := openTest(t)
	ctx := context.Background()

	err := p.readOnly(ctx, func(ctx context.Context, tx *sql.Tx) error {
		var mode string
		if err := tx.QueryRowContext(ctx, `SHOW transaction_read_only`).Scan(&mode); err != nil {
			return err
		}
		if mode != "on" {
			t.Errorf("transaction_read_only = %q", mode)
		}
		_, err := tx.ExecContext(ctx, `CREATE TEMP TABLE leak (x int)`)
		if code := pgCode(err); code != "25006" { // read_only_sql_transaction
			t.Errorf("a write inside Conn's transaction: code %q, err %v", code, err)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	// Outside a transaction block the connection default is read-only too.
	var def string
	if err := p.db.QueryRowContext(ctx, `SHOW default_transaction_read_only`).Scan(&def); err != nil || def != "on" {
		t.Errorf("default_transaction_read_only = %q, %v", def, err)
	}

	// The role has no right to the working tables.
	_, err = p.db.ExecContext(ctx, `SELECT 1 FROM core.item`)
	if code := pgCode(err); code != "42501" { // insufficient_privilege
		t.Errorf("reading core.item as pub_ro: code %q, err %v", code, err)
	}
	var who string
	if err := p.db.QueryRowContext(ctx, `SELECT current_user`).Scan(&who); err != nil || who != "pub_ro" {
		t.Errorf("connected as %q, %v", who, err)
	}
}

func TestPGQueryTimeout(t *testing.T) {
	p := openTest(t)
	p.timeout = 100 * time.Millisecond
	start := time.Now()
	err := p.readOnly(context.Background(), func(ctx context.Context, tx *sql.Tx) error {
		_, err := tx.ExecContext(ctx, `SELECT pg_sleep(5)`)
		return err
	})
	if err == nil || time.Since(start) > 3*time.Second {
		t.Errorf("slow query: err = %v after %v", err, time.Since(start))
	}
}

func TestOpenDoesNotLeakTheAddress(t *testing.T) {
	_, err := Open("postgres://pub_ro:s3cret@bad host with spaces/db", "", time.Second)
	if err == nil {
		t.Fatal("Open succeeded")
	}
	if strings.Contains(err.Error(), "s3cret") {
		t.Errorf("error leaks the password: %v", err)
	}
}

func pgCode(err error) string {
	var pe *pgconn.PgError
	if errors.As(err, &pe) {
		return pe.Code
	}
	return ""
}
