package cti

import (
	"math"
	"sort"
)

type NameCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type Overview struct {
	TotalAttacks int     `json:"total_attacks"`
	ThreatGroups int     `json:"threat_groups"`
	Countries    int     `json:"countries"`
	Sectors      int     `json:"sectors"`
	AvgSeverity  float64 `json:"avg_severity"`
	Critical     int     `json:"critical"`
	StartDate    string  `json:"start_date"`
	EndDate      string  `json:"end_date"`
	TopGroup     string  `json:"top_group"`
	TopCountry   string  `json:"top_country"`
	TopSector    string  `json:"top_sector"`
}

type GroupStat struct {
	Name        string  `json:"name"`
	Count       int     `json:"count"`
	AvgSeverity float64 `json:"avg_severity"`
	Countries   int     `json:"countries"`
	Sectors     int     `json:"sectors"`
	Critical    int     `json:"critical"`
}

type MonthPoint struct {
	Month       string  `json:"month"`
	Attacks     int     `json:"attacks"`
	AvgSeverity float64 `json:"avg_severity"`
}

type SeverityBucket struct {
	Severity int `json:"severity"`
	Count    int `json:"count"`
}

func (s *Store) Overview() Overview {
	ov := Overview{TotalAttacks: len(s.Records)}
	groups := map[string]bool{}
	countries := map[string]bool{}
	sectors := map[string]bool{}
	total := 0
	start, end := "", ""

	for _, r := range s.Records {
		groups[r.Group] = true
		countries[r.Country] = true
		sectors[r.Sector] = true
		total += r.Severity
		if r.Severity >= 9 {
			ov.Critical++
		}
		if start == "" || r.Date < start {
			start = r.Date
		}
		if end == "" || r.Date > end {
			end = r.Date
		}
	}

	ov.ThreatGroups = len(groups)
	ov.Countries = len(countries)
	ov.Sectors = len(sectors)
	ov.StartDate, ov.EndDate = start, end
	if len(s.Records) > 0 {
		ov.AvgSeverity = round1(float64(total) / float64(len(s.Records)))
	}
	ov.TopGroup = topName(s.GroupDistribution())
	ov.TopCountry = topName(s.CountryDistribution(0))
	ov.TopSector = topName(s.SectorDistribution())
	return ov
}

func (s *Store) GroupDistribution() []NameCount {
	return s.distributionBy(func(r Record) string { return r.Group })
}
func (s *Store) SectorDistribution() []NameCount {
	return s.distributionBy(func(r Record) string { return r.Sector })
}
func (s *Store) VectorDistribution() []NameCount {
	return s.distributionBy(func(r Record) string { return r.Vector })
}
func (s *Store) TechniqueDistribution() []NameCount {
	return s.distributionBy(func(r Record) string {
		if r.Technique == "" {
			return "Unknown"
		}
		return r.Technique
	})
}

func (s *Store) CountryDistribution(limit int) []NameCount {
	all := s.distributionBy(func(r Record) string { return r.Country })
	if limit > 0 && len(all) > limit {
		return all[:limit]
	}
	return all
}

func (s *Store) distributionBy(key func(Record) string) []NameCount {
	counts := map[string]int{}
	for _, r := range s.Records {
		counts[key(r)]++
	}
	out := make([]NameCount, 0, len(counts))
	for name, count := range counts {
		out = append(out, NameCount{Name: name, Count: count})
	}
	sortByCountThenName(out)
	return out
}

func (s *Store) GroupStats() []GroupStat {
	type agg struct {
		count, sevTotal, critical int
		countries, sectors        map[string]bool
	}
	m := map[string]*agg{}
	for _, r := range s.Records {
		a := m[r.Group]
		if a == nil {
			a = &agg{countries: map[string]bool{}, sectors: map[string]bool{}}
			m[r.Group] = a
		}
		a.count++
		a.sevTotal += r.Severity
		if r.Severity >= 9 {
			a.critical++
		}
		a.countries[r.Country] = true
		a.sectors[r.Sector] = true
	}

	out := make([]GroupStat, 0, len(m))
	for name, a := range m {
		out = append(out, GroupStat{
			Name:        name,
			Count:       a.count,
			AvgSeverity: round1(float64(a.sevTotal) / float64(a.count)),
			Countries:   len(a.countries),
			Sectors:     len(a.sectors),
			Critical:    a.critical,
		})
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Count != out[j].Count {
			return out[i].Count > out[j].Count
		}
		return out[i].Name < out[j].Name
	})
	return out
}

func (s *Store) Timeline() []MonthPoint {
	type agg struct{ count, sevTotal int }
	m := map[string]*agg{}
	for _, r := range s.Records {
		if len(r.Date) < 7 {
			continue
		}
		month := r.Date[:7]
		a := m[month]
		if a == nil {
			a = &agg{}
			m[month] = a
		}
		a.count++
		a.sevTotal += r.Severity
	}

	out := make([]MonthPoint, 0, len(m))
	for month, a := range m {
		out = append(out, MonthPoint{
			Month:       month,
			Attacks:     a.count,
			AvgSeverity: round1(float64(a.sevTotal) / float64(a.count)),
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Month < out[j].Month })
	return out
}

func (s *Store) SeverityHistogram() []SeverityBucket {
	counts := make([]int, 11)
	for _, r := range s.Records {
		if r.Severity >= 1 && r.Severity <= 10 {
			counts[r.Severity]++
		}
	}
	out := make([]SeverityBucket, 0, 10)
	for sev := 1; sev <= 10; sev++ {
		out = append(out, SeverityBucket{Severity: sev, Count: counts[sev]})
	}
	return out
}

func sortByCountThenName(x []NameCount) {
	sort.Slice(x, func(i, j int) bool {
		if x[i].Count != x[j].Count {
			return x[i].Count > x[j].Count
		}
		return x[i].Name < x[j].Name
	})
}

func topName(x []NameCount) string {
	if len(x) == 0 {
		return ""
	}
	return x[0].Name
}

func round1(v float64) float64 {
	if math.IsNaN(v) {
		return 0
	}
	return math.Round(v*10) / 10
}
