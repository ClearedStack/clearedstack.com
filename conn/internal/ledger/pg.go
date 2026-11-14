package ledger

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
)

// maxHistory bounds one page. An item with more entries than this shows the
// newest ones, and the page says so.
const maxHistory = 1000

// PG reads Logbook's public views as the pub_ro role.
type PG struct {
	db           *sql.DB
	timeout      time.Duration
	historyLimit int
}

// Open prepares a pool. It does not connect: Logbook being down at start is
// the same as it going down later, a 503 on the page that needs it. password
// is used when it is not empty, and replaces any password in the address.
func Open(address, password string, queryTimeout time.Duration) (*PG, error) {
	return open(address, password, queryTimeout, true)
}

// open is Open, with the connection's read-only default optional so a test can
// show that the read-only transaction is enough on its own.
func open(address, password string, queryTimeout time.Duration, readOnlyDefault bool) (*PG, error) {
	if queryTimeout <= 0 {
		return nil, errors.New("ledger: the query timeout must be positive")
	}
	cfg, err := pgx.ParseConfig(address)
	if err != nil {
		return nil, errors.New("ledger: invalid database address") // the parser's message can quote the address
	}
	if password != "" {
		cfg.Password = password
	}
	if cfg.ConnectTimeout == 0 {
		cfg.ConnectTimeout = 3 * time.Second
	}
	if cfg.RuntimeParams == nil {
		cfg.RuntimeParams = map[string]string{}
	}
	// A second fence behind the read-only transaction: even a statement run
	// outside one is read-only, and nothing may run or sit idle for long.
	if readOnlyDefault {
		cfg.RuntimeParams["default_transaction_read_only"] = "on"
	}
	cfg.RuntimeParams["statement_timeout"] = durationMS(queryTimeout)
	cfg.RuntimeParams["idle_in_transaction_session_timeout"] = durationMS(2 * queryTimeout)
	cfg.RuntimeParams["application_name"] = "conn"

	db := stdlib.OpenDB(*cfg)
	db.SetMaxOpenConns(4)
	db.SetMaxIdleConns(2)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)
	return &PG{db: db, timeout: queryTimeout, historyLimit: maxHistory}, nil
}

func durationMS(d time.Duration) string { return strconv.FormatInt(d.Milliseconds(), 10) }

// Close closes the pool.
func (p *PG) Close() error { return p.db.Close() }

// readOnly runs fn in a read-only, repeatable-read transaction, so the item and
// its history come from one snapshot. It is the only way PG touches the
// database.
func (p *PG) readOnly(ctx context.Context, fn func(context.Context, *sql.Tx) error) error {
	ctx, cancel := context.WithTimeout(ctx, p.timeout)
	defer cancel()
	tx, err := p.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: true, Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return err
	}
	defer tx.Rollback()
	return fn(ctx, tx)
}

// Item implements Store.
func (p *PG) Item(ctx context.Context, id string) (Item, []Transition, error) {
	var (
		item  = Item{ID: id}
		trans []Transition
	)
	err := p.readOnly(ctx, func(ctx context.Context, tx *sql.Tx) error {
		var changed sql.NullTime
		err := tx.QueryRowContext(ctx,
			`SELECT i.title, i.state, i.recorded_at, i.changed_at,
			        (SELECT count(*) FROM pub.item_history h WHERE h.item_id = i.item_id)
			   FROM pub.item i WHERE i.item_id = $1`, id).
			Scan(&item.Title, &item.State, &item.RecordedAt, &changed, &item.Changes)
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		if err != nil {
			return err
		}
		item.ChangedAt = changed.Time

		rows, err := tx.QueryContext(ctx,
			`SELECT entry_id, actor, from_state, to_state, error_code, note, recorded_at FROM (
			     SELECT * FROM pub.item_history WHERE item_id = $1 ORDER BY entry_id DESC LIMIT $2
			   ) newest ORDER BY entry_id`, id, p.historyLimit)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var t Transition
			var from, code, note sql.NullString
			if err := rows.Scan(&t.EntryID, &t.Actor, &from, &t.To, &code, &note, &t.At); err != nil {
				return err
			}
			t.From, t.ErrorCode, t.Note = from.String, code.String, note.String
			trans = append(trans, t)
		}
		return rows.Err()
	})
	if err != nil {
		return Item{}, nil, err
	}
	return item, trans, nil
}
