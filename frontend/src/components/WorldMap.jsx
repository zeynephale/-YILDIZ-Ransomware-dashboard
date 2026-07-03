import { useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { ransomwareData } from '../data/ransomwareData';
import { worldGeo } from '../data/worldGeo';
import { useDetail } from '../context/detail';
import { c } from '../theme';

const W = 980;
const H = 460;

const LOW  = [0xf4, 0xb0, 0xa8];
const HIGH = [0x8b, 0x14, 0x14];
const NO_DATA = '#111a27';

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const shade = (t) => `rgb(${lerp(LOW[0], HIGH[0], t)}, ${lerp(LOW[1], HIGH[1], t)}, ${lerp(LOW[2], HIGH[2], t)})`;

export default function WorldMap() {
  const { openCountry } = useDetail();
  const [hover, setHover] = useState(null);

  const { counts, names, max } = useMemo(() => {
    const counts = {};
    const names = {};
    ransomwareData.forEach(d => {
      const code = d.country_code;
      if (!code) return;
      counts[code] = (counts[code] || 0) + 1;
      names[code] = d.country;
    });
    return { counts, names, max: Math.max(1, ...Object.values(counts)) };
  }, []);

  const paths = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([W, H], worldGeo);
    const path = geoPath(projection);
    return worldGeo.features.map((f, i) => ({
      d: path(f),
      a2: f.properties.a2,
      name: f.properties.name,
      key: i,
    }));
  }, []);

  const colorFor = (count) => {
    if (!count) return NO_DATA;
    const t = Math.sqrt(count / max);
    return shade(t);
  };

  const move = (e, name, count, code) => {
    const box = e.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect();
    setHover({ name, count, code, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const top = useMemo(() =>
    Object.entries(counts)
      .map(([code, n]) => ({ code, n, name: names[code] }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5),
    [counts, names]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}
        onMouseLeave={() => setHover(null)}>
        {paths.map(p => {
          const count = counts[p.a2] || 0;
          const label = names[p.a2] || p.name;
          return (
            <path
              key={p.key}
              d={p.d}
              fill={colorFor(count)}
              stroke={c.bg}
              strokeWidth={0.4}
              style={{ cursor: count ? 'pointer' : 'default', transition: 'opacity 0.15s' }}
              opacity={hover && hover.name === label ? 0.85 : 1}
              onMouseMove={(e) => move(e, label, count, p.a2)}
              onClick={() => { if (count) openCountry(p.a2, label); }}
            />
          );
        })}

        {hover?.code && (() => {
          const hp = paths.find(p => p.a2 === hover.code);
          if (!hp) return null;
          return (
            <path
              d={hp.d}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.6}
              strokeLinejoin="round"
              pointerEvents="none"
              style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.55))' }}
            />
          );
        })()}
      </svg>

      {hover && (
        <div style={{
          position: 'absolute', left: hover.x + 14, top: hover.y + 12,
          pointerEvents: 'none', zIndex: 5,
          background: c.panelAlt, border: `1px solid ${c.lineHi}`,
          borderRadius: '6px', padding: '7px 11px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)', whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: '11.5px', color: c.text, fontWeight: 600 }}>{hover.name}</div>
          <div style={{ fontSize: '10.5px', color: hover.count ? c.crit : c.textDim, marginTop: '2px' }}>
            {hover.count ? `${hover.count} attack${hover.count > 1 ? 's' : ''}` : 'No recorded attacks'}
          </div>
          {hover.count > 0 && (
            <div style={{ fontSize: '9px', color: c.faint, marginTop: '3px', letterSpacing: '0.5px' }}>
              Click for details →
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', flexWrap: 'wrap', marginTop: '10px', padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ fontSize: '9px', color: c.faint, letterSpacing: '1px' }}>FEWER</span>
          <span style={{
            width: '140px', height: '8px', borderRadius: '4px',
            background: `linear-gradient(90deg, ${shade(0)}, ${shade(0.5)}, ${shade(1)})`,
          }} />
          <span style={{ fontSize: '9px', color: c.faint, letterSpacing: '1px' }}>MORE ATTACKS</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {top.map((t, i) => (
            <span key={t.code} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: colorFor(t.n) }} />
              <span style={{ color: c.textMut }}>{t.name}</span>
              <span style={{ color: c.faint }}>{t.n}</span>
              {i < top.length - 1 && <span style={{ color: c.line, marginLeft: '4px' }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
