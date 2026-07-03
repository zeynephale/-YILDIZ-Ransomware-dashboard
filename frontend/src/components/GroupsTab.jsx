import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartCard from './ChartCard';
import ActorLink from './ActorLink';
import ThreatActorBadge from './ThreatActorBadge';
import { ransomwareData, getGroupDistribution } from '../data/ransomwareData';
import { c, ramp, sevColor } from '../theme';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.panelAlt, border: `1px solid ${c.lineHi}`, borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ color: c.textMut, marginBottom: '3px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: c.text }}>{p.name}: <strong style={{ color: c.accentHi }}>{p.value}</strong></div>)}
    </div>
  );
};

export default function GroupsTab() {
  const groups = getGroupDistribution().slice(0, 15);
  const barRamp = ramp(groups.length);

  const stats = groups.map((g, i) => {
    const attacks = ransomwareData.filter(d => d.ransomware_group === g.name);
    const avgSev  = +(attacks.reduce((s, a) => s + a.severity, 0) / attacks.length).toFixed(1);
    const countries = [...new Set(attacks.map(d => d.country))].length;
    const sectors   = [...new Set(attacks.map(d => d.target_sector))].length;
    const critical  = attacks.filter(d => d.severity >= 9).length;
    const critPct   = Math.round((critical / attacks.length) * 100);
    return { ...g, avgSev, countries, sectors, critical, critPct, tone: barRamp[i] };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
        <ChartCard title="Attack Frequency" subtitle="Total incidents per threat actor">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats} layout="vertical" margin={{ top: 0, right: 36, left: 90, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={90} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="count" name="Attacks" radius={[0, 3, 3, 0]} maxBarSize={16}>
                {stats.map((g, i) => <Cell key={i} fill={g.tone} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Severity Score" subtitle="Mean severity per ransomware family">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats} layout="vertical" margin={{ top: 0, right: 36, left: 90, bottom: 0 }}>
              <XAxis type="number" domain={[0, 10]} tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={90} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="avgSev" name="Avg Severity" radius={[0, 3, 3, 0]} maxBarSize={16}>
                {stats.map((g) => <Cell key={g.name} fill={sevColor(g.avgSev)} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Threat Actor Profiles" subtitle="Intelligence summary per group">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '11px' }}>
          {stats.map(g => <GroupCard key={g.name} g={g} />)}
        </div>
      </ChartCard>

    </div>
  );
}

function GroupCard({ g }) {
  const sev = sevColor(g.avgSev);
  return (
    <div style={{
      background: c.panelAlt,
      border: `1px solid ${c.line}`,
      borderRadius: '8px', padding: '15px 16px',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.lineHi; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.line; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThreatActorBadge name={g.name} size="sm" variant={g.avgSev >= 8 ? 'critical' : 'default'} />
          <ActorLink name={g.name} color={c.text} badge={false} style={{ fontWeight: 600, fontSize: '12.5px', borderBottom: 'none' }} />
        </span>
        <span style={{
          fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
          background: c.accentBg, border: `1px solid ${c.accentLine}`, color: c.accentHi,
        }}>{g.count} attacks</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '10px', marginBottom: '13px' }}>
        <Metric label="Avg Sev"   value={g.avgSev}   color={sev} />
        <Metric label="Countries" value={g.countries} color={c.textMut} />
        <Metric label="Sectors"   value={g.sectors}   color={c.textMut} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: c.textDim, marginBottom: '4px' }}>
          <span style={{ letterSpacing: '0.5px' }}>CRITICAL RATE</span><span style={{ color: sev }}>{g.critPct}%</span>
        </div>
        <div style={{ height: '3px', background: c.lineSoft, borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${g.critPct}%`, background: sev, opacity: 0.8, borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ color: c.faint, marginBottom: '3px', letterSpacing: '0.3px' }}>{label}</div>
      <div className="u-sans" style={{ color, fontWeight: 600, fontSize: '13px' }}>{value}</div>
    </div>
  );
}
