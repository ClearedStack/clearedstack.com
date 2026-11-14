#!/bin/sh
# Runs the integration test against a real, throwaway PostgreSQL 17.
#
#   LOGBOOK_DIR=/path/to/logbook sh scripts/integration.sh
#
# LOGBOOK_DIR is a checkout of Logbook (branch sync/backup-drill-cronjobs or a
# later one) with migrate.sh and migrations/. The script starts a server in a
# temporary directory that listens only on 127.0.0.1 at a free port,
# applies Logbook's migrations, loads internal/ledger/testdata/seed.sql, gives
# pub_ro a password that exists only for this run, runs the test as pub_ro, and
# removes the server. It needs initdb, pg_ctl, psql and go on the PATH, and has
# to be run as an ordinary user.
set -eu
LC_ALL=C
export LC_ALL
: "${LOGBOOK_DIR:?set LOGBOOK_DIR to a checkout of Logbook}"
here=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
cleanup() {
    [ -z "${KEEP:-}" ] || cat "$tmp/log" >&2
    pg_ctl -D "$tmp/data" -m immediate stop >/dev/null 2>&1 || true
    rm -rf "$tmp"
}
trap cleanup EXIT INT TERM

port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])')
initdb -D "$tmp/data" -U owner --auth=trust -E UTF8 >/dev/null
pg_ctl -D "$tmp/data" -w -l "$tmp/log" \
    -o "-p $port -c listen_addresses=127.0.0.1 -c unix_socket_directories= -c fsync=off" start >/dev/null

export PGHOST=127.0.0.1 PGPORT=$port PGUSER=owner
createdb logbook
export PGDATABASE=logbook
sh "$LOGBOOK_DIR/migrate.sh"
psql -X -q -v ON_ERROR_STOP=1 -f "$here/internal/ledger/testdata/seed.sql"

# Logbook creates pub_ro without a password and without the right to log in;
# whoever deploys it grants those. Here that is the test run.
password=$(python3 -c 'import secrets; print(secrets.token_hex(16))')
psql -X -q -v ON_ERROR_STOP=1 -c "ALTER ROLE pub_ro LOGIN PASSWORD '$password'"

cd "$here"
CONN_TEST_DATABASE_URL="postgres://pub_ro@127.0.0.1:$port/logbook?sslmode=disable" \
CONN_TEST_PASSWORD="$password" \
    go test -count=1 -v -run 'PG|Open' ./internal/ledger/
