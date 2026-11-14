package ledger

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

type fakeStore struct {
	item  Item
	trans []Transition
	err   error
	block bool
	calls []string
}

func (f *fakeStore) Item(ctx context.Context, id string) (Item, []Transition, error) {
	f.calls = append(f.calls, id)
	if f.block {
		<-ctx.Done()
		return Item{}, nil, ctx.Err()
	}
	if f.err != nil {
		return Item{}, nil, f.err
	}
	if id != f.item.ID {
		return Item{}, nil, ErrNotFound
	}
	return f.item, f.trans, nil
}

func ts(min int) time.Time { return time.Date(2026, 1, 5, 9, min, 0, 0, time.UTC) }

func newFake() *fakeStore {
	return &fakeStore{
		item: Item{ID: "PA-0001", Title: "Wrap Rate", State: "recorded", RecordedAt: ts(0), ChangedAt: ts(2)},
		trans: []Transition{
			{EntryID: 9, Actor: "sextant", From: "discovered", To: "recorded", Note: "second", At: ts(2)},
			{EntryID: 3, Actor: "trawl", To: "discovered", Note: "first", At: ts(0)},
			{EntryID: 12, Actor: "assay", From: "recorded", To: "recorded", ErrorCode: "E_TIMEOUT", At: ts(5)},
		},
	}
}

func serve(h http.Handler, method, target string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, target, nil))
	return rec
}

func handler(s Store) *Handler {
	h, err := NewHandler(s, time.Second, func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "the 404 page", http.StatusNotFound)
	}, nil)
	if err != nil {
		panic(err)
	}
	return h
}

func TestNewHandlerRefusesATimeoutThatWouldFailEveryPage(t *testing.T) {
	for _, d := range []time.Duration{0, -time.Second} {
		if _, err := NewHandler(newFake(), d, nil, nil); err == nil {
			t.Errorf("NewHandler accepted a timeout of %v", d)
		}
	}
	if _, err := NewHandler(nil, time.Second, nil, nil); err == nil {
		t.Error("NewHandler accepted a nil store")
	}
}

func TestPageSaysWhenHistoryWasCut(t *testing.T) {
	f := newFake()
	f.item.Changes = 1200
	body := serve(handler(f), "GET", "/items/PA-0001").Body.String()
	if !strings.Contains(body, "Showing the latest 3 of 1200 changes.") {
		t.Errorf("no line about the cut history:\n%s", body)
	}
	f.item.Changes = 3
	if body := serve(handler(f), "GET", "/items/PA-0001").Body.String(); strings.Contains(body, "Showing the latest") {
		t.Error("the page claims a cut when nothing was cut")
	}
}

func TestPageShowsTheItemAndEveryTransitionInOrder(t *testing.T) {
	rec := serve(handler(newFake()), "GET", "/items/PA-0001")
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	body := rec.Body.String()
	for _, want := range []string{"PA-0001", "Wrap Rate", "recorded", "sextant", "discovered", "E_TIMEOUT", "second", "2026-01-05T09:02:00Z"} {
		if !strings.Contains(body, want) {
			t.Errorf("page lacks %q", want)
		}
	}
	i3, i9, i12 := strings.Index(body, ">first<"), strings.Index(body, ">second<"), strings.Index(body, "E_TIMEOUT")
	if !(i3 >= 0 && i3 < i9 && i9 < i12) {
		t.Errorf("transitions not in entry_id order: %d %d %d", i3, i9, i12)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "text/html; charset=utf-8" {
		t.Errorf("content type %q", ct)
	}
	if cc := rec.Header().Get("Cache-Control"); cc != "no-store" {
		t.Errorf("Cache-Control %q", cc)
	}
}

func TestPageEscapesEverything(t *testing.T) {
	f := newFake()
	f.item.Title = `<script>alert(1)</script>`
	f.trans[0].Note = `"><img src=x onerror=alert(2)>`
	body := serve(handler(f), "GET", "/items/PA-0001").Body.String()
	if strings.Contains(body, "<script>") || strings.Contains(body, "<img") {
		t.Errorf("markup in data reached the page unescaped:\n%s", body)
	}
	if strings.Contains(body, "<style") || strings.Contains(body, "style=") || strings.Contains(body, "<script") {
		t.Error("page uses inline style or script, which default-src 'self' blocks")
	}
}

func TestUnknownAndMalformedIDsAre404AndMalformedNeverReachTheStore(t *testing.T) {
	f := newFake()
	h := handler(f)
	if rec := serve(h, "GET", "/items/PA-9999"); rec.Code != 404 || rec.Body.String() != "the 404 page\n" {
		t.Errorf("unknown id: %d %q", rec.Code, rec.Body.String())
	}
	for _, p := range []string{"/items/", "/items/PA-1", "/items/pa-0001", "/items/PA-0001/", "/items/PA-0001/x", "/items/%27;%20DROP%20TABLE%20core.item;--", "/items/PA-00001"} {
		f.calls = nil
		if rec := serve(h, "GET", p); rec.Code != 404 {
			t.Errorf("%s = %d", p, rec.Code)
		}
		if len(f.calls) != 0 {
			t.Errorf("%s reached the store: %v", p, f.calls)
		}
	}
}

func TestLogbookDownIsAPlain503WithNoDetail(t *testing.T) {
	f := newFake()
	f.err = errors.New(`dial tcp 10.1.2.3:5432: password authentication failed for user "pub_ro" password=hunter2`)
	rec := serve(handler(f), "GET", "/items/PA-0001")
	if rec.Code != 503 {
		t.Fatalf("status %d", rec.Code)
	}
	body := rec.Body.String()
	for _, leak := range []string{"10.1.2.3", "hunter2", "pub_ro", "dial", "5432"} {
		if strings.Contains(body, leak) {
			t.Errorf("503 leaks %q", leak)
		}
	}
	if rec.Header().Get("Cache-Control") != "no-store" || !strings.HasPrefix(rec.Header().Get("Content-Type"), "text/plain") {
		t.Errorf("headers %v", rec.Header())
	}
	if rec.Header().Get("Retry-After") == "" {
		t.Error("no Retry-After")
	}
}

func TestSlowLogbookTimesOutTo503(t *testing.T) {
	f := newFake()
	f.block = true
	h := handler(f)
	h.timeout = 30 * time.Millisecond
	start := time.Now()
	rec := serve(h, "GET", "/items/PA-0001")
	if rec.Code != 503 {
		t.Errorf("status %d", rec.Code)
	}
	if time.Since(start) > 2*time.Second {
		t.Error("the query was not given a timeout")
	}
}

func TestMethods(t *testing.T) {
	h := handler(newFake())
	if rec := serve(h, "POST", "/items/PA-0001"); rec.Code != 405 || rec.Header().Get("Allow") != "GET, HEAD" {
		t.Errorf("POST = %d %q", rec.Code, rec.Header().Get("Allow"))
	}
	if rec := serve(h, "HEAD", "/items/PA-0001"); rec.Code != 200 || rec.Body.Len() != 0 {
		t.Errorf("HEAD = %d with %d bytes", rec.Code, rec.Body.Len())
	}
}

func TestStylesheet(t *testing.T) {
	rec := serve(handler(newFake()), "GET", StylesheetPath)
	if rec.Code != 200 || rec.Header().Get("Content-Type") != "text/css; charset=utf-8" || rec.Body.Len() == 0 {
		t.Errorf("stylesheet: %d %q", rec.Code, rec.Header().Get("Content-Type"))
	}
}
