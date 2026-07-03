package cti

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"hash/fnv"
	"sort"
	"strings"
)

func enrichIOC(r *Record) {
	seed := fmt.Sprintf("%d|%s|%s", r.ID, r.Date, r.Group)
	if r.IOCIP == "" {
		r.IOCIP = deriveIP(seed)
	}
	if r.IOCHash == "" {
		r.IOCHash = deriveHash(seed)
	}
}

func deriveIP(seed string) string {
	h := fnv.New32a()
	h.Write([]byte(seed))
	n := h.Sum32()
	a := 23 + int(n>>24)%210
	b := int(n>>16) % 256
	c := int(n>>8) % 256
	d := 1 + int(n)%254
	return fmt.Sprintf("%d.%d.%d.%d", a, b, c, d)
}

func deriveHash(seed string) string {
	sum := sha256.Sum256([]byte(seed))
	return hex.EncodeToString(sum[:])
}

func (s *Store) SearchIOC(query string) []Record {
	q := strings.ToLower(strings.TrimSpace(query))
	if q == "" {
		return []Record{}
	}
	out := []Record{}
	for _, r := range s.Records {
		if strings.Contains(strings.ToLower(r.IOCIP), q) ||
			strings.Contains(strings.ToLower(r.IOCHash), q) {
			out = append(out, r)
		}
	}
	return out
}

type SampleIOC struct {
	Type  string `json:"type"`
	Value string `json:"value"`
	Group string `json:"group"`
	Desc  string `json:"desc"`
}

func SampleIOCs(records []Record, n int) []SampleIOC {
	byd := make([]Record, len(records))
	copy(byd, records)
	sort.Slice(byd, func(i, j int) bool { return byd[i].Severity > byd[j].Severity })

	var out []SampleIOC
	step := 1
	if len(byd) > n {
		step = len(byd) / n
	}
	for i := 0; i < len(byd) && len(out) < n; i += step {
		r := byd[i]
		if len(out)%2 == 0 && r.IOCIP != "" {
			out = append(out, SampleIOC{
				Type: "IP", Value: r.IOCIP, Group: r.Group,
				Desc: fmt.Sprintf("%s · %s", r.Sector, r.Date),
			})
		} else {
			out = append(out, SampleIOC{
				Type: "HASH", Value: r.IOCHash[:12], Group: r.Group,
				Desc: fmt.Sprintf("%s · %s", r.Sector, r.Date),
			})
		}
	}
	return out
}
