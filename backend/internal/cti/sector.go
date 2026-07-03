package cti

import "strings"

func categorizeSector(detail string) string {
	s := strings.ToLower(strings.TrimSpace(detail))
	if s == "" || s == "unknown" {
		return "Unknown"
	}
	for _, rule := range sectorRules {
		for _, kw := range rule.keywords {
			if strings.Contains(s, kw) {
				return rule.category
			}
		}
	}
	return "Other"
}

var sectorRules = []struct {
	keywords []string
	category string
}{
	{[]string{"real estate", "title deed"}, "Real Estate"},
	{[]string{"legal", "law firm", " law ", "professional services", "investigation", "diversified business"}, "Legal & Professional Services"},
	{[]string{"health", "medical", "dental", "neurolog", "eye care", "pharma"}, "Healthcare & Medical"},
	{[]string{"education", "edtech", "educational"}, "Education"},
	{[]string{"financ", "bank", "insurance"}, "Finance & Insurance"},
	{[]string{"government", "public", "political", "municipal", "tribal", "law enforcement", "social housing", "social services", "nonprofit"}, "Government & Public Sector"},
	{[]string{"energy", "mining", "utilit", "critical infrastructure"}, "Energy & Utilities"},
	{[]string{"agricult", "seed", "foodservice", "food"}, "Agriculture & Food"},
	{[]string{"transport", "logistic", "freight", "trucking", "aviation", "airport", "supply chain"}, "Transportation & Logistics"},
	{[]string{"hospitality", "accommodation", "tourism", "gaming", "amusement", "performing arts", "hotel", "leisure"}, "Hospitality & Leisure"},
	{[]string{"telecom"}, "Telecommunications"},
	{[]string{"retail", "commerce", "apparel", "textile", "menswear", "knitwear", "outdoor equipment", "pawn", "consumer goods", "luxury"}, "Retail & Consumer"},
	{[]string{"manufactur", "oem", "electronics", "precision", "hardware", "refrigeration"}, "Manufacturing & Industrial"},
	{[]string{"construction", "engineering", "excavation", "civil", "building materials", "industrial services"}, "Construction & Engineering"},
	{[]string{"technolog", "software", "information technology", " it", "cybersecurity", "network security", "data management", "data storage", "information management", "enterprise"}, "Technology & Software"},
	{[]string{"industr"}, "Manufacturing & Industrial"},
}
