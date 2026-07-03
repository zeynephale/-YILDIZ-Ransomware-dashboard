export const ransomwareData = [];

const API = '/api';

export async function loadDataset() {
  const res = await fetch(`${API}/records`);
  if (!res.ok) throw new Error(`records request failed: ${res.status}`);
  const records = await res.json();
  ransomwareData.length = 0;
  ransomwareData.push(...records);
  return ransomwareData;
}

export function getGroupDistribution() {
  const groups = {};
  ransomwareData.forEach(d => { groups[d.ransomware_group] = (groups[d.ransomware_group] || 0) + 1; });
  return Object.entries(groups)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCountryDistribution() {
  const countries = {};
  ransomwareData.forEach(d => { countries[d.country] = (countries[d.country] || 0) + 1; });
  return Object.entries(countries)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

export function getSectorDistribution() {
  const sectors = {};
  ransomwareData.forEach(d => { sectors[d.target_sector] = (sectors[d.target_sector] || 0) + 1; });
  return Object.entries(sectors)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getMonthlyTrend() {
  const months = {};
  ransomwareData.forEach(d => {
    const key = d.date.slice(0, 7);
    if (!months[key]) months[key] = { month: key, count: 0, totalSeverity: 0 };
    months[key].count++;
    months[key].totalSeverity += d.severity;
  });
  return Object.values(months)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      month: m.month,
      attacks: m.count,
      avgSeverity: parseFloat((m.totalSeverity / m.count).toFixed(1)),
    }));
}

export function getAttackVectorDistribution() {
  const vectors = {};
  ransomwareData.forEach(d => { vectors[d.attack_vector] = (vectors[d.attack_vector] || 0) + 1; });
  return Object.entries(vectors)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTechniqueDistribution() {
  const techniques = {};
  ransomwareData.forEach(d => {
    const t = d.technique || 'Unknown';
    techniques[t] = (techniques[t] || 0) + 1;
  });
  return Object.entries(techniques)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getSeverityDistribution() {
  const buckets = Array.from({ length: 10 }, (_, i) => ({ severity: i + 1, count: 0 }));
  ransomwareData.forEach(d => {
    if (d.severity >= 1 && d.severity <= 10) buckets[d.severity - 1].count++;
  });
  return buckets;
}

export function getAverageSeverity() {
  if (ransomwareData.length === 0) return '0.0';
  const total = ransomwareData.reduce((sum, d) => sum + d.severity, 0);
  return (total / ransomwareData.length).toFixed(1);
}

export async function searchIOC(query) {
  if (!query || query.trim() === '') return [];
  const res = await fetch(`${API}/ioc/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) throw new Error(`ioc search failed: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchIOCSamples() {
  try {
    const res = await fetch(`${API}/ioc/samples`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
