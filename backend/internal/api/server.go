package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"

	"cti-dashboard/internal/cti"
)

type Server struct {
	store     *cti.Store
	staticDir string
}

func New(store *cti.Store, staticDir string) *Server {
	return &Server{store: store, staticDir: staticDir}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", s.handleHealth)
	mux.HandleFunc("/api/records", s.handleRecords)
	mux.HandleFunc("/api/overview", s.handleOverview)
	mux.HandleFunc("/api/stats/groups", s.jsonOf(func() any { return s.store.GroupStats() }))
	mux.HandleFunc("/api/stats/countries", s.jsonOf(func() any { return s.store.CountryDistribution(15) }))
	mux.HandleFunc("/api/stats/sectors", s.jsonOf(func() any { return s.store.SectorDistribution() }))
	mux.HandleFunc("/api/stats/vectors", s.jsonOf(func() any { return s.store.VectorDistribution() }))
	mux.HandleFunc("/api/stats/techniques", s.jsonOf(func() any { return s.store.TechniqueDistribution() }))
	mux.HandleFunc("/api/stats/timeline", s.jsonOf(func() any { return s.store.Timeline() }))
	mux.HandleFunc("/api/stats/severity", s.jsonOf(func() any { return s.store.SeverityHistogram() }))
	mux.HandleFunc("/api/ioc/search", s.handleIOCSearch)
	mux.HandleFunc("/api/ioc/samples", s.handleIOCSamples)
	mux.HandleFunc("/api/threat-groups/compare", s.handleCompare)

	if s.staticDir != "" {
		mux.HandleFunc("/", s.serveStatic)
	}
	return withCORS(mux)
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"records": len(s.store.Records),
	})
}

func (s *Server) handleRecords(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.store.Records)
}

func (s *Server) handleOverview(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.store.Overview())
}

func (s *Server) handleIOCSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	results := s.store.SearchIOC(query)

	groups := map[string]bool{}
	countries := map[string]bool{}
	sevTotal := 0
	for _, rec := range results {
		groups[rec.Group] = true
		countries[rec.Country] = true
		sevTotal += rec.Severity
	}
	avg := 0.0
	if len(results) > 0 {
		avg = float64(sevTotal) / float64(len(results))
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"query":        query,
		"count":        len(results),
		"groups":       len(groups),
		"countries":    len(countries),
		"avg_severity": avg,
		"results":      results,
	})
}

func (s *Server) handleIOCSamples(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, cti.SampleIOCs(s.store.Records, 4))
}

func (s *Server) handleCompare(w http.ResponseWriter, r *http.Request) {
	groupA := r.URL.Query().Get("groupA")
	groupB := r.URL.Query().Get("groupB")
	if groupA == "" || groupB == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "groupA and groupB query parameters are required",
		})
		return
	}
	if groupA == groupB {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "groupA and groupB must be different",
		})
		return
	}
	writeJSON(w, http.StatusOK, s.store.Compare(groupA, groupB))
}

func (s *Server) jsonOf(provider func() any) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, provider())
	}
}

func (s *Server) serveStatic(w http.ResponseWriter, r *http.Request) {
	clean := filepath.Clean(r.URL.Path)
	target := filepath.Join(s.staticDir, clean)

	if info, err := os.Stat(target); err == nil && !info.IsDir() {
		http.ServeFile(w, r, target)
		return
	}
	http.ServeFile(w, r, filepath.Join(s.staticDir, "index.html"))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
