import { ransomwareData } from './ransomwareData';

const avg = (rows) => rows.length ? +(rows.reduce((s, r) => s + r.severity, 0) / rows.length).toFixed(1) : 0;
const countBy = (rows, key) => {
  const m = {};
  rows.forEach(r => { const v = key(r); m[v] = (m[v] || 0) + 1; });
  return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};
const monthly = (rows) => {
  const m = {};
  rows.forEach(r => { const k = r.date.slice(0, 7); m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).map(([month, attacks]) => ({ month, attacks })).sort((a, b) => a.month.localeCompare(b.month));
};

export function getActorProfile(name) {
  const rows = ransomwareData.filter(d => d.ransomware_group === name);
  if (rows.length === 0) return null;
  const critical = rows.filter(d => d.severity >= 9).length;
  return {
    name,
    total: rows.length,
    avgSeverity: avg(rows),
    critical,
    critPct: Math.round((critical / rows.length) * 100),
    countries: countBy(rows, r => r.country),
    sectors: countBy(rows, r => r.target_sector),
    techniques: countBy(rows, r => r.technique || 'Unknown'),
    vectors: countBy(rows, r => r.attack_vector),
    timeline: monthly(rows),
    incidents: [...rows].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export function getCountryProfile(code) {
  const rows = ransomwareData.filter(d => d.country_code === code);
  if (rows.length === 0) return null;
  const critical = rows.filter(d => d.severity >= 9).length;
  return {
    code,
    name: rows[0].country,
    total: rows.length,
    avgSeverity: avg(rows),
    critical,
    groups: countBy(rows, r => r.ransomware_group),
    sectors: countBy(rows, r => r.target_sector),
    vectors: countBy(rows, r => r.attack_vector),
    incidents: [...rows].sort((a, b) => b.date.localeCompare(a.date)),
  };
}
