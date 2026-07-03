import { c } from '../theme';

const NAV = [
  { id: 'overview',  label: 'Overview' },
  { id: 'groups',    label: 'Threat Groups' },
  { id: 'compare',   label: 'Compare' },
  { id: 'geo',       label: 'Geo & Sectors' },
  { id: 'timeline',  label: 'Timeline' },
  { id: 'ioc',       label: 'IOC Search' },
];

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <nav style={{
      background: 'rgba(6,9,16,0.82)',
      borderBottom: `1px solid ${c.line}`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1440px', margin: '0 auto',
        padding: '0 32px',
        display: 'flex', alignItems: 'center',
        height: '62px', gap: '36px',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', flexShrink: 0 }}>
          <img src="/loog.png" alt="CTI"
            style={{
              height: '30px', width: '30px',
              objectFit: 'contain',
              filter: 'invert(1) brightness(0.96)',
              opacity: 0.96,
            }}
          />
          <div>
            <div className="u-sans" style={{
              fontSize: '13px', fontWeight: 700,
              color: c.text, letterSpacing: '0.5px',
              lineHeight: 1.15,
            }}>
              CTI&nbsp;DASHBOARD
            </div>
            <div style={{ fontSize: '9px', color: c.textDim, letterSpacing: '2px', marginTop: '1px' }}>
              RANSOMWARE INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: c.line, flexShrink: 0 }} />

        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  position: 'relative',
                  padding: '7px 13px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: active ? c.text : c.textDim,
                  fontSize: '11.5px',
                  letterSpacing: '0.3px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = c.textMut; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = c.textDim; }}
              >
                {item.label}
                <span style={{
                  position: 'absolute', left: '13px', right: '13px', bottom: '-1px', height: '2px',
                  background: c.accent, borderRadius: '2px',
                  opacity: active ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }} />
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
