package feed

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

const token = "conn-token-do-not-leak-0123456789"

// contractStream is the stream in Muster's contract example feed.json, which
// the stand-in replays byte for byte.
func contractStream(t testing.TB) []byte {
	t.Helper()
	raw, err := os.ReadFile("testdata/feed.json")
	if err != nil {
		t.Fatal(err)
	}
	var ex struct {
		Expect struct{ Stream string }
	}
	if err := json.Unmarshal(raw, &ex); err != nil || ex.Expect.Stream == "" {
		t.Fatalf("feed.json: %v", err)
	}
	return []byte(ex.Expect.Stream)
}

func frame(id int, event, data string) []byte {
	return fmt.Appendf(nil, "id: %d\nevent: %s\ndata: %s\n\n", id, event, data)
}

// muster stands in for Muster's GET /v1/feed.
type muster struct {
	srv      *httptest.Server
	initial  []byte
	push     chan []byte
	kill     chan struct{}
	fail     func(attempt int) int // a status other than 0 refuses that attempt
	override http.Handler          // when set, answers instead of the feed

	mu       sync.Mutex
	attempts int
	active   int
	peak     int
	headers  []http.Header
	times    []time.Time
}

func newMuster(t testing.TB, initial []byte) *muster {
	m := &muster{initial: initial, push: make(chan []byte, 64), kill: make(chan struct{}, 64)}
	m.srv = httptest.NewServer(http.HandlerFunc(m.serve))
	t.Cleanup(m.srv.Close)
	return m
}

func (m *muster) serve(w http.ResponseWriter, r *http.Request) {
	if m.override != nil {
		m.override.ServeHTTP(w, r)
		return
	}
	m.mu.Lock()
	m.attempts++
	n := m.attempts
	m.headers = append(m.headers, r.Header.Clone())
	m.times = append(m.times, time.Now())
	m.mu.Unlock()

	if r.Method != "GET" || r.URL.Path != "/v1/feed" || r.Header.Get("Authorization") != "Bearer "+m.currentToken() {
		http.Error(w, `{"error":"E_PARSE","cause":"no_credential","reason":"x"}`, 401)
		return
	}
	if m.fail != nil {
		if code := m.fail(n); code != 0 {
			http.Error(w, "refused", code)
			return
		}
	}
	m.mu.Lock()
	m.active++
	if m.active > m.peak {
		m.peak = m.active
	}
	m.mu.Unlock()
	defer func() { m.mu.Lock(); m.active--; m.mu.Unlock() }()

	w.Header().Set("Content-Type", "text/event-stream")
	w.WriteHeader(200)
	w.Write(m.initial)
	w.(http.Flusher).Flush()
	for {
		select {
		case b := <-m.push:
			w.Write(b)
			w.(http.Flusher).Flush()
		case <-m.kill:
			return
		case <-r.Context().Done():
			return
		}
	}
}

var currentToken atomic.Value

func (m *muster) currentToken() string { return currentToken.Load().(string) }

func (m *muster) stats() (attempts, peak int) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.attempts, m.peak
}

type rig struct {
	m      *muster
	hub    *Hub
	web    *httptest.Server
	cancel context.CancelFunc
	done   chan struct{}
	tokenF string
	logs   *bytes.Buffer
}

type lockedBuf struct {
	mu sync.Mutex
	b  *bytes.Buffer
}

func (l *lockedBuf) Write(p []byte) (int, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.Write(p)
}

func newRig(t *testing.T, initial []byte, opts ...func(*rig)) *rig {
	t.Helper()
	currentToken.Store(token)
	r := &rig{m: newMuster(t, initial), done: make(chan struct{}), logs: &bytes.Buffer{}}
	r.tokenF = filepath.Join(t.TempDir(), "token")
	os.WriteFile(r.tokenF, []byte(token+"\n"), 0o600)
	r.hub = &Hub{
		URL: r.m.srv.URL, TokenFile: r.tokenF,
		MinBackoff: 5 * time.Millisecond, MaxBackoff: 40 * time.Millisecond,
		StallTimeout: 10 * time.Second, KeepAlive: time.Hour, WriteTimeout: 5 * time.Second,
		Log: slog.New(slog.NewTextHandler(&lockedBuf{b: r.logs}, nil)),
	}
	for _, o := range opts {
		o(r)
	}
	r.web = httptest.NewServer(r.hub)
	ctx, cancel := context.WithCancel(context.Background())
	r.cancel = cancel
	go func() { r.hub.Run(ctx); close(r.done) }()
	t.Cleanup(r.stop)
	return r
}

func (r *rig) stop() {
	r.cancel()
	<-r.done
	r.web.Close()
}

