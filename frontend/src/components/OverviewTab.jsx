import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import ActorLink from './ActorLink';
import {
  ransomwareData, getGroupDistribution, getSectorDistribution, getAverageSeverity,
  getSeverityDistribution, getTechniqueDistribution,
} from '../data/ransomwareData';
import { c, ramp, sevColor, sevLabel } from '../theme';
import totalAttacksImg from '../assets/icons/total_attacks.png';
import threatGroupsImg from '../assets/icons/threat_groups.png';
import countriesImg from '../assets/icons/countries_targeted.png';
import avgSeverityImg from '../assets/icons/avg_severity.png';

const truncate = (s) => (s && s.length > 22 ? s.slice(0, 21) + '…' : s);

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: c.panelAlt, border: `1px solid ${c.lineHi}`,
      borderRadius: '6px', padding: '8px 12px',
      fontSize: '11px', fontFamily: 'inherit',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: c.textMut, marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: c.text }}>
          {p.name}: <strong style={{ color: c.accentHi }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const TechTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: c.panelAlt, border: `1px solid ${c.lineHi}`,
      borderRadius: '6px', padding: '8px 12px', fontSize: '11px',
      fontFamily: 'inherit', maxWidth: '260px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: c.text, marginBottom: '3px' }}>{d.name}</div>
      <div style={{ color: c.textMut }}>Incidents: <strong style={{ color: c.accentHi }}>{d.count}</strong></div>
    </div>
  );
};

const SevBadge = ({ s }) => {
  const col = sevColor(s);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '4px',
      background: `${col}14`, border: `1px solid ${col}33`,
      color: col, fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px',
    }}>
      {sevLabel(s)} {s}
    </span>
  );
};

export default function OverviewTab() {
  const groups   = getGroupDistribution().slice(0, 15);
  const sectors  = getSectorDistribution();
  const avgSev   = getAverageSeverity();
  const critical = ransomwareData.filter(d => d.severity >= 9).length;
  const uniqC    = [...new Set(ransomwareData.map(d => d.country))].length;
  const uniqG    = [...new Set(ransomwareData.map(d => d.ransomware_group))].length;
  const recent   = [...ransomwareData].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const groupRamp  = ramp(groups.length);
  const sectorRamp = ramp(sectors.length);

  const sevBuckets = getSeverityDistribution();
  const sevBands = [
    { name: 'Medium (1–6)',   value: sevBuckets.filter(b => b.severity <= 6).reduce((s, b) => s + b.count, 0), color: c.med },
    { name: 'High (7–8)',     value: sevBuckets.filter(b => b.severity >= 7 && b.severity <= 8).reduce((s, b) => s + b.count, 0), color: c.high },
    { name: 'Critical (9–10)',value: sevBuckets.filter(b => b.severity >= 9).reduce((s, b) => s + b.count, 0), color: c.crit },
  ];
  const techniques = getTechniqueDistribution()
    .slice(0, 8)
    .map(t => ({ ...t, short: t.name.split(' - ')[0] }));
  const techRamp = ramp(techniques.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <StatCard title="Total Attacks"      value={ransomwareData.length} subtitle="Tracked incidents"       image={totalAttacksImg} trend={{ up: true, value: '+12% vs prior period' }} />
        <StatCard title="Threat Groups"      value={uniqG}          subtitle="Active families"                image={threatGroupsImg} />
        <StatCard title="Countries Targeted" value={uniqC}          subtitle="Unique nation-states"            image={countriesImg} />
        <StatCard title="Avg Severity"       value={`${avgSev}/10`} subtitle={`${critical} critical events`}  image={avgSeverityImg} emphasis={sevColor(avgSev)} trend={{ up: false, value: 'High threat level' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
        <ChartCard title="Ransomware Group Distribution" subtitle="Top 15 threat actors by attack count">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={groups} margin={{ top: 4, right: 8, left: -24, bottom: 56 }}>
              <XAxis dataKey="name" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} angle={-35} textAnchor="end" interval={0} axisLine={{ stroke: c.line }} tickLine={false} />
              <YAxis tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="count" name="Attacks" radius={[3, 3, 0, 0]} maxBarSize={30}>
                {groups.map((_, i) => <Cell key={i} fill={groupRamp[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Target Sector Distribution" subtitle="Attacks by industry vertical">
          <ResponsiveContainer width="100%" height={Math.max(240, sectors.length * 22)}>
            <BarChart data={sectors} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={150} tickFormatter={truncate} axisLine={false} tickLine={false} interval={0} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="count" name="Attacks" radius={[0, 3, 3, 0]} maxBarSize={14}>
                {sectors.map((_, i) => <Cell key={i} fill={sectorRamp[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
        <ChartCard title="Severity Distribution" subtitle="Incidents grouped by threat band">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flexShrink: 0, position: 'relative', width: 200, height: 200 }}>
              <PieChart width={200} height={200}>
                <Pie data={sevBands} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={54} outerRadius={84} paddingAngle={2} stroke="none"
                  isAnimationActive={false}>
                  {sevBands.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              }}>
                <span className="u-sans" style={{ fontSize: '26px', fontWeight: 700, color: c.text }}>
                  {ransomwareData.length}
                </span>
                <span style={{ fontSize: '9px', color: c.faint, letterSpacing: '1px' }}>INCIDENTS</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sevBands.map(b => (
                <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: b.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: c.textMut, flex: 1 }}>{b.name}</span>
                  <span className="u-sans" style={{ fontSize: '13px', fontWeight: 700, color: c.text }}>{b.value}</span>
                  <span style={{ fontSize: '10px', color: c.faint, width: '34px', textAlign: 'right' }}>
                    {Math.round((b.value / ransomwareData.length) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Top MITRE ATT&CK Techniques" subtitle="Most observed adversary techniques">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={techniques} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="short" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={72} axisLine={false} tickLine={false} />
              <Tooltip content={<TechTip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="count" name="Incidents" radius={[0, 3, 3, 0]} maxBarSize={16}>
                {techniques.map((_, i) => <Cell key={i} fill={techRamp[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Recent Attack Records" subtitle="Latest threat intelligence entries">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'inherit' }}>
            <thead>
              <tr>
                {['Date', 'Group', 'Country', 'Sector', 'Vector', 'Technique', 'Sev'].map(h => (
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
              {recent.map((row) => (
                <tr key={row.id}
                  style={{ borderBottom: `1px solid ${c.lineSoft}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = c.accentBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px 12px', color: c.textDim }}>{row.date}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}><ActorLink name={row.ransomware_group} /></td>
                  <td style={{ padding: '10px 12px', color: c.textMut }}>{row.country}</td>
                  <td style={{ padding: '10px 12px', color: c.textMut }}>{row.target_sector}</td>
                  <td style={{ padding: '10px 12px', color: c.textDim, fontSize: '10px' }}>{row.attack_vector}</td>
                  <td style={{ padding: '10px 12px', color: c.textDim, fontSize: '10px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.technique.split(' - ')[0]}
                  </td>
                  <td style={{ padding: '10px 12px' }}><SevBadge s={row.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

    </div>
  );
}
