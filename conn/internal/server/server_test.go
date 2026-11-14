package server

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/ClearedStack/clearedstack.com/conn/internal/ledger"
	"github.com/ClearedStack/clearedstack.com/conn/internal/static"
)

type fakeStore struct{ err error }

func (f fakeStore) Item(_ context.Context, id string) (ledger.Item, []ledger.Transition, error) {
	if f.err != nil {
		return ledger.Item{}, nil, f.err
	}
	if id != "PA-0001" {
		return ledger.Item{}, nil, ledger.ErrNotFound
	}
	return ledger.Item{ID: id, Title: "Wrap Rate", State: "live"}, nil, nil
}

func newApp(t *testing.T, store ledger.Store) http.Handler {
	t.Helper()
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "index.html"), []byte("home"), 0o644)
	os.WriteFile(filepath.Join(dir, "404.html"), []byte("missing"), 0o644)
	st, err := static.New(dir)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { st.Close() })
	feed := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		io.WriteString(w, "id: 1\nevent: depths\ndata: {}\n\n")
	})
	return New(Handlers{
		Static: st,
		Ledger: &ledger.Handler{Store: store, Timeout: time.Second, NotFound: st.NotFound},
		Feed:   feed,
	})
}

func do(h http.Handler, method, target string, body io.Reader) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, target, body))
	return rec
}

func TestRoutes(t *testing.T) {
	h := newApp(t, fakeStore{})
	for _, tc := range []struct {
		method, path string
		code         int
		body         string
	}{
		{"GET", "/", 200, "home"},
		{"GET", "/nope", 404, "missing"},
		{"GET", "/.env", 404, "missing"},
		{"GET", "/items/PA-0001", 200, "Wrap Rate"},
		{"GET", "/items/PA-0002", 404, "missing"},
		{"GET", "/items/bogus", 404, "missing"},
		{"GET", "/v1/feed", 200, "event: depths"},
		{"POST", "/v1/edits", 405, ""},
		{"POST", "/items/PA-0001", 405, ""},
		{"GET", ledger.StylesheetPath, 200, "font"},
	} {
		rec := do(h, tc.method, tc.path, nil)
		if rec.Code != tc.code || !strings.Contains(rec.Body.String(), tc.body) {
			t.Errorf("%s %s = %d %q, want %d containing %q", tc.method, tc.path, rec.Code, rec.Body.String(), tc.code, tc.body)
		}
	}
}

func TestEveryAnswerCarriesTheSecurityHeaders(t *testing.T) {
	for name, h := range map[string]http.Handler{
		"ok":           newApp(t, fakeStore{}),
		"logbook down": newApp(t, fakeStore{err: errors.New("down")}),
	} {
		for _, p := range []string{"/", "/nope", "/items/PA-0001", "/items/PA-0009", "/v1/feed", "/_conn/ledger.css"} {
			rec := do(h, "GET", p, nil)
			if got := rec.Header().Get("Content-Security-Policy"); got != "default-src 'self'" {
				t.Errorf("%s %s: CSP = %q", name, p, got)
			}
			if rec.Header().Get("X-Content-Type-Options") != "nosniff" || rec.Header().Get("Referrer-Policy") != "no-referrer" || rec.Header().Get("X-Frame-Options") != "DENY" {
				t.Errorf("%s %s: headers %v", name, p, rec.Header())
			}
		}
		if rec := do(h, "POST", "/", nil); rec.Header().Get("Content-Security-Policy") == "" {
			t.Errorf("%s: a 405 lacks the CSP", name)
		}
	}
}

func TestLogbookDownDoesNotTakeTheStaticSiteWithIt(t *testing.T) {
	h := newApp(t, fakeStore{err: errors.New("down")})
	if rec := do(h, "GET", "/items/PA-0001", nil); rec.Code != 503 {
		t.Errorf("item page = %d", rec.Code)
	}
	if rec := do(h, "GET", "/", nil); rec.Code != 200 {
		t.Errorf("home = %d", rec.Code)
	}
}

func TestBodyLimit(t *testing.T) {
	h := newApp(t, fakeStore{})
	big := strings.NewReader(strings.Repeat("x", MaxBody+1))
	if rec := do(h, "POST", "/", big); rec.Code != 413 {
		t.Errorf("oversized body = %d, want 413", rec.Code)
	}
	req := httptest.NewRequest("POST", "/", strings.NewReader(strings.Repeat("x", MaxBody+1)))
	req.ContentLength = -1 // chunked: the length is not announced
	rec := httptest.NewRecorder()
	var read int64
	probe := Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n, _ := io.Copy(io.Discard, r.Body)
		read = n
	}))
	probe.ServeHTTP(rec, req)
	if read > MaxBody {
		t.Errorf("a chunked body of %d bytes was read, limit is %d", read, MaxBody)
	}
}

func TestServerTimeouts(t *testing.T) {
	s := NewServer(":0", http.NotFoundHandler())
	if s.ReadHeaderTimeout <= 0 || s.ReadTimeout <= 0 || s.WriteTimeout <= 0 || s.IdleTimeout <= 0 || s.MaxHeaderBytes <= 0 || s.MaxHeaderBytes > 64<<10 {
		t.Errorf("timeouts not all set: %+v", s)
	}
}
