// Package server puts Conn's handlers behind one mux and one set of
// protections.
package server

import (
	"net/http"
	"time"
)

// MaxBody is the most request body Conn reads. Conn has no endpoint that takes
// one, so the limit is small.
const MaxBody = 1 << 10

// Handlers are the three things Conn serves.
type Handlers struct {
	Static http.Handler // everything not named below
	Ledger http.Handler // /items/<id> and its stylesheet
	Feed   http.Handler // GET /v1/feed
}

// New builds the handler for the whole site.
func New(h Handlers) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/items/", h.Ledger)
	mux.Handle("/_conn/ledger.css", h.Ledger)
	mux.Handle("/v1/feed", h.Feed)
	mux.Handle("/", h.Static)
	return Headers(Limit(mux))
}

// Headers adds the security headers to every answer, including refusals.
func Headers(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hd := w.Header()
		hd.Set("Content-Security-Policy", "default-src 'self'")
		hd.Set("X-Content-Type-Options", "nosniff")
		hd.Set("X-Frame-Options", "DENY")
		hd.Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

// Limit refuses a request body over MaxBody, and stops reading one that did
// not say how long it is.
func Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.ContentLength > MaxBody {
			http.Error(w, "request body too large", http.StatusRequestEntityTooLarge)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, MaxBody)
		next.ServeHTTP(w, r)
	})
}

// NewServer returns an http.Server with every timeout set. The write timeout
// covers ordinary answers; the feed extends its own deadline for each write.
func NewServer(addr string, h http.Handler) *http.Server {
	return &http.Server{
		Addr:              addr,
		Handler:           h,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    16 << 10,
	}
}
