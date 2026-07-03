import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartCard from './ChartCard';
import { ransomwareData, getCountryDistribution, getSectorDistribution, getAttackVectorDistribution, getTechniqueDistribution } from '../data/ransomwareData';
import WorldMap from './WorldMap';
import { c, ramp, sevColor } from '../theme';

const truncate = (s) => (s && s.length > 22 ? s.slice(0, 21) + '…' : s);

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.panelAlt, border: `1px solid ${c.lineHi}`, borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ color: c.textMut, marginBottom: '3px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: c.text }}>{p.name}: <strong style={{ color: c.accentHi }}>{p.value}</strong></div>)}
    </div>
  );
};

export default function GeoTab() {
  const countries = getCountryDistribution();
  const sectors   = getSectorDistribution();
  const vectors   = getAttackVectorDistribution();

  const techniques  = getTechniqueDistribution().slice(0, 10).map(t => ({ ...t, short: t.name.split(' - ')[0] }));

  const countryRamp = ramp(countries.length);
  const vectorRamp  = ramp(vectors.length);
  const techRamp    = ramp(techniques.length);

  const sectorStats = sectors.map(s => {
    const a   = ransomwareData.filter(d => d.target_sector === s.name);
    const avg = +(a.reduce((acc, x) => acc + x.severity, 0) / a.length).toFixed(1);
    return { ...s, avgSev: avg, critical: a.filter(d => d.severity >= 9).length };
  });
  const sectorRamp = ramp(sectorStats.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <ChartCard title="Global Attack Distribution" subtitle="Ransomware incidents by country — darker red means more attacks">
        <WorldMap />
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
        <ChartCard title="Top Targeted Countries" subtitle="Attack frequency by nation-state">
          <ResponsiveContainer width="100%" height={Math.max(300, countries.length * 22)}>
            <BarChart data={countries} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={130} tickFormatter={truncate} axisLine={false} tickLine={false} interval={0} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="count" name="Attacks" radius={[0, 3, 3, 0]} maxBarSize={14}>
                {countries.map((_, i) => <Cell key={i} fill={countryRamp[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attack Vector Distribution" subtitle="Initial access techniques used">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vectors} layout="vertical" margin={{ top: 0, right: 36, left: 140, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={140} tickFormatter={truncate} axisLine={false} tickLine={false} interval={0} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="count" name="Count" radius={[0, 3, 3, 0]} maxBarSize={12}>
                {vectors.map((_, i) => <Cell key={i} fill={vectorRamp[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="MITRE ATT&CK Technique Frequency" subtitle="Adversary techniques mapped across all incidents">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={techniques} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="short" type="category" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} width={80} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
            <Bar dataKey="count" name="Incidents" radius={[0, 3, 3, 0]} maxBarSize={16}>
              {techniques.map((_, i) => <Cell key={i} fill={techRamp[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Sector Risk Analysis" subtitle="Attack count by industry vertical">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sectorStats} margin={{ top: 4, right: 8, left: -24, bottom: 56 }}>
            <XAxis dataKey="name" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} angle={-35} textAnchor="end" interval={0} axisLine={{ stroke: c.line }} tickLine={false} />
            <YAxis tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
            <Bar dataKey="count" name="Attacks" radius={[3, 3, 0, 0]} maxBarSize={36}>
              {sectorStats.map((_, i) => <Cell key={i} fill={sectorRamp[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Sector Threat Matrix" subtitle="Risk profile per industry">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '9px' }}>
          {sectorStats.map((s, i) => {
            const sev = sevColor(s.avgSev);
            return (
              <div key={s.name} style={{
                background: c.panelAlt, border: `1px solid ${c.line}`,
                borderRadius: '8px', padding: '13px 14px',
                transition: 'border-color 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.lineHi; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = c.line; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: sectorRamp[i] }} />
                  <span className="u-sans" style={{ fontSize: '11.5px', color: c.text, fontWeight: 500 }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '10px' }}>
                  <div><div style={{ color: c.faint }}>Attacks</div><div className="u-sans" style={{ color: c.text, fontWeight: 600 }}>{s.count}</div></div>
                  <div><div style={{ color: c.faint }}>Avg Sev</div><div className="u-sans" style={{ color: sev, fontWeight: 600 }}>{s.avgSev}</div></div>
                  <div><div style={{ color: c.faint }}>Critical</div><div className="u-sans" style={{ color: s.critical ? c.crit : c.textMut, fontWeight: 600 }}>{s.critical}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

    </div>
  );
}
