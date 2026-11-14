// Package ledger renders the item ledger page, GET /items/<id>, from the
// public views pub.item and pub.item_history.
package ledger

import (
	"context"
	_ "embed"
	"errors"
	"html/template"
	"log/slog"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/ClearedStack/clearedstack.com/conn/internal/itemid"
)

// StylesheetPath is where the page's one stylesheet is served. It is a file
// of its own because the page's CSP, default-src 'self', forbids inline style.
const StylesheetPath = "/_conn/ledger.css"

//go:embed ledger.css
var stylesheet []byte

// ErrNotFound is what a Store returns for an id that has no row.
var ErrNotFound = errors.New("ledger: no such item")

// Item is one row of pub.item.
type Item struct {
	ID, Title, State      string
	RecordedAt, ChangedAt time.Time
}

// Transition is one row of pub.item_history. The optional columns are empty
// when the column is NULL.
type Transition struct {
	EntryID                          int64
	Actor, From, To, ErrorCode, Note string
	At                               time.Time
}

// Store reads one item and its history in one consistent snapshot.
type Store interface {
	Item(ctx context.Context, id string) (Item, []Transition, error)
}

// Handler serves /items/<id> and the stylesheet.
type Handler struct {
	Store    Store
	Timeout  time.Duration    // how long one lookup may take
	NotFound http.HandlerFunc // the site's 404 page; nil means plain text
	Log      *slog.Logger     // nil means no log
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.URL.Path == StylesheetPath {
		w.Header().Set("Content-Type", "text/css; charset=utf-8")
		w.Write(stylesheet)
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/items/")
	if !itemid.Valid(id) {
		h.notFound(w, r)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), h.Timeout)
	defer cancel()
	item, trans, err := h.Store.Item(ctx, id)
	switch {
	case errors.Is(err, ErrNotFound):
		h.notFound(w, r)
		return
	case err != nil:
		if r.Context().Err() != nil {
			return // the visitor left
		}
		if h.Log != nil {
			// Only the kind of failure is logged: the driver's message can
			// name the server.
			h.Log.Error("logbook read failed", "timeout", errors.Is(err, context.DeadlineExceeded))
		}
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Retry-After", "5")
		http.Error(w, "The ledger is not available right now. Try again in a moment.", http.StatusServiceUnavailable)
		return
	}
	sort.SliceStable(trans, func(i, j int) bool { return trans[i].EntryID < trans[j].EntryID })
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if r.Method == http.MethodHead {
		return
	}
	if err := page.Execute(w, struct {
		Item        Item
		Transitions []Transition
	}{item, trans}); err != nil && h.Log != nil {
		h.Log.Error("ledger page write failed")
	}
}

func (h *Handler) notFound(w http.ResponseWriter, r *http.Request) {
	if h.NotFound != nil {
		h.NotFound(w, r)
		return
	}
	http.NotFound(w, r)
}

var page = template.Must(template.New("item").Funcs(template.FuncMap{
	"stamp": func(t time.Time) string { return t.UTC().Format(time.RFC3339) },
}).Parse(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{.Item.ID}}: {{.Item.Title}}</title>
<link rel="stylesheet" href="` + StylesheetPath + `">
</head>
<body>
<main>
<p><a href="/">ClearedStack</a></p>
<h1>{{.Item.Title}}</h1>
<dl>
<dt>Item</dt><dd>{{.Item.ID}}</dd>
<dt>State</dt><dd>{{.Item.State}}</dd>
<dt>Recorded</dt><dd><time datetime="{{stamp .Item.RecordedAt}}">{{stamp .Item.RecordedAt}}</time></dd>
{{- if not .Item.ChangedAt.IsZero}}
<dt>Last change</dt><dd><time datetime="{{stamp .Item.ChangedAt}}">{{stamp .Item.ChangedAt}}</time></dd>
{{- end}}
</dl>
<h2>History</h2>
<table>
<thead><tr><th>Entry</th><th>Time (UTC)</th><th>Actor</th><th>From</th><th>To</th><th>Error code</th><th>Note</th></tr></thead>
<tbody>
{{range .Transitions -}}
<tr><td>{{.EntryID}}</td><td><time datetime="{{stamp .At}}">{{stamp .At}}</time></td><td>{{.Actor}}</td><td>{{.From}}</td><td>{{.To}}</td><td>{{.ErrorCode}}</td><td>{{.Note}}</td></tr>
{{else -}}
<tr><td colspan="7">No changes recorded.</td></tr>
{{end -}}
</tbody>
</table>
</main>
</body>
</html>
`))