// browser opens the feed the way a browser does, with headers that must not
// reach Muster.
func (r *rig) browser(t testing.TB) (*bufio.Reader, func()) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	req, _ := http.NewRequestWithContext(ctx, "GET", r.web.URL+"/v1/feed", nil)
	req.Header.Set("Cookie", "session=browser-cookie")
	req.Header.Set("Authorization", "Bearer browser-supplied")
	req.Header.Set("Last-Event-ID", "41")
	req.Header.Set("X-Forwarded-For", "203.0.113.9")
	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		cancel()
		t.Fatal(err)
	}
	if resp.StatusCode != 200 || !strings.HasPrefix(resp.Header.Get("Content-Type"), "text/event-stream") {
		cancel()
		t.Fatalf("browser got %d %q", resp.StatusCode, resp.Header.Get("Content-Type"))
	}
	return bufio.NewReader(resp.Body), func() { cancel(); resp.Body.Close() }
}

// frames reads n whole frames. A comment block, such as a keep-alive, is not
// a frame and is skipped.
func frames(t testing.TB, br *bufio.Reader, n int) []byte {
	t.Helper()
	var out, block []byte
	for got := 0; got < n; {
		line, err := br.ReadBytes('\n')
		if err != nil {
			t.Errorf("stream ended after %d of %d frames: %v (read %q)", got, n, err, out)
			return out
		}
		if string(line) != "\n" {
			block = append(block, line...)
			continue
		}
		if len(block) > 0 && block[0] != ':' {
			out = append(append(out, block...), '\n')
			got++
		}
		block = nil
	}
	return out
}

func eventually(t testing.TB, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("timed out waiting for %s", what)
		}
		time.Sleep(2 * time.Millisecond)
	}
}

func TestContractExampleReachesTheBrowserUnchanged(t *testing.T) {
	want := contractStream(t)
	r := newRig(t, want)
	br, done := r.browser(t)
	defer done()
	if got := frames(t, br, 3); !bytes.Equal(got, want) {
		t.Errorf("browser got\n%q\nwant\n%q", got, want)
	}
}

func TestOneUpstreamConnectionForManyBrowsers(t *testing.T) {
	r := newRig(t, contractStream(t))
	const browsers = 30
	var wg sync.WaitGroup
	readers := make([]*bufio.Reader, browsers)
	for i := range readers {
		var done func()
		readers[i], done = r.browser(t)
		defer done()
	}
	live := frame(4, "depths", `{"at":"2026-01-05T09:00:05Z","urgent":1,"normal":1,"backfill":0,"needs_subtool":0}`)
	r.m.push <- live
	for i := range readers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			got := frames(t, readers[i], 4)
			if want := append(contractStream(t), live...); !bytes.Equal(got, want) {
				t.Errorf("browser %d got %q", i, got)
			}
		}()
	}
	wg.Wait()
	if attempts, peak := r.m.stats(); attempts != 1 || peak != 1 {
		t.Errorf("Muster saw %d connections, %d at once; want 1 and 1", attempts, peak)
	}
}

func TestLateBrowserGetsTheCurrentPicture(t *testing.T) {
	r := newRig(t, contractStream(t))
	first, done := r.browser(t)
	defer done()
	frames(t, first, 3)
	// assay recovers, and depths change; sextant is unchanged.
	r.m.push <- frame(4, "depths", `{"at":"2026-01-05T09:00:05Z","urgent":0,"normal":7,"backfill":0,"needs_subtool":0}`)
	r.m.push <- frame(5, "health", `{"at":"2026-01-05T09:00:05Z","component":"assay","state":"healthy"}`)
	r.m.push <- frame(6, "edit", `{"at":"2026-01-05T09:00:05Z","id":"EP-0001","status":"approved"}`)
	frames(t, first, 3)

	late, done2 := r.browser(t)
	defer done2()
	want := string(frame(4, "depths", `{"at":"2026-01-05T09:00:05Z","urgent":0,"normal":7,"backfill":0,"needs_subtool":0}`)) +
		string(frame(5, "health", `{"at":"2026-01-05T09:00:05Z","component":"assay","state":"healthy"}`)) +
		string(frame(3, "health", `{"at":"2026-01-05T09:00:00Z","component":"sextant","state":"idle"}`))
	if got := string(frames(t, late, 3)); got != want {
		t.Errorf("late browser got\n%q\nwant\n%q", got, want)
	}
}

