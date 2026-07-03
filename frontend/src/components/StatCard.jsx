import { c } from '../theme';

export default function StatCard({ title, value, subtitle, icon: Icon, image, trend, emphasis }) {
  const valueColor = emphasis || c.text;
  return (
    <div style={{
      background: c.panel,
      border: `1px solid ${c.line}`,
      borderRadius: '10px',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.lineHi; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.line; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          fontSize: '10px', color: c.textDim,
          letterSpacing: '1.4px', textTransform: 'uppercase',
        }}>
          {title}
        </div>
        {image ? (
          <img
            src={image} alt="" aria-hidden="true"
            style={{
              width: '58px', height: '58px', objectFit: 'contain',
              marginTop: '-6px', marginRight: '-4px',
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))',
              userSelect: 'none', pointerEvents: 'none',
            }}
          />
        ) : Icon && (
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(150deg, ${c.accentBg2}, ${c.accentBg})`,
            border: `1px solid ${c.accentLine}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <Icon size={17} style={{ color: c.accentHi }} strokeWidth={1.6} />
          </div>
        )}
      </div>

      <div className="u-sans" style={{
        fontSize: '30px', fontWeight: 700,
        color: valueColor,
        lineHeight: 1, marginBottom: '7px',
        letterSpacing: '-0.5px',
      }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '11px', color: c.textDim }}>{subtitle}</div>
      )}

      {trend && (
        <div style={{
          marginTop: '9px', fontSize: '10px',
          color: trend.up ? c.med : c.crit,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span>{trend.up ? '▲' : '▼'}</span>
          <span style={{ letterSpacing: '0.2px' }}>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
