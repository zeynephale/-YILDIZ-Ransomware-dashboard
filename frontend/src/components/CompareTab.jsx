import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeftRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import ChartCard from './ChartCard';
import ActorLink from './ActorLink';
import ThreatActorBadge from './ThreatActorBadge';
import { ransomwareData, getGroupDistribution } from '../data/ransomwareData';
import {
  getGroupStats,
  getOverlap,
  getUniqueOnly,
  buildComparisonSummary,
  buildMetricChartData,
  getCombinedRecentIncidents,
} from '../utils/groupComparison';
import { c, series } from '../theme';

const compareSevColor = (s) => (s >= 8 ? c.crit : s >= 6 ? c.high : c.accent);

const SevBadge = ({ s }) => {
  const col = compareSevColor(s);
  const label = s >= 8 ? 'CRIT' : s >= 6 ? 'HIGH' : 'NORM';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '4px',
      background: `${col}14`, border: `1px solid ${col}33`,
      color: col, fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px',
    }}>
      {label} {s}
    </span>
  );
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: c.panelAlt, border: `1px solid ${c.lineHi}`,
      borderRadius: '6px', padding: '8px 12px', fontSize: '11px',
      fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: c.textMut, marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || c.text }}>
          {p.name}: <strong style={{ color: c.accentHi }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const selectStyle = {
  width: '100%',
  padding: '11px 12px',
  background: c.bgElev,
  border: `1px solid ${c.line}`,
  borderRadius: '7px',
  color: c.text,
  fontSize: '12px',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235c6f8a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
};

function EmptyState({ message }) {
  return (
    <div style={{
      background: c.panel,
      border: `1px solid ${c.line}`,
      borderRadius: '10px',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <ArrowLeftRight size={28} style={{ color: c.faint, marginBottom: '14px' }} />
      <div style={{ fontSize: '12px', color: c.textMut, letterSpacing: '0.2px' }}>
        {message}
      </div>
    </div>
  );
}

function GroupCompareCard({ stats }) {
  if (stats.empty) {
    return (
      <div style={{
        background: c.panelAlt,
        border: `1px solid ${c.line}`,
        borderRadius: '10px',
        padding: '24px',
        textAlign: 'center',
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: '11px', color: c.textDim }}>
          No incident records found for this group.
        </div>
      </div>
    );
  }

  const sevCol = compareSevColor(stats.avgSeverity);

  return (
    <div style={{
      background: c.panelAlt,
      border: `1px solid ${c.line}`,
      borderRadius: '10px',
      padding: '20px',
      transition: 'border-color 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.lineHi; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.line; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThreatActorBadge
            name={stats.groupName}
            size="md"
            variant={stats.avgSeverity >= 8 ? 'critical' : 'default'}
          />
          <ActorLink
            name={stats.groupName}
            color={c.text}
            badge={false}
            style={{ fontWeight: 700, fontSize: '14px', borderBottom: 'none' }}
          />
        </span>
        <span style={{
          fontSize: '10px', padding: '3px 8px', borderRadius: '4px',
          background: c.accentBg, border: `1px solid ${c.accentLine}`, color: c.accentHi,
        }}>
          {stats.totalAttacks} attacks
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <StatBlock label="Avg Severity" value={`${stats.avgSeverity}/10`} color={sevCol} />
        <StatBlock label="Critical Incidents" value={stats.criticalCount} color={compareSevColor(8)} />
        <StatBlock label="Critical Rate" value={`${stats.criticalRate}%`} color={sevCol} />
        <StatBlock label="Countries" value={stats.uniqueCountries} />
        <StatBlock label="Sectors" value={stats.uniqueSectors} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10.5px' }}>
        <DetailRow label="Top Country" value={stats.topCountry} />
        <DetailRow label="Top Sector" value={stats.topSector} />
        <DetailRow label="Top Attack Vector" value={stats.topAttackVector} />
        <DetailRow label="Top MITRE Technique" value={stats.topMitreTechnique} mono />
        <DetailRow label="First Seen" value={stats.firstSeen} />
        <DetailRow label="Last Seen" value={stats.lastSeen} />
      </div>
    </div>
  );
}

function StatBlock({ label, value, color = c.textMut }) {
  return (
    <div style={{
      background: c.panel,
      border: `1px solid ${c.lineSoft}`,
      borderRadius: '6px',
      padding: '10px 12px',
    }}>
      <div style={{ color: c.faint, fontSize: '9px', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div className="u-sans" style={{ color, fontWeight: 700, fontSize: '15px' }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <span style={{ color: c.faint, letterSpacing: '0.3px', flexShrink: 0 }}>{label}</span>
      <span style={{
        color: c.textMut,
        textAlign: 'right',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
        fontSize: mono ? '10px' : '10.5px',
      }}>
        {value}
      </span>
    </div>
  );
}

function OverlapPanel({ title, shared, uniqueA, uniqueB, nameA, nameB }) {
  const renderTags = (items, color) => {
    if (!items.length) {
      return <span style={{ fontSize: '10px', color: c.faint }}>None</span>;
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {items.map(item => (
          <span key={item} style={{
            fontSize: '9.5px', padding: '3px 7px', borderRadius: '4px',
            background: `${color}12`, border: `1px solid ${color}28`, color,
          }}>
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: c.panelAlt,
      border: `1px solid ${c.line}`,
      borderRadius: '8px',
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: c.text, marginBottom: '10px', letterSpacing: '0.2px' }}>
        {title}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '9px', color: c.faint, letterSpacing: '0.5px', marginBottom: '6px' }}>SHARED</div>
        {shared.length
          ? renderTags(shared, c.accentHi)
          : <span style={{ fontSize: '10px', color: c.textDim }}>No overlap detected</span>}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '9px', color: c.faint, letterSpacing: '0.5px', marginBottom: '6px' }}>
          UNIQUE TO {nameA.toUpperCase()}
        </div>
        {renderTags(uniqueA, series[1])}
      </div>
      <div>
        <div style={{ fontSize: '9px', color: c.faint, letterSpacing: '0.5px', marginBottom: '6px' }}>
          UNIQUE TO {nameB.toUpperCase()}
        </div>
        {renderTags(uniqueB, series[2])}
      </div>
    </div>
  );
}

export default function CompareTab() {
  const groups = useMemo(() => getGroupDistribution().map(g => g.name), []);
  const [groupA, setGroupA] = useState('');
  const [groupB, setGroupB] = useState('');

  const sameGroup = groupA && groupB && groupA === groupB;
  const ready = groupA && groupB && !sameGroup;

  const statsA = useMemo(
    () => (groupA ? getGroupStats(groupA, ransomwareData) : null),
    [groupA],
  );
  const statsB = useMemo(
    () => (groupB ? getGroupStats(groupB, ransomwareData) : null),
    [groupB],
  );

  const summary = useMemo(
    () => (ready && statsA && statsB ? buildComparisonSummary(statsA, statsB) : []),
    [ready, statsA, statsB],
  );

  const chartData = useMemo(
    () => (ready && statsA && statsB ? buildMetricChartData(statsA, statsB) : []),
    [ready, statsA, statsB],
  );

  const recentIncidents = useMemo(
    () => (ready && statsA && statsB ? getCombinedRecentIncidents(statsA, statsB) : []),
    [ready, statsA, statsB],
  );

  const sharedCountries = ready ? getOverlap(statsA.countries, statsB.countries) : [];
  const sharedSectors = ready ? getOverlap(statsA.sectors, statsB.sectors) : [];
  const sharedMitre = ready ? getOverlap(statsA.mitreTechniques, statsB.mitreTechniques) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{
        background: c.panel, border: `1px solid ${c.line}`,
        borderRadius: '10px', padding: '24px',
      }}>
        <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '3px', height: '26px', borderRadius: '2px', background: c.accent, opacity: 0.85 }} />
          <div>
            <div className="u-sans" style={{ fontSize: '12px', color: c.text, letterSpacing: '0.3px', fontWeight: 600 }}>
              Threat Group Comparison
            </div>
            <div style={{ fontSize: '10px', color: c.textDim, marginTop: '2px' }}>
              Compare ransomware families across activity, severity, countries, sectors and MITRE techniques.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: c.faint, letterSpacing: '0.5px', marginBottom: '6px' }}>
              SELECT FIRST GROUP
            </label>
            <select
              value={groupA}
              onChange={e => setGroupA(e.target.value)}
              style={selectStyle}
            >
              <option value="">Choose a group…</option>
              {groups.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: c.faint, letterSpacing: '0.5px', marginBottom: '6px' }}>
              SELECT SECOND GROUP
            </label>
            <select
              value={groupB}
              onChange={e => setGroupB(e.target.value)}
              style={selectStyle}
            >
              <option value="">Choose a group…</option>
              {groups.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {sameGroup && (
          <div style={{
            marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '10.5px', color: c.high,
            background: `${c.high}10`, border: `1px solid ${c.high}33`,
            borderRadius: '6px', padding: '8px 12px',
          }}>
            <AlertTriangle size={14} />
            Select two different groups — a group cannot be compared with itself.
          </div>
        )}
      </div>

      {!groupA && !groupB && (
        <EmptyState message="Select two ransomware groups to compare their behavior and impact." />
      )}

      {(groupA && !groupB) || (!groupA && groupB) ? (
        <EmptyState message="Select another group to start comparison." />
      ) : null}

      {ready && statsA && statsB && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 280px) minmax(0, 1fr)',
            gap: '14px',
            alignItems: 'stretch',
          }}>
            <GroupCompareCard stats={statsA} />

            <div style={{
              background: c.panel,
              border: `1px solid ${c.line}`,
              borderRadius: '10px',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div style={{
                fontSize: '10px', color: c.faint, letterSpacing: '1px',
                marginBottom: '14px', textAlign: 'center',
              }}>
                COMPARISON SUMMARY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {summary.map((line, i) => (
                  <div key={i} style={{
                    fontSize: '10.5px',
                    color: line.tie ? c.textDim : c.textMut,
                    padding: '8px 10px',
                    background: line.tie ? c.bgElev : c.accentBg,
                    border: `1px solid ${line.tie ? c.lineSoft : c.accentLine}`,
                    borderRadius: '6px',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>

            <GroupCompareCard stats={statsB} />
          </div>

          <ChartCard title="Metric Comparison" subtitle="Side-by-side activity and impact indicators">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                <XAxis
                  dataKey="metric"
                  tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }}
                  axisLine={{ stroke: c.line }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: c.textDim, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals
                />
                <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: c.textDim, paddingTop: '8px' }}
                />
                <Bar dataKey="a" name={statsA.groupName} fill={series[0]} radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {chartData.map((_, i) => <Cell key={i} fill={series[0]} />)}
                </Bar>
                <Bar dataKey="b" name={statsB.groupName} fill={series[1]} radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {chartData.map((_, i) => <Cell key={i} fill={series[1]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Overlap Analysis" subtitle="Shared and unique targeting profiles">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <OverlapPanel
                title="Targeted Countries"
                shared={sharedCountries}
                uniqueA={getUniqueOnly(statsA.countries, statsB.countries)}
                uniqueB={getUniqueOnly(statsB.countries, statsA.countries)}
                nameA={statsA.groupName}
                nameB={statsB.groupName}
              />
              <OverlapPanel
                title="Targeted Sectors"
                shared={sharedSectors}
                uniqueA={getUniqueOnly(statsA.sectors, statsB.sectors)}
                uniqueB={getUniqueOnly(statsB.sectors, statsA.sectors)}
                nameA={statsA.groupName}
                nameB={statsB.groupName}
              />
              <OverlapPanel
                title="MITRE Techniques"
                shared={sharedMitre}
                uniqueA={getUniqueOnly(statsA.mitreTechniques, statsB.mitreTechniques)}
                uniqueB={getUniqueOnly(statsB.mitreTechniques, statsA.mitreTechniques)}
                nameA={statsA.groupName}
                nameB={statsB.groupName}
              />
            </div>
          </ChartCard>

          <ChartCard title="Recent Incidents" subtitle="Latest combined records for both selected groups">
            {recentIncidents.length === 0 ? (
              <div style={{ fontSize: '11px', color: c.textDim, textAlign: 'center', padding: '24px' }}>
                No incident records found for this group.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'inherit' }}>
                  <thead>
                    <tr>
                      {['Date', 'Group', 'Country', 'Sector', 'Attack Vector', 'MITRE Technique', 'Severity'].map(h => (
                        <th key={h} style={{
                          padding: '8px 12px', textAlign: 'left',
                          color: c.faint, fontSize: '10px', letterSpacing: '1px',
                          fontWeight: 500, textTransform: 'uppercase',
                          borderBottom: `1px solid ${c.lineSoft}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map(row => (
                      <tr key={row.id}
                        style={{ borderBottom: `1px solid ${c.lineSoft}`, transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = c.accentBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '10px 12px', color: c.textDim }}>{row.date}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                          <ActorLink name={row.ransomware_group} />
                        </td>
                        <td style={{ padding: '10px 12px', color: c.textMut }}>{row.country}</td>
                        <td style={{ padding: '10px 12px', color: c.textMut }}>{row.target_sector}</td>
                        <td style={{ padding: '10px 12px', color: c.textDim, fontSize: '10px' }}>{row.attack_vector}</td>
                        <td style={{ padding: '10px 12px', color: c.textDim, fontSize: '10px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(row.technique || '').split(' - ')[0]}
                        </td>
                        <td style={{ padding: '10px 12px' }}><SevBadge s={row.severity} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}
