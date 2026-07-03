package cti

import (
	"fmt"
	"sort"
	"strings"
)

type GroupProfile struct {
	GroupName         string   `json:"group_name"`
	TotalAttacks      int      `json:"total_attacks"`
	AvgSeverity       float64  `json:"avg_severity"`
	UniqueCountries   int      `json:"unique_countries"`
	UniqueSectors     int      `json:"unique_sectors"`
	CriticalCount     int      `json:"critical_count"`
	CriticalRate      int      `json:"critical_rate"`
	TopCountry        string   `json:"top_country"`
	TopSector         string   `json:"top_sector"`
	TopAttackVector   string   `json:"top_attack_vector"`
	TopMitreTechnique string   `json:"top_mitre_technique"`
	FirstSeen         string   `json:"first_seen"`
	LastSeen          string   `json:"last_seen"`
	Countries         []string `json:"countries"`
	Sectors           []string `json:"sectors"`
	MitreTechniques   []string `json:"mitre_techniques"`
}

type CompareSummaryLine struct {
	Text   string `json:"text"`
	Tie    bool   `json:"tie,omitempty"`
	Winner string `json:"winner,omitempty"`
}

type CompareOverlap struct {
	SharedCountries       []string `json:"shared_countries"`
	SharedSectors         []string `json:"shared_sectors"`
	SharedMitreTechniques []string `json:"shared_mitre_techniques"`
	UniqueCountriesA      []string `json:"unique_countries_a"`
	UniqueCountriesB      []string `json:"unique_countries_b"`
	UniqueSectorsA        []string `json:"unique_sectors_a"`
	UniqueSectorsB        []string `json:"unique_sectors_b"`
}

type CompareResult struct {
	GroupA          GroupProfile         `json:"group_a"`
	GroupB          GroupProfile         `json:"group_b"`
	Summary         []CompareSummaryLine `json:"summary"`
	Overlap         CompareOverlap       `json:"overlap"`
	RecentIncidents []Record             `json:"recent_incidents"`
}

func (s *Store) Compare(groupA, groupB string) CompareResult {
	statsA := buildGroupProfile(s, groupA)
	statsB := buildGroupProfile(s, groupB)

	return CompareResult{
		GroupA:          statsA,
		GroupB:          statsB,
		Summary:         buildCompareSummary(statsA, statsB),
		Overlap:         buildCompareOverlap(statsA, statsB),
		RecentIncidents: combinedRecentIncidents(s, groupA, groupB, 10),
	}
}

func buildGroupProfile(s *Store, group string) GroupProfile {
	records := filterByGroup(s.Records, group)
	p := GroupProfile{GroupName: group}

	if len(records) == 0 {
		p.TopCountry = "—"
		p.TopSector = "—"
		p.TopAttackVector = "—"
		p.TopMitreTechnique = "—"
		p.FirstSeen = "—"
		p.LastSeen = "—"
		p.Countries = []string{}
		p.Sectors = []string{}
		p.MitreTechniques = []string{}
		return p
	}

	countries := uniqueField(records, func(r Record) string { return r.Country })
	sectors := uniqueField(records, func(r Record) string { return r.Sector })
	techniques := uniqueMitreShort(records)

	critical := 0
	totalSev := 0
	dates := make([]string, 0, len(records))
	for _, r := range records {
		totalSev += r.Severity
		if r.Severity >= 8 {
			critical++
		}
		dates = append(dates, r.Date)
	}
	sort.Strings(dates)

	p.TotalAttacks = len(records)
	p.AvgSeverity = round1(float64(totalSev) / float64(len(records)))
	p.UniqueCountries = len(countries)
	p.UniqueSectors = len(sectors)
	p.CriticalCount = critical
	p.CriticalRate = int(float64(critical) / float64(len(records)) * 100)
	p.TopCountry = orDash(mostCommon(records, func(r Record) string { return r.Country }))
	p.TopSector = orDash(mostCommon(records, func(r Record) string { return r.Sector }))
	p.TopAttackVector = orDash(mostCommon(records, func(r Record) string { return r.Vector }))
	p.TopMitreTechnique = orDash(mitreShort(mostCommon(records, func(r Record) string { return r.Technique })))
	p.FirstSeen = dates[0]
	p.LastSeen = dates[len(dates)-1]
	p.Countries = countries
	p.Sectors = sectors
	p.MitreTechniques = techniques
	return p
}

func filterByGroup(records []Record, group string) []Record {
	out := make([]Record, 0)
	for _, r := range records {
		if r.Group == group {
			out = append(out, r)
		}
	}
	return out
}

func uniqueField(records []Record, key func(Record) string) []string {
	seen := map[string]bool{}
	out := make([]string, 0)
	for _, r := range records {
		v := key(r)
		if v == "" || seen[v] {
			continue
		}
		seen[v] = true
		out = append(out, v)
	}
	sort.Strings(out)
	return out
}

