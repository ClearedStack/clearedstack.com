// Package feed proxies Muster's live feed (GET /v1/feed, Server-Sent Events)
// to browsers.
//
// Muster serves at most eight subscribers, so Conn holds one upstream
// connection and fans every frame out to the browsers. Frames pass through
// line for line. Because Muster sends a new subscriber the current picture
// once, on connect, the hub keeps the latest depths frame and the latest
// health frame of each component and replays them to a browser that joins
// later; a joining browser then sees what a direct subscriber would have seen.
//
// A browser that cannot keep up is dropped, never waited for. When the
// upstream connection ends, every browser is disconnected, the picture is
// forgotten and the hub reconnects with a growing wait; the browsers'
// EventSource reconnects on its own and is held, silent, until Muster is
// back, so the page's own stale-feed indicator takes over.
//
// The bearer token is read from a file on every upstream connection, because
// the cluster rotates it. Nothing from a browser request is sent to Muster,
// and the token and the upstream address are never logged or sent to a
// browser.
package feed

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"mime"
	"net"
	"net/http"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/ClearedStack/clearedstack.com/conn/internal/config"
)

const (
	queued        = 128      // frames waiting for one browser before it is dropped
	maxFrame      = 16 << 10 // the largest frame accepted from Muster
	maxComponents = 64       // health frames kept for late browsers; Muster takes at most 64 reports a batch
)

// Why an upstream connection ended. Only these words are logged: an error from
// net/http can quote the address.
var (
	errToken     = errors.New("the token file could not be read")
	errConnect   = errors.New("could not connect")
	errNotStream = errors.New("the answer was not an event stream")
	errTooBig    = errors.New("a frame was too large")
	errEnded     = errors.New("the stream ended")
	errStalled   = errors.New("the stream went silent")
)

var (
	errClosed = errors.New("feed: shut down")
	errFull   = errors.New("feed: no room for another browser")
)

// Hub is the one upstream connection and the browsers it feeds. The zero
// value needs URL and TokenFile; everything else has a default.
type Hub struct {
	URL       string       // Muster's address, scheme and host
	TokenFile string       // the file holding the bearer token
	Client    *http.Client // nil: no proxy, no redirects, header timeout 10s
	Log       *slog.Logger // nil: no log

	MinBackoff     time.Duration // default 1s
	MaxBackoff     time.Duration // default 30s
	StallTimeout   time.Duration // silence after which the upstream is reconnected; default 20s (Muster speaks every 5s)
	KeepAlive      time.Duration // comment sent to an idle browser; default 20s
	WriteTimeout   time.Duration // one write to one browser; default 10s
	MaxSubscribers int           // default 256

	// Wait sleeps between upstream attempts and reports false if ctx ended
	// first. It is a seam for tests.
	Wait func(ctx context.Context, d time.Duration) bool

	attempts atomic.Int32

	mu     sync.Mutex
	closed bool
	subs   map[*subscriber]struct{}
	depths []byte
	health map[string][]byte
}

type subscriber struct{ ch chan []byte }

func def(d, fallback time.Duration) time.Duration {
	if d > 0 {
		return d
	}
	return fallback
}

func (h *Hub) log() *slog.Logger {
	if h.Log != nil {
		return h.Log
	}
	return slog.New(slog.DiscardHandler)
}

// Run holds the upstream connection until ctx ends, then disconnects every
// browser and takes no more.
func (h *Hub) Run(ctx context.Context) {
	defer func() {
		h.mu.Lock()
		h.closed = true
		h.reset()
		h.mu.Unlock()
	}()
	minWait, maxWait := def(h.MinBackoff, time.Second), def(h.MaxBackoff, 30*time.Second)
	wait := h.Wait
	if wait == nil {
		wait = sleep
	}
	delay := minWait
	for {
		connected, got, err := h.stream(ctx)
		if connected {
			// Browsers that joined while Muster was unreachable are kept
			// waiting; only a stream that was up takes its browsers with it.
			h.mu.Lock()
			h.reset()
			h.mu.Unlock()
		}
		if ctx.Err() != nil {
			return
		}
		if got {
			delay = minWait
		}
		h.log().Warn("muster feed lost", "why", err.Error(), "retry_in", delay.String())
		if !wait(ctx, delay) {
			return
		}
		delay = min(delay*2, maxWait)
	}
}

func sleep(ctx context.Context, d time.Duration) bool {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-t.C:
		return true
	}
}

func (h *Hub) client() *http.Client {
	if h.Client != nil {
		return h.Client
	}
	return &http.Client{
		Transport: &http.Transport{
			Proxy:                 nil, // no network but Muster's
			DialContext:           (&net.Dialer{Timeout: 5 * time.Second}).DialContext,
			TLSHandshakeTimeout:   5 * time.Second,
			ResponseHeaderTimeout: 10 * time.Second,
			MaxIdleConns:          1,
		},
		// A redirect would carry the token to another host.
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
	}
}