func TestBrowserHeadersAndTokenStayApart(t *testing.T) {
	r := newRig(t, contractStream(t))
	br, done := r.browser(t)
	defer done()
	body := frames(t, br, 3)
	if bytes.Contains(body, []byte(token)) {
		t.Error("the token reached a browser body")
	}
	r.m.mu.Lock()
	defer r.m.mu.Unlock()
	h := r.m.headers[0]
	if h.Get("Authorization") != "Bearer "+token {
		t.Errorf("Muster saw Authorization %q", h.Get("Authorization"))
	}
	for _, name := range []string{"Cookie", "Last-Event-Id", "X-Forwarded-For"} {
		if h.Get(name) != "" {
			t.Errorf("browser header %s reached Muster: %q", name, h.Get(name))
		}
	}
	if h.Get("Accept") != "text/event-stream" {
		t.Errorf("Accept = %q", h.Get("Accept"))
	}
}

func TestResponseHeadersToBrowser(t *testing.T) {
	r := newRig(t, contractStream(t))
	resp, err := http.Get(r.web.URL + "/v1/feed")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	for k, want := range map[string]string{"Content-Type": "text/event-stream", "Cache-Control": "no-store", "X-Accel-Buffering": "no"} {
		if got := resp.Header.Get(k); got != want {
			t.Errorf("%s = %q, want %q", k, got, want)
		}
	}
	for k := range resp.Header {
		if strings.EqualFold(k, "Authorization") || strings.Contains(strings.ToLower(k), "token") {
			t.Errorf("header %s on the browser response", k)
		}
	}
	post, _ := http.Post(r.web.URL+"/v1/feed", "text/plain", strings.NewReader("x"))
	if post.StatusCode != 405 {
		t.Errorf("POST = %d", post.StatusCode)
	}
	post.Body.Close()
}

func TestSlowBrowserIsDroppedAndOthersAreNot(t *testing.T) {
	h := &Hub{}
	slow, err := h.subscribe()
	if err != nil {
		t.Fatal(err)
	}
	fast, _ := h.subscribe()
	var got atomic.Int64
	fastDone := make(chan struct{})
	go func() {
		defer close(fastDone)
		for range fast.ch {
			got.Add(1)
		}
	}()
	const total = 5 * queued
	start := time.Now()
	for i := 0; i < total; i++ {
		h.publish(frame(i, "depths", "{}"))
		if i%8 == 0 {
			time.Sleep(50 * time.Microsecond) // let the reader keep up
		}
	}
	if d := time.Since(start); d > 2*time.Second {
		t.Errorf("publishing blocked on a slow browser for %v", d)
	}
	// slow never read: its channel is closed once drained.
	n := 0
	for range slow.ch {
		n++
	}
	if n > queued {
		t.Errorf("slow browser was handed %d frames, more than its queue of %d", n, queued)
	}
	if h.subscribers() != 1 {
		t.Errorf("%d subscribers left, want only the fast one", h.subscribers())
	}
	h.unsubscribe(fast)
	<-fastDone
	if got.Load() == 0 {
		t.Error("the fast browser got nothing")
	}
}

func TestSlowHTTPBrowserIsDropped(t *testing.T) {
	r := newRig(t, contractStream(t), func(r *rig) { r.hub.WriteTimeout = 300 * time.Millisecond })
	// A browser that connects and never reads.
	conn, err := (&http.Client{}).Get(r.web.URL + "/v1/feed")
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Body.Close()
	eventually(t, "the silent browser to subscribe", func() bool { return r.hub.subscribers() == 1 })
	big := frame(9, "health", `{"at":"x","component":"c","state":"healthy","pad":"`+strings.Repeat("p", 4000)+`"}`)
	for i := 0; i < 4000 && r.hub.subscribers() > 0; i++ {
		select {
		case r.m.push <- big:
		case <-time.After(5 * time.Millisecond):
		}
	}
	eventually(t, "the silent browser to be dropped", func() bool { return r.hub.subscribers() == 0 })
}

// recordWaits makes the hub record every backoff it is asked to wait and wait
// only a moment.
func recordWaits(out *[]time.Duration, mu *sync.Mutex) func(*rig) {
	return func(r *rig) {
		r.hub.Wait = func(ctx context.Context, d time.Duration) bool {
			mu.Lock()
			*out = append(*out, d)
			mu.Unlock()
			select {
			case <-ctx.Done():
				return false
			case <-time.After(time.Millisecond):
				return true
			}
		}
	}
}

