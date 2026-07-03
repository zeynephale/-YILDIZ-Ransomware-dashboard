import { Globe } from 'lucide-react';
import Modal from './Modal';
import ActorLink from './ActorLink';
import { StatTile, Section, BarList, SevPill } from './DetailBits';
import { getCountryProfile } from '../data/profiles';
import { c, sevColor } from '../theme';

export default function CountryModal({ code, name, onClose }) {
  const p = getCountryProfile(code);
  if (!p) {
    return (
      <Modal onClose={onClose} maxWidth={420}>
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: c.textMut, marginBottom: '4px' }}>{name}</div>
          <div style={{ fontSize: '11px', color: c.textDim }}>No recorded attacks for this country.</div>
        </div>
      </Modal>
    );
  }

  const sev = sevColor(p.avgSeverity);

  return (
    <Modal onClose={onClose} maxWidth={720}>
      <div style={{ padding: '22px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${c.crit}14`, border: `1px solid ${c.crit}33`,
          }}>
            <Globe size={18} style={{ color: c.crit }} />
          </div>
          <div>
            <div className="u-sans" style={{ fontSize: '17px', fontWeight: 700, color: c.text }}>
              {p.name} {p.code && <span style={{ fontSize: '11px', color: c.faint }}>({p.code})</span>}
            </div>
            <div style={{ fontSize: '10px', color: c.textDim, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Country Threat Profile
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '9px', margin: '16px 0' }}>
          <StatTile label="Attacks" value={p.total} />
          <StatTile label="Avg Severity" value={`${p.avgSeverity}/10`} color={sev} />
          <StatTile label="Threat Groups" value={p.groups.length} />
          <StatTile label="Sectors" value={p.sectors.length} />
          <StatTile label="Critical" value={p.critical} color={p.critical ? c.crit : c.text} />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <Section title={`Attributed Threat Groups (${p.groups.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {p.groups.map(g => {
                const max = p.groups[0].count;
                return (
                  <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40%', fontSize: '11.5px' }}>
                      <ActorLink name={g.name} />
                    </div>
                    <div style={{ flex: 1, height: '7px', background: c.lineSoft, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(g.count / max) * 100}%`, background: c.crit, opacity: 0.75, borderRadius: '4px' }} />
                    </div>
                    <div className="u-sans" style={{ width: '54px', textAlign: 'right', fontSize: '11px', color: c.textMut }}>
                      {g.count} hit{g.count > 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <Section title="Targeted Sectors"><BarList items={p.sectors} color={c.accent} /></Section>
        </div>

        <Section title={`Incident Log (${p.incidents.length})`}>
          <div style={{ maxHeight: '220px', overflowY: 'auto', border: `1px solid ${c.lineSoft}`, borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {['Date', 'Group', 'Sector', 'Vector', 'Sev'].map(h => (
                    <th key={h} style={{ position: 'sticky', top: 0, background: c.panel, padding: '8px 12px', textAlign: 'left', color: c.faint, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: `1px solid ${c.lineSoft}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.incidents.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${c.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', color: c.textDim }}>{r.date}</td>
                    <td style={{ padding: '8px 12px' }}><ActorLink name={r.ransomware_group} /></td>
                    <td style={{ padding: '8px 12px', color: c.textMut }}>{r.target_sector}</td>
                    <td style={{ padding: '8px 12px', color: c.textDim }}>{r.attack_vector}</td>
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
