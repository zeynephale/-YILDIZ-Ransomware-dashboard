/**
 * Threat group comparison helpers — computed from incident records on the client.
 */

export function getUniqueValues(records, field) {
  if (!records?.length) return [];
  return [...new Set(records.map(r => r[field]).filter(Boolean))];
}

export function getMostCommonValue(records, field) {
  if (!records?.length) return null;
  const counts = {};
  for (const r of records) {
    const val = r[field];
    if (!val) continue;
    counts[val] = (counts[val] || 0) + 1;
  }
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function calculateAverageSeverity(records) {
  if (!records?.length) return 0;
  const total = records.reduce((sum, r) => sum + (r.severity || 0), 0);
  return +(total / records.length).toFixed(1);
}

export function getCriticalIncidents(records, threshold = 8) {
  if (!records?.length) return [];
  return records.filter(r => r.severity >= threshold);
}

export function getOverlap(listA, listB) {
  const setB = new Set(listB);
  return listA.filter(item => setB.has(item));
}

export function getUniqueOnly(listA, listB) {
  const setB = new Set(listB);
  return listA.filter(item => !setB.has(item));
}

function mitreShort(technique) {
  if (!technique) return 'Unknown';
  const id = technique.split(' - ')[0]?.trim();
  return id || technique;
}

export function getGroupStats(groupName, incidents) {
  const records = incidents.filter(d => d.ransomware_group === groupName);
  const totalAttacks = records.length;

  if (totalAttacks === 0) {
    return {
      groupName,
      totalAttacks: 0,
      avgSeverity: 0,
      uniqueCountries: 0,
      uniqueSectors: 0,
      criticalCount: 0,
      criticalRate: 0,
      topCountry: '—',
      topSector: '—',
      topAttackVector: '—',
      topMitreTechnique: '—',
      firstSeen: '—',
      lastSeen: '—',
      countries: [],
      sectors: [],
      mitreTechniques: [],
      records: [],
      empty: true,
    };
  }

  const countries = getUniqueValues(records, 'country');
  const sectors = getUniqueValues(records, 'target_sector');
  const mitreTechniques = getUniqueValues(records, 'technique').map(mitreShort);
  const critical = getCriticalIncidents(records);
  const dates = records.map(r => r.date).sort();

  return {
    groupName,
    totalAttacks,
    avgSeverity: calculateAverageSeverity(records),
    uniqueCountries: countries.length,
    uniqueSectors: sectors.length,
    criticalCount: critical.length,
    criticalRate: Math.round((critical.length / totalAttacks) * 100),
    topCountry: getMostCommonValue(records, 'country') || '—',
    topSector: getMostCommonValue(records, 'target_sector') || '—',
    topAttackVector: getMostCommonValue(records, 'attack_vector') || '—',
    topMitreTechnique: mitreShort(getMostCommonValue(records, 'technique')),
    firstSeen: dates[0],
    lastSeen: dates[dates.length - 1],
    countries,
    sectors,
    mitreTechniques,
    records,
    empty: false,
  };
}

export function buildComparisonSummary(statsA, statsB) {
  const lines = [];
  const { groupName: nameA } = statsA;
  const { groupName: nameB } = statsB;

  const addNumericDiff = (label, valA, valB, decimals = 0) => {
    if (valA === valB) {
      lines.push({ text: `Both groups have the same ${label}`, tie: true });
      return;
    }
    if (valA > valB) {
      const diff = decimals ? (valA - valB).toFixed(decimals) : valA - valB;
      lines.push({ text: `${nameA} has +${diff} more ${label}`, winner: nameA });
    } else {
      const diff = decimals ? (valB - valA).toFixed(decimals) : valB - valA;
      lines.push({ text: `${nameB} has +${diff} more ${label}`, winner: nameB });
    }
  };

  addNumericDiff('attacks', statsA.totalAttacks, statsB.totalAttacks);

  if (statsA.avgSeverity === statsB.avgSeverity) {
    lines.push({ text: 'Both groups share the same average severity', tie: true });
  } else if (statsA.avgSeverity > statsB.avgSeverity) {
    const diff = (statsA.avgSeverity - statsB.avgSeverity).toFixed(1);
    lines.push({ text: `${nameA} has +${diff} higher average severity`, winner: nameA });
  } else {
    const diff = (statsB.avgSeverity - statsA.avgSeverity).toFixed(1);
    lines.push({ text: `${nameB} has +${diff} higher average severity`, winner: nameB });
  }

  addNumericDiff('targeted countries', statsA.uniqueCountries, statsB.uniqueCountries);
  addNumericDiff('targeted sectors', statsA.uniqueSectors, statsB.uniqueSectors);
  addNumericDiff('critical incidents', statsA.criticalCount, statsB.criticalCount);

  if (statsA.topMitreTechnique === statsB.topMitreTechnique && statsA.topMitreTechnique !== '—') {
    lines.push({ text: `Both groups mainly use ${statsA.topMitreTechnique}`, tie: true });
  }

  return lines;
}

export function buildMetricChartData(statsA, statsB) {
  return [
    { metric: 'Total Attacks', a: statsA.totalAttacks, b: statsB.totalAttacks },
    { metric: 'Avg Severity', a: statsA.avgSeverity, b: statsB.avgSeverity },
    { metric: 'Critical Incidents', a: statsA.criticalCount, b: statsB.criticalCount },
    { metric: 'Unique Countries', a: statsA.uniqueCountries, b: statsB.uniqueCountries },
    { metric: 'Unique Sectors', a: statsA.uniqueSectors, b: statsB.uniqueSectors },
  ];
}

export function getCombinedRecentIncidents(statsA, statsB, limit = 10) {
  const combined = [...statsA.records, ...statsB.records];
  return combined
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
