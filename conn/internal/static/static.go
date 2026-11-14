// Package static serves the Next.js export. It behaves like the nginx
// configuration it replaces: every page is a folder with an index.html,
// anything else is the 404 page, and nothing outside the export directory or
// whose name starts with a dot is ever served.
package static

import (
	"errors"
	"io"
	"mime"
	"net/http"
	"os"
	"path"
	"strings"
	"unicode/utf8"
)

// Handler serves one export directory.
type Handler struct {
	root *os.Root
}

// New opens dir. It fails if dir is not a directory.
func New(dir string) (*Handler, error) {
	root, err := os.OpenRoot(dir)
	if err != nil {
		return nil, err
	}
	st, err := root.Stat(".")
	if err != nil || !st.IsDir() {
		root.Close()
		return nil, errors.New("static: not a directory")
	}
	return &Handler{root: root}, nil
}

// Close releases the directory.
func (h *Handler) Close() error { return h.root.Close() }

// resolve turns a URL path into a name relative to the export root. The name
// is empty for the root itself. slash reports a trailing slash. ok is false for
// anything that is not a plain path of plain names: an empty segment, ".", "..",
// a name that starts with a dot, a backslash, a NUL or bytes that are not UTF-8.
func resolve(p string) (name string, slash, ok bool) {
	if !strings.HasPrefix(p, "/") || strings.ContainsAny(p, "\\\x00") || !utf8.ValidString(p) {
		return "", false, false
	}
	if p == "/" {
		return "", true, true
	}
	slash = strings.HasSuffix(p, "/")
	name = strings.TrimSuffix(p[1:], "/")
	for _, seg := range strings.Split(name, "/") {
		if seg == "" || seg[0] == '.' {
			return "", false, false
		}
	}
	return name, slash, true
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	name, slash, ok := resolve(r.URL.Path)
	if !ok {
		h.NotFound(w, r)
		return
	}
	file := name
	if slash {
		file = path.Join(name, "index.html")
	}
	f, err := h.root.Open(file)
	if err != nil {
		h.NotFound(w, r)
		return
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil {
		h.NotFound(w, r)
		return
	}
	if st.IsDir() {
		// A page without its trailing slash: send the browser to the page.
		if _, err := h.root.Stat(path.Join(name, "index.html")); err != nil {
			h.NotFound(w, r)
			return
		}
		http.Redirect(w, r, r.URL.Path+"/", http.StatusMovedPermanently)
		return
	}
	if ct := contentType(file); ct != "" {
		w.Header().Set("Content-Type", ct)
	}
	if strings.HasPrefix(name, "_next/static/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	}
	http.ServeContent(w, r, st.Name(), st.ModTime(), f)
}

// NotFound answers with the export's 404.html and status 404, or a plain
// text 404 if the export has none.
func (h *Handler) NotFound(w http.ResponseWriter, r *http.Request) {
	// The 404 page is a page of the export, so it has the export's policy
	// (none), even when a strict handler of Conn's asked for it.
	w.Header().Del("Content-Security-Policy")
	f, err := h.root.Open("404.html")
	if err != nil {
		http.Error(w, "404 page not found", http.StatusNotFound)
		return
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil || st.IsDir() {
		http.Error(w, "404 page not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)
	if r.Method == http.MethodHead {
		return
	}
	io.Copy(w, io.LimitReader(f, 1<<20))
}

// contentType names UTF-8 for the text types the site publishes, as the nginx
// configuration did. Other types are left to net/http.
func contentType(file string) string {
	switch path.Ext(file) {
	case ".md":
		return "text/markdown; charset=utf-8"
	case ".json", ".txt":
		t, _, _ := strings.Cut(mime.TypeByExtension(path.Ext(file)), ";")
		if t == "" {
			return ""
		}
		return t + "; charset=utf-8"
	}
	return ""
}
