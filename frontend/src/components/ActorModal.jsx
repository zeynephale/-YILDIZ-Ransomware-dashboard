import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Modal from './Modal';
import ThreatActorBadge from './ThreatActorBadge';
import { normalizeThreatActorName } from '../utils/threatActorUtils';
import { StatTile, Section, BarList, SevPill } from './DetailBits';
import { getActorProfile } from '../data/profiles';
import { c, sevColor } from '../theme';

const monthLabel = (m) => {
  const [y, mo] = m.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+mo - 1] + " '" + y.slice(2);
};

export default function ActorModal({ name, onClose }) {
  const p = getActorProfile(name);
  if (!p) return null;

  const sev = sevColor(p.avgSeverity);
  const displayName = normalizeThreatActorName(p.name);
  const badgeVariant = p.avgSeverity >= 8 ? 'critical' : 'default';
  const trend = p.timeline.map(t => ({ ...t, label: monthLabel(t.month) }));

  return (
    <Modal onClose={onClose} maxWidth={760}>
      <div style={{ padding: '22px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <ThreatActorBadge name={p.name} size="lg" variant={badgeVariant} />
          <div>
            <div className="u-sans" style={{ fontSize: '17px', fontWeight: 700, color: c.text }}>{displayName}</div>
            <div style={{ fontSize: '10px', color: c.textDim, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Threat Actor Profile
            </div>
          </div>
          <span style={{
            marginLeft: 'auto', fontSize: '10px', padding: '4px 10px', borderRadius: '999px',
            background: `${sev}14`, border: `1px solid ${sev}33`, color: sev, letterSpacing: '0.4px',
          }}>
            {p.critPct}% critical rate
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '9px', margin: '16px 0' }}>
          <StatTile label="Attacks" value={p.total} />
          <StatTile label="Avg Severity" value={`${p.avgSeverity}/10`} color={sev} />
          <StatTile label="Countries" value={p.countries.length} />
          <StatTile label="Sectors" value={p.sectors.length} />
          <StatTile label="Critical" value={p.critical} color={p.critical ? c.crit : c.text} />
        </div>

        {trend.length > 1 && (
          <div style={{ marginBottom: '18px' }}>
            <Section title="Activity Over Time">
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={trend} margin={{ top: 6, right: 8, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c.accent} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.lineSoft} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 9, fontFamily: 'inherit' }} interval={0} axisLine={{ stroke: c.line }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: c.textDim, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: c.panelAlt, border: `1px solid ${c.lineHi}`, borderRadius: '6px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="attacks" name="Attacks" stroke={c.accent} fill="url(#actorGrad)" strokeWidth={1.75} dot={{ r: 2, fill: c.accentHi, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Section>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '18px' }}>
          <Section title="Targeted Countries"><BarList items={p.countries} color={c.crit} /></Section>
          <Section title="Targeted Sectors"><BarList items={p.sectors} color={c.accent} /></Section>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <Section title="MITRE ATT&CK Techniques">
            <BarList items={p.techniques} color={c.high} limit={6} renderName={(it) => it.name.split(' - ')[0]} />
          </Section>
        </div>

        <Section title={`Incident Log (${p.incidents.length})`}>
          <div style={{ maxHeight: '220px', overflowY: 'auto', border: `1px solid ${c.lineSoft}`, borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {['Date', 'Country', 'Sector', 'Technique', 'Sev'].map(h => (
                    <th key={h} style={{ position: 'sticky', top: 0, background: c.panel, padding: '8px 12px', textAlign: 'left', color: c.faint, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: `1px solid ${c.lineSoft}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.incidents.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${c.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', color: c.textDim }}>{r.date}</td>
                    <td style={{ padding: '8px 12px', color: c.textMut }}>{r.country}</td>
                    <td style={{ padding: '8px 12px', color: c.textMut }}>{r.target_sector}</td>
                    <td style={{ padding: '8px 12px', color: c.textDim }}>{r.mitre_id || r.technique.split(' - ')[0]}</td>
                    <td style={{ padding: '8px 12px' }}><SevPill s={r.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </Modal>
  );
}
