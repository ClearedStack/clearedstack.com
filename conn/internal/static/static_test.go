package static

import (
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func site(t *testing.T) http.Handler {
	t.Helper()
	outside := t.TempDir()
	write(t, outside, "secret.txt", "outside the export")
	dir := t.TempDir()
	write(t, dir, "index.html", "home")
	write(t, dir, "404.html", "custom missing page")
	write(t, dir, "guides/one/index.html", "guide one")
	write(t, dir, "guides/one/page.md", "# md")
	write(t, dir, "_next/static/a.js", "js")
	write(t, dir, "data.json", "{}")
	write(t, dir, ".env", "TOKEN=nope")
	write(t, dir, ".git/config", "nope")
	write(t, dir, "guides/.hidden/index.html", "nope")
	write(t, dir, "empty/readme.txt", "no index here")
	if err := os.Symlink(filepath.Join(outside, "secret.txt"), filepath.Join(dir, "link.txt")); err != nil {
		t.Fatal(err)
	}
	h, err := New(dir)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { h.Close() })
	return h
}

func write(t *testing.T, dir, name, body string) {
	t.Helper()
	p := filepath.Join(dir, name)
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

func get(h http.Handler, method, target string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, target, nil))
	return rec
}

func TestServes(t *testing.T) {
	h := site(t)
	for _, tc := range []struct{ path, body, ctype string }{
		{"/", "home", "text/html; charset=utf-8"},
		{"/guides/one/", "guide one", "text/html; charset=utf-8"},
		{"/guides/one/page.md", "# md", "text/markdown; charset=utf-8"},
		{"/data.json", "{}", "application/json; charset=utf-8"},
		{"/_next/static/a.js", "js", ""},
	} {
		rec := get(h, "GET", tc.path)
		if rec.Code != 200 || rec.Body.String() != tc.body {
			t.Errorf("GET %s = %d %q, want 200 %q", tc.path, rec.Code, rec.Body.String(), tc.body)
		}
		if tc.ctype != "" && rec.Header().Get("Content-Type") != tc.ctype {
			t.Errorf("GET %s content type %q, want %q", tc.path, rec.Header().Get("Content-Type"), tc.ctype)
		}
	}
	if cc := get(h, "GET", "/_next/static/a.js").Header().Get("Cache-Control"); !strings.Contains(cc, "immutable") {
		t.Errorf("hashed build output Cache-Control = %q", cc)
	}
	if rec := get(h, "HEAD", "/"); rec.Code != 200 || rec.Body.Len() != 0 {
		t.Errorf("HEAD / = %d with %d body bytes", rec.Code, rec.Body.Len())
	}
}

func TestDirectoryWithoutSlashRedirects(t *testing.T) {
	rec := get(site(t), "GET", "/guides/one")
	if rec.Code != 301 || rec.Header().Get("Location") != "/guides/one/" {
		t.Errorf("got %d %q", rec.Code, rec.Header().Get("Location"))
	}
}

func TestNotFoundUsesThe404Page(t *testing.T) {
	h := site(t)
	for _, p := range []string{"/nope", "/nope/", "/empty/", "/empty", "/guides/"} {
		rec := get(h, "GET", p)
		if rec.Code != 404 || rec.Body.String() != "custom missing page" {
			t.Errorf("GET %s = %d %q", p, rec.Code, rec.Body.String())
		}
	}
}

func TestRefused(t *testing.T) {
	h := site(t)
	for _, p := range []string{
		"/.env", "/.git/config", "/guides/.hidden/", "/guides/.hidden/index.html",
		"/../secret.txt", "/%2e%2e/secret.txt", "/guides/../../secret.txt", "/link.txt",
		"/..%2fsecret.txt", "/a%00b", "/\\secret.txt", "//etc/passwd", "/guides//one/",
	} {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/", nil)
		req.URL.Path = rawPath(p)
		h.ServeHTTP(rec, req)
		body, _ := io.ReadAll(rec.Body)
		if rec.Code != 404 {
			t.Errorf("GET %q = %d, want 404", p, rec.Code)
		}
		for _, leak := range []string{"TOKEN=nope", "outside the export", "nope"} {
			if string(body) == leak {
				t.Errorf("GET %q leaked %q", p, leak)
			}
		}
	}
}

// rawPath decodes the percent escapes the way net/http does before a handler
// sees them, so the table above can be written the way an attacker sends it.
func rawPath(p string) string {
	r := strings.NewReplacer("%2e", ".", "%2f", "/", "%00", "\x00")
	return r.Replace(p)
}

func TestMethods(t *testing.T) {
	rec := get(site(t), "POST", "/")
	if rec.Code != 405 || rec.Header().Get("Allow") != "GET, HEAD" {
		t.Errorf("POST / = %d allow %q", rec.Code, rec.Header().Get("Allow"))
	}
}

func TestMissing404PageFallsBackToPlainText(t *testing.T) {
	dir := t.TempDir()
	h, err := New(dir)
	if err != nil {
		t.Fatal(err)
	}
	defer h.Close()
	rec := get(h, "GET", "/x")
	if rec.Code != 404 || !strings.HasPrefix(rec.Header().Get("Content-Type"), "text/plain") {
		t.Errorf("got %d %q", rec.Code, rec.Header().Get("Content-Type"))
	}
}

func TestNewRefusesAMissingDirectory(t *testing.T) {
	if _, err := New(filepath.Join(t.TempDir(), "absent")); err == nil {
		t.Error("New of a missing directory succeeded")
	}
	f := filepath.Join(t.TempDir(), "file")
	os.WriteFile(f, nil, 0o644)
	if _, err := New(f); err == nil {
		t.Error("New of a plain file succeeded")
	}
}

func TestResolve(t *testing.T) {
	for _, tc := range []struct {
		in    string
		name  string
		slash bool
		ok    bool
	}{
		{"/", "", true, true},
		{"/a", "a", false, true},
		{"/a/", "a", true, true},
		{"/a/b.css", "a/b.css", false, true},
		{"", "", false, false},
		{"a", "", false, false},
		{"/.a", "", false, false},
		{"/a/..", "", false, false},
		{"/a//b", "", false, false},
	} {
		name, slash, ok := resolve(tc.in)
		if ok != tc.ok || (ok && (name != tc.name || slash != tc.slash)) {
			t.Errorf("resolve(%q) = %q %v %v, want %q %v %v", tc.in, name, slash, ok, tc.name, tc.slash, tc.ok)
		}
	}
}

func FuzzResolve(f *testing.F) {
	for _, s := range []string{"/", "/a/b", "/../x", "/.env", "/a//b", "/a\\b", "/a\x00", "/%2e%2e/", "/a/./b", "//", "/a/", "/..."} {
		f.Add(s)
	}
	f.Fuzz(func(t *testing.T, p string) {
		name, _, ok := resolve(p)
		if !ok {
			return
		}
		if name == "" {
			return // the site root
		}
		if !fsValid(name) || strings.ContainsAny(name, "\\\x00") || strings.HasPrefix(name, "/") {
			t.Fatalf("resolve(%q) accepted unsafe name %q", p, name)
		}
		for _, seg := range strings.Split(name, "/") {
			if seg == "" || strings.HasPrefix(seg, ".") {
				t.Fatalf("resolve(%q) accepted name %q with segment %q", p, name, seg)
			}
		}
	})
}