func uniqueMitreShort(records []Record) []string {
	seen := map[string]bool{}
	out := make([]string, 0)
	for _, r := range records {
		v := mitreShort(r.Technique)
		if v == "" || v == "Unknown" || seen[v] {
			continue
		}
		seen[v] = true
		out = append(out, v)
	}
	sort.Strings(out)
	return out
}

func mostCommon(records []Record, key func(Record) string) string {
	counts := map[string]int{}
	for _, r := range records {
		v := key(r)
		if v == "" {
			continue
		}
		counts[v]++
	}
	best, bestCount := "", 0
	for name, count := range counts {
		if count > bestCount || (count == bestCount && name < best) {
			best, bestCount = name, count
		}
	}
	return best
}

func mitreShort(technique string) string {
	if technique == "" {
		return "Unknown"
	}
	if i := strings.Index(technique, " - "); i >= 0 {
		return strings.TrimSpace(technique[:i])
	}
	return technique
}

func orDash(v string) string {
	if v == "" {
		return "—"
	}
	return v
}

func overlap(a, b []string) []string {
	setB := map[string]bool{}
	for _, v := range b {
		setB[v] = true
	}
	out := make([]string, 0)
	for _, v := range a {
		if setB[v] {
			out = append(out, v)
		}
	}
	sort.Strings(out)
	return out
}

func uniqueOnly(a, b []string) []string {
	setB := map[string]bool{}
	for _, v := range b {
		setB[v] = true
	}
	out := make([]string, 0)
	for _, v := range a {
		if !setB[v] {
			out = append(out, v)
		}
	}
	sort.Strings(out)
	return out
}

func buildCompareOverlap(a, b GroupProfile) CompareOverlap {
	return CompareOverlap{
		SharedCountries:     overlap(a.Countries, b.Countries),
		SharedSectors:         overlap(a.Sectors, b.Sectors),
		SharedMitreTechniques: overlap(a.MitreTechniques, b.MitreTechniques),
		UniqueCountriesA:      uniqueOnly(a.Countries, b.Countries),
		UniqueCountriesB:      uniqueOnly(b.Countries, a.Countries),
		UniqueSectorsA:        uniqueOnly(a.Sectors, b.Sectors),
		UniqueSectorsB:        uniqueOnly(b.Sectors, a.Sectors),
	}
}

func buildCompareSummary(a, b GroupProfile) []CompareSummaryLine {
	lines := []CompareSummaryLine{}
	lines = append(lines, numericDiff("attacks", a.TotalAttacks, b.TotalAttacks, a.GroupName, b.GroupName)...)
	if a.AvgSeverity == b.AvgSeverity {
		lines = append(lines, CompareSummaryLine{Text: "Both groups share the same average severity", Tie: true})
	} else if a.AvgSeverity > b.AvgSeverity {
		diff := round1(a.AvgSeverity - b.AvgSeverity)
		lines = append(lines, CompareSummaryLine{Text: fmt.Sprintf("%s has +%.1f higher average severity", a.GroupName, diff), Winner: a.GroupName})
	} else {
		diff := round1(b.AvgSeverity - a.AvgSeverity)
		lines = append(lines, CompareSummaryLine{Text: fmt.Sprintf("%s has +%.1f higher average severity", b.GroupName, diff), Winner: b.GroupName})
	}
	lines = append(lines, numericDiff("targeted countries", a.UniqueCountries, b.UniqueCountries, a.GroupName, b.GroupName)...)
	lines = append(lines, numericDiff("targeted sectors", a.UniqueSectors, b.UniqueSectors, a.GroupName, b.GroupName)...)
	lines = append(lines, numericDiff("critical incidents", a.CriticalCount, b.CriticalCount, a.GroupName, b.GroupName)...)

	if a.TopMitreTechnique == b.TopMitreTechnique && a.TopMitreTechnique != "" && a.TopMitreTechnique != "—" {
		lines = append(lines, CompareSummaryLine{Text: "Both groups mainly use " + a.TopMitreTechnique, Tie: true})
	}
	return lines
}

func numericDiff(label string, valA, valB int, nameA, nameB string) []CompareSummaryLine {
	if valA == valB {
		return []CompareSummaryLine{{Text: "Both groups have the same " + label, Tie: true}}
	}
	if valA > valB {
		return []CompareSummaryLine{{Text: fmt.Sprintf("%s has +%d more %s", nameA, valA-valB, label), Winner: nameA}}
	}
	return []CompareSummaryLine{{Text: fmt.Sprintf("%s has +%d more %s", nameB, valB-valA, label), Winner: nameB}}
}

func combinedRecentIncidents(s *Store, groupA, groupB string, limit int) []Record {
	combined := append(filterByGroup(s.Records, groupA), filterByGroup(s.Records, groupB)...)
	sort.Slice(combined, func(i, j int) bool { return combined[i].Date > combined[j].Date })
	if len(combined) > limit {
		combined = combined[:limit]
	}
	return combined
}
