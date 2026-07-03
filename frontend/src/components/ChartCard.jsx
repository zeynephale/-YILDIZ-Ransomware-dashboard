import { c } from '../theme';

export default function ChartCard({ title, subtitle, children, action, style = {} }) {
  return (
    <div style={{
      background: c.panel,
      border: `1px solid ${c.line}`,
      borderRadius: '10px',
      overflow: 'visible',
      transition: 'border-color 0.2s ease',
      boxShadow: '0 1px 0 rgba(255,255,255,0.02) inset',
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.lineHi; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.line; }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '15px 20px',
        borderBottom: `1px solid ${c.lineSoft}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '3px', height: '13px', borderRadius: '2px', background: c.accent, opacity: 0.85 }} />
          <div>
            <div className="u-sans" style={{
              fontSize: '12px', color: c.text,
              letterSpacing: '0.3px', fontWeight: 600,
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '10px', color: c.textDim, marginTop: '2px', letterSpacing: '0.2px' }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {action && <div style={{ fontSize: '10px', color: c.textDim }}>{action}</div>}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}
