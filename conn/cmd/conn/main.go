// Command conn serves the ClearedStack site, the item ledger page and the
// live feed. See the README section "Conn server" for its settings.
package main

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"os/signal"
	"runtime/debug"
	"sync"
	"syscall"
	"time"

	"github.com/ClearedStack/clearedstack.com/conn/internal/config"
	"github.com/ClearedStack/clearedstack.com/conn/internal/feed"
	"github.com/ClearedStack/clearedstack.com/conn/internal/ledger"
	"github.com/ClearedStack/clearedstack.com/conn/internal/server"
	"github.com/ClearedStack/clearedstack.com/conn/internal/static"
)

// memoryLimit is the Go runtime's soft limit when GOMEMLIMIT is not set:
// 96 MiB, under the 128 MiB budget in src/data/registry.json.
const memoryLimit = 96 << 20

const queryTimeout = 3 * time.Second

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stderr, nil))
	if err := run(log); err != nil {
		// Every error here is built from fixed words and setting names.
		log.Error("conn stopped", "reason", err.Error())
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	if os.Getenv("GOMEMLIMIT") == "" {
		debug.SetMemoryLimit(memoryLimit)
	}
	cfg, err := config.Load(os.Getenv)
	if err != nil {
		return err
	}
	site, err := static.New(cfg.StaticDir)
	if err != nil {
		return errors.New("CONN_STATIC_DIR cannot be opened")
	}
	defer site.Close()
	db, err := ledger.Open(string(cfg.DatabaseURL), string(cfg.DatabasePassword), queryTimeout)
	if err != nil {
		return errors.New("CONN_DATABASE_URL cannot be used")
	}
	defer db.Close()
	hub := &feed.Hub{URL: cfg.MusterURL, TokenFile: cfg.MusterTokenFile, Log: log}

	srv := server.NewServer(cfg.Listen, server.New(server.Handlers{
		Static: site,
		Ledger: &ledger.Handler{Store: db, Timeout: queryTimeout, NotFound: site.NotFound, Log: log},
		Feed:   hub,
	}))

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	var wg sync.WaitGroup
	wg.Add(1)
	go func() { defer wg.Done(); hub.Run(ctx) }()

	serveErr := make(chan error, 1)
	go func() { serveErr <- srv.ListenAndServe() }()
	log.Info("conn listening", "listen", cfg.Listen)

	select {
	case err := <-serveErr:
		stop()
		wg.Wait()
		return err
	case <-ctx.Done():
	}
	// The hub ends every feed stream when ctx ends, so Shutdown does not wait
	// on them.
	wg.Wait()
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdown); err != nil {
		return errors.New("shutdown did not finish in time")
	}
	log.Info("conn stopped cleanly")
	return nil
}