func TestBackoffDoublesToTheCapThenResetsAfterAGoodConnection(t *testing.T) {
	var mu sync.Mutex
	var waits []time.Duration
	r := newRig(t, contractStream(t),
		recordWaits(&waits, &mu),
		func(r *rig) {
			r.hub.MinBackoff, r.hub.MaxBackoff = 10*time.Millisecond, 40*time.Millisecond
			r.m.fail = func(n int) int {
				if n <= 5 {
					return 503
				}
				return 0
			}
		})
	// Five refusals, then a good connection.
	br, done := r.browser(t)
	defer done()
	frames(t, br, 3)
	mu.Lock()
	got := append([]time.Duration(nil), waits...)
	mu.Unlock()
	want := []time.Duration{10, 20, 40, 40, 40}
	if len(got) < len(want) {
		t.Fatalf("waits = %v", got)
	}
	for i, w := range want {
		if got[i] != w*time.Millisecond {
			t.Errorf("wait %d = %v, want %v (all: %v)", i, got[i], w*time.Millisecond, got)
		}
	}
	// The good connection ends; the next wait starts from the minimum again.
	mu.Lock()
	waits = nil
	mu.Unlock()
	r.m.kill <- struct{}{}
	eventually(t, "a wait after the good connection", func() bool { mu.Lock(); defer mu.Unlock(); return len(waits) > 0 })
	mu.Lock()
	first := waits[0]
	mu.Unlock()
	if first != 10*time.Millisecond {
		t.Errorf("first wait after a good connection = %v, want the minimum", first)
	}
}

func TestUpstreamLossDisconnectsBrowsersAndTheyGetAFreshPictureOnReturn(t *testing.T) {
	r := newRig(t, contractStream(t))
	br, done := r.browser(t)
	defer done()
	frames(t, br, 3)
	r.m.kill <- struct{}{}
	if _, err := io.ReadAll(br); err != nil {
		t.Fatalf("browser stream did not end cleanly: %v", err)
	}
	eventually(t, "Conn to reconnect", func() bool { a, _ := r.m.stats(); return a >= 2 })
	br2, done2 := r.browser(t)
	defer done2()
	if got := frames(t, br2, 3); !bytes.Equal(got, contractStream(t)) {
		t.Errorf("after reconnect the browser got %q", got)
	}
}

func TestTokenIsReadAgainOnEveryConnection(t *testing.T) {
	r := newRig(t, contractStream(t))
	br, done := r.browser(t)
	defer done()
	frames(t, br, 3)
	os.WriteFile(r.tokenF, []byte("rotated-token\n"), 0o600)
	currentToken.Store("rotated-token")
	r.m.kill <- struct{}{}
	eventually(t, "a connection with the rotated token", func() bool {
		r.m.mu.Lock()
		defer r.m.mu.Unlock()
		n := len(r.m.headers)
		return n >= 2 && r.m.headers[n-1].Get("Authorization") == "Bearer rotated-token"
	})
}

func TestSilentUpstreamIsReconnected(t *testing.T) {
	r := newRig(t, nil, func(r *rig) { r.hub.StallTimeout = 40 * time.Millisecond })
	eventually(t, "reconnects after silence", func() bool { a, _ := r.m.stats(); return a >= 3 })
}

func TestRedirectIsNotFollowed(t *testing.T) {
	var hits atomic.Int32
	other := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		if r.Header.Get("Authorization") != "" {
			t.Error("the token followed a redirect")
		}
	}))
	defer other.Close()
	r := newRig(t, nil, func(r *rig) { r.m.override = http.RedirectHandler(other.URL, 302) })
	eventually(t, "attempts", func() bool { return r.hub.attempts.Load() >= 2 })
	if hits.Load() != 0 {
		t.Errorf("the redirect target was contacted %d times", hits.Load())
	}
}

func TestNotAnEventStreamIsRefused(t *testing.T) {
	r := newRig(t, nil, func(r *rig) {
		r.m.override = http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "text/html")
			io.WriteString(w, "id: 1\nevent: depths\ndata: {}\n\n")
		})
	})
	br, done := r.browser(t)
	defer done()
	go func() { time.Sleep(200 * time.Millisecond); r.cancel() }()
	if rest, _ := io.ReadAll(br); len(rest) != 0 {
		t.Errorf("a non-SSE upstream body reached the browser: %q", rest)
	}
}

func TestOversizedFrameIsRefused(t *testing.T) {
	r := newRig(t, nil)
	br, done := r.browser(t)
	defer done()
	eventually(t, "the first connection", func() bool { a, _ := r.m.stats(); return a >= 1 })
	r.m.push <- frame(1, "health", `{"pad":"`+strings.Repeat("x", maxFrame+10)+`"}`)
	if rest, _ := io.ReadAll(br); len(rest) != 0 {
		t.Errorf("an oversized frame reached the browser (%d bytes)", len(rest))
	}
}

