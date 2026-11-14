package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const (
	dbSecret    = "hunter2-db-password"
	tokenSecret = "tok-abcdef-secret"
)

type fixture struct {
	env map[string]string
}

func newFixture(t *testing.T) *fixture {
	t.Helper()
	d := t.TempDir()
	must := func(name, body string) string {
		p := filepath.Join(d, name)
		if err := os.WriteFile(p, []byte(body), 0o600); err != nil {
			t.Fatal(err)
		}
		return p
	}
	site := filepath.Join(d, "site")
	os.Mkdir(site, 0o755)
	return &fixture{env: map[string]string{
		"CONN_STATIC_DIR":             site,
		"CONN_DATABASE_URL":           "postgres://pub_ro@logbook.example.invalid:5432/logbook?sslmode=disable",
		"CONN_DATABASE_PASSWORD_FILE": must("dbpass", dbSecret+"\n"),
		"CONN_MUSTER_URL":             "http://muster.example.invalid:8080",
		"CONN_MUSTER_TOKEN_FILE":      must("token", tokenSecret+"\n"),
	}}
}

func (f *fixture) load() (Config, error) {
	return Load(func(k string) string { return f.env[k] })
}

func TestLoadGood(t *testing.T) {
	f := newFixture(t)
	c, err := f.load()
	if err != nil {
		t.Fatal(err)
	}
	if c.Listen != ":8080" {
		t.Errorf("default listen = %q", c.Listen)
	}
	if string(c.DatabasePassword) != dbSecret {
		t.Error("password file not read, or not trimmed")
	}
	if c.MusterURL != "http://muster.example.invalid:8080" || c.MusterTokenFile != f.env["CONN_MUSTER_TOKEN_FILE"] {
		t.Errorf("muster settings wrong: %+v", c)
	}
}

func TestLoadPasswordFileIsOptional(t *testing.T) {
	f := newFixture(t)
	delete(f.env, "CONN_DATABASE_PASSWORD_FILE")
	if _, err := f.load(); err != nil {
		t.Fatal(err)
	}
}

func TestLoadFailsClosed(t *testing.T) {
	for name, mutate := range map[string]func(*fixture){
		"no static dir":          func(f *fixture) { delete(f.env, "CONN_STATIC_DIR") },
		"static dir is a file":   func(f *fixture) { f.env["CONN_STATIC_DIR"] = f.env["CONN_MUSTER_TOKEN_FILE"] },
		"static dir missing":     func(f *fixture) { f.env["CONN_STATIC_DIR"] += "/absent" },
		"no database url":        func(f *fixture) { delete(f.env, "CONN_DATABASE_URL") },
		"garbled database url":   func(f *fixture) { f.env["CONN_DATABASE_URL"] = "postgres://pub_ro:%zz@h/db" },
		"wrong role":             func(f *fixture) { f.env["CONN_DATABASE_URL"] = "postgres://muster@h/db" },
		"no role":                func(f *fixture) { f.env["CONN_DATABASE_URL"] = "postgres://h/db" },
		"password file missing":  func(f *fixture) { f.env["CONN_DATABASE_PASSWORD_FILE"] += ".absent" },
		"password file empty":    func(f *fixture) { os.WriteFile(f.env["CONN_DATABASE_PASSWORD_FILE"], []byte("\n"), 0o600) },
		"no muster url":          func(f *fixture) { delete(f.env, "CONN_MUSTER_URL") },
		"muster url scheme":      func(f *fixture) { f.env["CONN_MUSTER_URL"] = "ftp://muster" },
		"muster url no host":     func(f *fixture) { f.env["CONN_MUSTER_URL"] = "http://" },
		"muster url userinfo":    func(f *fixture) { f.env["CONN_MUSTER_URL"] = "http://u:p@muster" },
		"muster url query":       func(f *fixture) { f.env["CONN_MUSTER_URL"] = "http://muster/?a=b" },
		"no token file setting":  func(f *fixture) { delete(f.env, "CONN_MUSTER_TOKEN_FILE") },
		"token file missing":     func(f *fixture) { f.env["CONN_MUSTER_TOKEN_FILE"] += ".absent" },
		"token file empty":       func(f *fixture) { os.WriteFile(f.env["CONN_MUSTER_TOKEN_FILE"], nil, 0o600) },
		"listen address garbled": func(f *fixture) { f.env["CONN_LISTEN"] = "not an address" },
	} {
		t.Run(name, func(t *testing.T) {
			f := newFixture(t)
			mutate(f)
			_, err := f.load()
			if err == nil {
				t.Fatal("Load succeeded")
			}
			for _, secret := range []string{dbSecret, tokenSecret, "logbook.example.invalid"} {
				if strings.Contains(err.Error(), secret) {
					t.Errorf("error leaks %q: %v", secret, err)
				}
			}
		})
	}
}

func TestSecretsDoNotPrint(t *testing.T) {
	c, err := newFixture(t).load()
	if err != nil {
		t.Fatal(err)
	}
	for _, out := range []string{fmt.Sprintf("%v", c), fmt.Sprintf("%+v", c), fmt.Sprintf("%#v", c)} {
		for _, secret := range []string{dbSecret, "logbook.example.invalid"} {
			if strings.Contains(out, secret) {
				t.Errorf("printing Config leaks %q: %s", secret, out)
			}
		}
	}
}