// stream makes one upstream connection and publishes its frames until it
// ends. connected reports whether Muster accepted the connection, and got
// whether any frame arrived. The error is one of the fixed ones above or names
// only a status code.
func (h *Hub) stream(ctx context.Context) (connected, got bool, err error) {
	h.attempts.Add(1)
	token, err := config.ReadSecret(h.TokenFile)
	if err != nil {
		return false, false, errToken
	}
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	// Only these headers go to Muster. Nothing comes from a browser.
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimSuffix(h.URL, "/")+"/v1/feed", nil)
	if err != nil {
		return false, false, errConnect
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "text/event-stream")
	resp, err := h.client().Do(req)
	if err != nil {
		return false, false, errConnect
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return false, false, fmt.Errorf("muster answered %d", resp.StatusCode)
	}
	if mt, _, _ := mime.ParseMediaType(resp.Header.Get("Content-Type")); mt != "text/event-stream" {
		return false, false, errNotStream
	}

	connected = true
	var stalled atomic.Bool
	silence := def(h.StallTimeout, 20*time.Second)
	timer := time.AfterFunc(silence, func() { stalled.Store(true); cancel() })
	defer timer.Stop()

	sc := bufio.NewScanner(resp.Body)
	sc.Buffer(make([]byte, 0, 4096), maxFrame)
	var block []byte
	for sc.Scan() {
		timer.Reset(silence)
		line := sc.Bytes()
		if len(line) == 0 {
			if len(block) > 0 {
				h.publish(append(block, '\n'))
				got = true
				block = nil
			}
			continue
		}
		if len(block)+len(line)+1 > maxFrame {
			return true, got, errTooBig
		}
		block = append(append(block, line...), '\n')
	}
	switch {
	case stalled.Load():
		return true, got, errStalled
	case errors.Is(sc.Err(), bufio.ErrTooLong):
		return true, got, errTooBig
	}
	return true, got, errEnded
}

// publish sends one frame to every browser and remembers it if it is part of
// the current picture. It never waits: a browser with a full queue is dropped.
func (h *Hub) publish(frame []byte) {
	event, component := classify(frame)
	h.mu.Lock()
	defer h.mu.Unlock()
	switch event {
	case "depths":
		h.depths = frame
	case "health":
		if _, known := h.health[component]; known || (component != "" && len(h.health) < maxComponents) {
			if h.health == nil {
				h.health = map[string][]byte{}
			}
			h.health[component] = frame
		}
	}
	for s := range h.subs {
		select {
		case s.ch <- frame:
		default:
			h.drop(s)
		}
	}
}

// classify reads the event name of a frame and, for a health event, the
// component it is about.
func classify(frame []byte) (event, component string) {
	var data string
	for _, line := range strings.Split(string(frame), "\n") {
		if v, ok := strings.CutPrefix(line, "event:"); ok {
			event = strings.TrimSpace(v)
		} else if v, ok := strings.CutPrefix(line, "data:"); ok {
			data = strings.TrimSpace(v)
		}
	}
	if event == "health" {
		var d struct {
			Component string `json:"component"`
		}
		if json.Unmarshal([]byte(data), &d) == nil && len(d.Component) <= 100 {
			component = d.Component
		}
	}
	return event, component
}

// subscribe adds a browser, first queuing the current picture for it: the
// depths, then the health of each component by name, as Muster sends them.
func (h *Hub) subscribe() (*subscriber, error) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.closed {
		return nil, errClosed
	}
	limit := h.MaxSubscribers
	if limit <= 0 {
		limit = 256
	}
	if len(h.subs) >= limit {
		return nil, errFull
	}
	s := &subscriber{ch: make(chan []byte, queued)}
	if h.depths != nil {
		s.ch <- h.depths
	}
	names := make([]string, 0, len(h.health))
	for name := range h.health {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		s.ch <- h.health[name]
	}
	if h.subs == nil {
		h.subs = map[*subscriber]struct{}{}
	}
	h.subs[s] = struct{}{}
	return s, nil
}

func (h *Hub) unsubscribe(s *subscriber) {
	h.mu.Lock()
	h.drop(s)
	h.mu.Unlock()
}

func (h *Hub) subscribers() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.subs)
}

// drop forgets one browser and closes its queue. The caller holds the lock.
func (h *Hub) drop(s *subscriber) {
	if _, ok := h.subs[s]; ok {
		delete(h.subs, s)
		close(s.ch)
	}
}

// reset drops every browser and forgets the picture. The caller holds the lock.
func (h *Hub) reset() {
	for s := range h.subs {
		h.drop(s)
	}
	h.depths, h.health = nil, nil
}

// ServeHTTP streams the feed to one browser.
func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	s, err := h.subscribe()
	if err != nil {
		w.Header().Set("Retry-After", "5")
		http.Error(w, "The live feed is not available right now.", http.StatusServiceUnavailable)
		return
	}
	defer h.unsubscribe(s)

	hd := w.Header()
	hd.Set("Content-Type", "text/event-stream")
	hd.Set("Cache-Control", "no-store")
	hd.Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	rc := http.NewResponseController(w)
	writeTimeout := def(h.WriteTimeout, 10*time.Second)
	write := func(b []byte) bool {
		// The server's own write timeout would end a stream that is working,
		// so each write gets a fresh deadline of its own.
		rc.SetWriteDeadline(time.Now().Add(writeTimeout))
		if _, err := w.Write(b); err != nil {
			return false
		}
		err := rc.Flush()
		return err == nil || errors.Is(err, http.ErrNotSupported)
	}
	if !write(nil) {
		return
	}
	tick := time.NewTicker(def(h.KeepAlive, 20*time.Second))
	defer tick.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case f, ok := <-s.ch:
			if !ok || !write(f) {
				return
			}
		case <-tick.C:
			if !write([]byte(": keepalive\n\n")) {
				return
			}
		}
	}
}