func TestTooManyBrowsers(t *testing.T) {
	r := newRig(t, contractStream(t), func(r *rig) { r.hub.MaxSubscribers = 2 })
	for i := 0; i < 2; i++ {
		_, done := r.browser(t)
		defer done()
	}
	resp, err := http.Get(r.web.URL + "/v1/feed")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 503 || resp.Header.Get("Retry-After") == "" {
		t.Errorf("third browser got %d", resp.StatusCode)
	}
}

func TestKeepAliveCommentWhileIdle(t *testing.T) {
	r := newRig(t, nil, func(r *rig) { r.hub.KeepAlive = 20 * time.Millisecond })
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, "GET", r.web.URL+"/v1/feed", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	br := bufio.NewReader(resp.Body)
	for i := 0; i < 2; i++ {
		line, err := br.ReadString('\n')
		if err != nil || !strings.HasPrefix(line, ":") {
			t.Fatalf("line %q, err %v: want a comment", line, err)
		}
		br.ReadString('\n')
	}
}

func TestShutdownEndsEveryBrowserStream(t *testing.T) {
	r := newRig(t, contractStream(t))
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		br, done := r.browser(t)
		defer done()
		frames(t, br, 3)
		wg.Add(1)
		go func() { defer wg.Done(); io.Copy(io.Discard, br) }()
	}
	r.cancel()
	waitDone := make(chan struct{})
	go func() { wg.Wait(); close(waitDone) }()
	select {
	case <-waitDone:
	case <-time.After(5 * time.Second):
		t.Fatal("browser streams stayed open after shutdown")
	}
	resp, err := http.Get(r.web.URL + "/v1/feed")
	if err == nil {
		defer resp.Body.Close()
		if resp.StatusCode != 503 {
			t.Errorf("after shutdown a new browser got %d", resp.StatusCode)
		}
	}
}

func TestLogsNeverHoldTheTokenOrTheUpstreamAddressCredentials(t *testing.T) {
	r := newRig(t, nil, func(r *rig) {
		r.m.fail = func(int) int { return 503 }
	})
	eventually(t, "some failed attempts", func() bool { a, _ := r.m.stats(); return a >= 3 })
	r.stop()
	out := r.logs.String()
	if out == "" {
		t.Error("nothing was logged about refused connections")
	}
	for _, leak := range []string{token, r.m.srv.URL, "Bearer"} {
		if strings.Contains(out, leak) {
			t.Errorf("log leaks %q:\n%s", leak, out)
		}
	}
}

func TestNoGoroutinesLeftAfterBrowsersLeave(t *testing.T) {
	r := newRig(t, contractStream(t))
	base := settled(t)
	const browsers = 40
	var wg sync.WaitGroup
	for i := 0; i < browsers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			br, done := r.browser(t)
			frames(t, br, 3)
			done()
		}()
	}
	wg.Wait()
	eventually(t, "every browser to be forgotten", func() bool { return r.hub.subscribers() == 0 })
	// Keep-alive connections of the test client and server are part of what
	// the delta measures, so close the client's idle ones first.
	http.DefaultClient.CloseIdleConnections()
	after := settled(t)
	if after-base > 2 {
		t.Errorf("goroutines: %d before the browsers, %d after they left", base, after)
	}

	// And when Conn itself stops, nothing of the hub remains.
	r.stop()
	r.m.srv.Close()
	end := settled(t)
	if end > base-1 { // the hub's own goroutines are gone, so strictly fewer than with it running
		t.Errorf("goroutines: %d with the hub running, %d after it stopped", base, end)
	}
}

// settled waits for the goroutine count to stop changing and returns it.
func settled(t testing.TB) int {
	t.Helper()
	last, stable := -1, 0
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		runtime.GC()
		n := runtime.NumGoroutine()
		if n == last {
			if stable++; stable >= 10 {
				return n
			}
		} else {
			last, stable = n, 0
		}
		time.Sleep(10 * time.Millisecond)
	}
	return last
}

func TestRaceManyBrowsersComingAndGoing(t *testing.T) {
	r := newRig(t, contractStream(t))
	stop := make(chan struct{})
	var pushed sync.WaitGroup
	pushed.Add(1)
	go func() {
		defer pushed.Done()
		for i := 4; ; i++ {
			select {
			case <-stop:
				return
			case r.m.push <- frame(i, "depths", "{}"):
				time.Sleep(time.Millisecond)
			}
		}
	}()
	var wg sync.WaitGroup
	for i := 0; i < 16; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 5; j++ {
				br, done := r.browser(t)
				frames(t, br, 4)
				done()
			}
		}()
	}
	wg.Wait()
	close(stop)
	pushed.Wait()
}
