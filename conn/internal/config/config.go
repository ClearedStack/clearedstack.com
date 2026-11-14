// Package config reads Conn's settings from the environment and fails closed:
// a missing or unusable required setting is an error. Error messages name the
// setting, never its value, and nothing secret prints.
package config

import (
	"errors"
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
)

// DatabaseRole is the only role Conn may connect as.
const DatabaseRole = "pub_ro"

// Secret is a value that never prints.
type Secret string

func (Secret) String() string   { return "[redacted]" }
func (Secret) GoString() string { return `"[redacted]"` }

// Config is Conn's whole configuration.
type Config struct {
	Listen           string // CONN_LISTEN, default ":8080"
	StaticDir        string // CONN_STATIC_DIR
	DatabaseURL      Secret // CONN_DATABASE_URL, which may name the host and so is kept out of logs
	DatabasePassword Secret // contents of CONN_DATABASE_PASSWORD_FILE, if set
	MusterURL        string // CONN_MUSTER_URL, scheme and host only
	MusterTokenFile  string // CONN_MUSTER_TOKEN_FILE
}

// Load builds a Config from getenv.
func Load(getenv func(string) string) (Config, error) {
	var c Config
	c.Listen = getenv("CONN_LISTEN")
	if c.Listen == "" {
		c.Listen = ":8080"
	}
	if _, _, err := net.SplitHostPort(c.Listen); err != nil {
		return c, errors.New("CONN_LISTEN is not a host:port address")
	}

	c.StaticDir = getenv("CONN_STATIC_DIR")
	if c.StaticDir == "" {
		return c, errors.New("CONN_STATIC_DIR is required")
	}
	if st, err := os.Stat(c.StaticDir); err != nil || !st.IsDir() {
		return c, errors.New("CONN_STATIC_DIR is not a directory")
	}

	c.DatabaseURL = Secret(getenv("CONN_DATABASE_URL"))
	if c.DatabaseURL == "" {
		return c, errors.New("CONN_DATABASE_URL is required")
	}
	// The error from the parser can quote the address, so it is dropped.
	pc, err := pgx.ParseConfig(string(c.DatabaseURL))
	if err != nil {
		return c, errors.New("CONN_DATABASE_URL is not a valid PostgreSQL address")
	}
	if pc.User != DatabaseRole {
		return c, fmt.Errorf("CONN_DATABASE_URL must connect as the role %s", DatabaseRole)
	}
	if f := getenv("CONN_DATABASE_PASSWORD_FILE"); f != "" {
		pw, err := readSecret(f)
		if err != nil {
			return c, errors.New("CONN_DATABASE_PASSWORD_FILE is unreadable or empty")
		}
		c.DatabasePassword = Secret(pw)
	}

	c.MusterURL = getenv("CONN_MUSTER_URL")
	if c.MusterURL == "" {
		return c, errors.New("CONN_MUSTER_URL is required")
	}
	u, err := url.Parse(c.MusterURL)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Hostname() == "" ||
		u.User != nil || u.RawQuery != "" || u.ForceQuery || u.Fragment != "" {
		return c, errors.New("CONN_MUSTER_URL must be an http or https address with no credentials, query or fragment")
	}
	c.MusterURL = strings.TrimSuffix(c.MusterURL, "/")

	c.MusterTokenFile = getenv("CONN_MUSTER_TOKEN_FILE")
	if c.MusterTokenFile == "" {
		return c, errors.New("CONN_MUSTER_TOKEN_FILE is required")
	}
	// Checked now so a missing mount stops the pod at start. The token is read
	// again on every upstream connection, because the cluster rotates it.
	if _, err := readSecret(c.MusterTokenFile); err != nil {
		return c, errors.New("CONN_MUSTER_TOKEN_FILE is unreadable or empty")
	}
	return c, nil
}

// ReadSecret returns the trimmed contents of a one-line secret file.
func ReadSecret(path string) (string, error) { return readSecret(path) }

func readSecret(path string) (string, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	s := strings.TrimSpace(string(b))
	if s == "" {
		return "", errors.New("empty")
	}
	return s, nil
}
