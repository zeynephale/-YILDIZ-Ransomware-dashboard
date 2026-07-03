import { c, sevColor } from '../theme';

export function StatTile({ label, value, color = c.text }) {
  return (
    <div style={{ background: c.panelAlt, border: `1px solid ${c.line}`, borderRadius: '8px', padding: '12px 14px' }}>
      <div style={{ fontSize: '9px', color: c.faint, letterSpacing: '1px', marginBottom: '5px' }}>{label.toUpperCase()}</div>
      <div className="u-sans" style={{ fontSize: '20px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: c.faint, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '9px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function BarList({ items, color = c.accent, renderName, limit = 6 }) {
  const shown = items.slice(0, limit);
  const max = Math.max(1, ...shown.map(i => i.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {shown.map((it) => (
        <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38%', fontSize: '11px', color: c.textMut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {renderName ? renderName(it) : it.name}
          </div>
          <div style={{ flex: 1, height: '7px', background: c.lineSoft, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(it.count / max) * 100}%`, background: color, opacity: 0.8, borderRadius: '4px' }} />
          </div>
          <div className="u-sans" style={{ width: '22px', textAlign: 'right', fontSize: '11px', color: c.text, fontWeight: 600 }}>{it.count}</div>
        </div>
      ))}
    </div>
  );
}

export function SevPill({ s }) {
  const col = sevColor(s);
  const label = s >= 9 ? 'CRIT' : s >= 7 ? 'HIGH' : 'MED';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 7px', borderRadius: '4px',
      background: `${col}14`, border: `1px solid ${col}33`, color: col,
      fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px',
    }}>{label} {s}</span>
  );
}
