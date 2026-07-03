package cti

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Record struct {
	ID           int    `json:"id"`
	Date         string `json:"date"`
	Group        string `json:"ransomware_group"`
	Country      string `json:"country"`
	CountryCode  string `json:"country_code"`
	Sector       string `json:"target_sector"`
	SectorDetail string `json:"sector_detail"`
	Vector       string `json:"attack_vector"`
	Technique    string `json:"technique"`
	MitreID      string `json:"mitre_id"`
	Severity     int    `json:"severity"`
	IOCIP        string `json:"ioc_ip"`
	IOCHash      string `json:"ioc_hash"`
}

type Store struct {
	Records []Record
}

func Load(path string) (*Store, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open csv: %w", err)
	}
	defer f.Close()

	r := csv.NewReader(f)
	r.FieldsPerRecord = -1
	rows, err := r.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("read csv: %w", err)
	}

	cols, headerAt := findHeader(rows)
	if cols == nil {
		return nil, fmt.Errorf("could not locate a header row with date/ransomware_group columns")
	}

	var records []Record
	id := 0
	for _, row := range rows[headerAt+1:] {
		date := cell(row, cols, "date")
		group := cell(row, cols, "ransomware_group")
		if date == "" || group == "" {
			continue
		}
		if _, err := time.Parse("2006-01-02", date); err != nil {
			continue
		}

		id++
		country, code := splitCountry(cell(row, cols, "country"))
		technique := strings.TrimSpace(cell(row, cols, "technique"))
		sectorDetail := orDefault(cell(row, cols, "target_sector"), "Unknown")

		rec := Record{
			ID:           id,
			Date:         date,
			Group:        canonicalGroup(group),
			Country:      country,
			CountryCode:  code,
			Sector:       categorizeSector(sectorDetail),
			SectorDetail: sectorDetail,
			Vector:       canonicalVector(cell(row, cols, "attack_vector")),
			Technique:    technique,
			MitreID:      mitreID(technique),
			Severity:     parseSeverity(cell(row, cols, "severity")),
			IOCIP:        firstValue(cell(row, cols, "ioc_ip")),
			IOCHash:      firstValue(cell(row, cols, "ioc_hash")),
		}
		enrichIOC(&rec)
		records = append(records, rec)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("no usable records found in %s", path)
	}
	return &Store{Records: records}, nil
}

func findHeader(rows [][]string) (map[string]int, int) {
	for i, row := range rows {
		cols := map[string]int{}
		for j, raw := range row {
			if key := normalizeHeader(raw); key != "" {
				cols[key] = j
			}
		}
		_, hasDate := cols["date"]
		_, hasGroup := cols["ransomware_group"]
		if hasDate && hasGroup {
			return cols, i
		}
	}
	return nil, -1
}

func normalizeHeader(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	if i := strings.Index(s, " ("); i >= 0 {
		s = s[:i]
	}
	return strings.TrimSpace(s)
}

func cell(row []string, cols map[string]int, name string) string {
	if idx, ok := cols[name]; ok && idx < len(row) {
		return strings.TrimSpace(row[idx])
	}
	return ""
}

func orDefault(v, fallback string) string {
	if v == "" {
		return fallback
	}
	return v
}

func splitCountry(raw string) (name, code string) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "Unknown", ""
	}
	if i := strings.LastIndex(raw, "("); i >= 0 {
		name = strings.TrimSpace(raw[:i])
		code = strings.Trim(raw[i:], "() ")
		if name == "" {
			name = raw
		}
		return name, code
	}
	return raw, ""
}

func mitreID(technique string) string {
	if technique == "" {
		return ""
	}
	if i := strings.Index(technique, " - "); i >= 0 {
		return strings.TrimSpace(technique[:i])
	}
	return technique
}

func parseSeverity(s string) int {
	n, err := strconv.Atoi(strings.TrimSpace(s))
	if err != nil {
		return 0
	}
	if n < 1 {
		return 1
	}
	if n > 10 {
		return 10
	}
	return n
}

func firstValue(s string) string {
	s = strings.TrimSpace(s)
	for _, sep := range []string{"\n", ","} {
		if i := strings.Index(s, sep); i >= 0 {
			s = s[:i]
		}
	}
	return strings.TrimSpace(s)
}

func canonicalGroup(name string) string {
	name = strings.TrimSpace(name)
	if canon, ok := groupAliases[strings.ToLower(name)]; ok {
		return canon
	}
	return name
}

var groupAliases = map[string]string{
	"the gentlemen":    "The Gentlemen",
	"3am":              "3AM",
	"auditteam":        "Audit Team",
	"audit team":       "Audit Team",
	"braincipher":      "Brain Cipher",
	"brain cipher":     "Brain Cipher",
	"cmdorganization":  "CMD",
	"cmd":              "CMD",
	"apt73":            "Apt73",
	"eraleign (apt73)": "Apt73",
	"nova":             "Nova",
	"play":             "Play",
	"play (playcrypt)": "Play",
	"ransomhouse":      "RansomHouse",
	"redact":           "REDACT",
	"shinyhunters":     "ShinyHunters",
}
