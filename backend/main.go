package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"cti-dashboard/internal/api"
	"cti-dashboard/internal/cti"
)

func main() {
	csvPath := env("DATA_CSV", "")
	if csvPath == "" {
		for _, candidate := range []string{"data.csv", "../data.csv"} {
			if _, err := os.Stat(candidate); err == nil {
				csvPath = candidate
				break
			}
		}
		if csvPath == "" {
			csvPath = "data.csv"
		}
	}
	staticDir := env("STATIC_DIR", "")
	addr := ":" + env("PORT", "8080")

	store, err := cti.Load(csvPath)
	if err != nil {
		log.Fatalf("failed to load dataset: %v", err)
	}
	log.Printf("loaded %d incident records from %s", len(store.Records), csvPath)

	srv := &http.Server{
		Addr:         addr,
		Handler:      api.New(store, staticDir).Handler(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Printf("CTI dashboard API listening on %s", addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
