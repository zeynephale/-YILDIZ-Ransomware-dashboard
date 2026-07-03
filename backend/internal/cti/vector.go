package cti

import "strings"

func canonicalVector(raw string) string {
	s := strings.ToLower(strings.TrimSpace(raw))
	if s == "" || s == "-" {
		return "Unknown"
	}
	for _, rule := range vectorRules {
		for _, kw := range rule.keywords {
			if strings.Contains(s, kw) {
				return rule.category
			}
		}
	}
	return strings.TrimSpace(raw)
}

var vectorRules = []struct {
	keywords []string
	category string
}{
	{[]string{"phish", "malspam", "spear"}, "Phishing"},
	{[]string{"valid account", "rdp", "stolen credential"}, "Valid Accounts / RDP"},
	{[]string{"vulnerab", "exploit", "proxynotshell", "smartermail", "zerologon", "cve", "exchange", "public-facing"}, "Vulnerability Exploitation"},
	{[]string{"supply chain"}, "Supply Chain Compromise"},
	{[]string{"remote service", "rmm"}, "Remote Services"},
	{[]string{"social engineer", "vishing"}, "Social Engineering"},
	{[]string{"malvertis"}, "Malvertising"},
	{[]string{"exfiltrat"}, "Data Exfiltration"},
}
