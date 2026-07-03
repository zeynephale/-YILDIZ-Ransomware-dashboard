import { useState, useEffect, useRef } from 'react';
import { c } from '../theme';

const LINES = [
  { text: '$ ssh analyst@cti-platform.sec', delay: 0,    color: c.accent },
  { text: 'Authenticating... ████████████ OK', delay: 500,  color: c.textMut },
  { text: 'Loading threat intelligence database...', delay: 1000, color: c.textMut },
  { text: '[✓] Attack records loaded  [✓] Threat groups indexed  [✓] IOC engine', delay: 1600, color: c.med },
  { text: '[✓] MITRE ATT&CK framework  [✓] Geolocation engine', delay: 2000, color: c.med },
  { text: '─────────────────────────────────────────────', delay: 2400, color: c.line },
  { text: 'System operational. Launching CTI Dashboard...', delay: 2700, color: c.accent },
];

export default function BootScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress]         = useState(0);
  const [logoFill, setLogoFill]         = useState(0);
  const [exiting, setExiting]           = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timers = [];
    const start  = Date.now();
    const FILL_DURATION = 2800;

    const iv = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / FILL_DURATION) * 100);
      setLogoFill(p);
      if (p >= 100) clearInterval(iv);
    }, 33);

    LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(p => [...p, line]);
        setProgress(Math.round(((i + 1) / LINES.length) * 100));
        scrollRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
      }, line.delay));
    });

    timers.push(setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 700);
    }, 4200));

    return () => { timers.forEach(clearTimeout); clearInterval(iv); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: c.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.7s ease',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(59,164,196,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,164,196,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      <div style={{
        position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '640px', height: '360px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(59,164,196,0.05), transparent 70%)',
      }} />

      <Corner pos={{ top: 28, left: 28 }} />
      <Corner pos={{ top: 28, right: 28 }} mirror="h" />
      <Corner pos={{ bottom: 28, left: 28 }} mirror="v" />
      <Corner pos={{ bottom: 28, right: 28 }} mirror="both" />

      <div style={{ width: '100%', maxWidth: '720px', padding: '20px', position: 'relative', zIndex: 1 }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          padding: '10px 16px',
          background: c.panelAlt,
          border: `1px solid ${c.line}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#33405a' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#33405a' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#33405a' }} />
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: c.textDim, letterSpacing: '0.5px' }}>
            bash — analyst@cti-platform
          </span>
        </div>

        <div
          ref={scrollRef}
          style={{
            background: c.bgElev,
            border: `1px solid ${c.line}`,
            borderRadius: '0 0 8px 8px',
            padding: '20px 24px',
            height: '220px',
            overflowY: 'auto',
            fontFamily: 'inherit',
            fontSize: '12.5px',
            lineHeight: '1.8',
          }}
        >
          {visibleLines.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.color,
                opacity: 0,
                animation: `fadeUp 0.3s ease ${i * 0.05}s forwards`,
              }}
            >
              {line.text}
              {i === visibleLines.length - 1 && (
                <span style={{ animation: 'blink 1s step-end infinite', color: c.accent, marginLeft: 4 }}>█</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '14px' }}>
          <div style={{
            height: '2px',
            background: c.lineSoft,
            borderRadius: '1px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${c.accentDim}, ${c.accentHi})`,
              transition: 'width 0.4s ease',
              borderRadius: '1px',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '7px', fontSize: '10px', color: c.textDim, letterSpacing: '1px',
          }}>
            <span>INITIALIZING</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div style={{
          marginTop: '30px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            filter: `drop-shadow(0 0 ${(logoFill * 0.2).toFixed(1)}px rgba(59,164,196,${(logoFill * 0.006).toFixed(3)}))`,
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              WebkitMaskImage: 'url(/loog.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: 'url(/loog.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              background: `linear-gradient(to right,
                rgba(255,255,255,0.96) 0%,
                rgba(255,255,255,0.96) ${logoFill.toFixed(2)}%,
                rgba(255,255,255,0.06) ${logoFill.toFixed(2)}%,
                rgba(255,255,255,0.06) 100%
              )`,
            }} />
          </div>
          <div style={{
            fontSize: '10px', letterSpacing: '4px',
            color: `rgba(92,111,138,${(logoFill / 100).toFixed(3)})`,
            textTransform: 'uppercase',
          }}>
            Cyber Threat Intelligence Platform
          </div>
        </div>
      </div>
    </div>
  );
}

function Corner({ pos, mirror }) {
  const size = 18;
  const color = c.lineHi;
  const t = mirror === 'h' || mirror === 'both';
  const v = mirror === 'v' || mirror === 'both';
  return (
    <div style={{ position: 'absolute', ...pos, width: size, height: size, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top: 0, [t ? 'right' : 'left']: 0,
        width: size, height: 2, background: color,
      }} />
      <div style={{
        position: 'absolute', [v ? 'bottom' : 'top']: 0, [t ? 'right' : 'left']: 0,
        width: 2, height: size, background: color,
      }} />
    </div>
  );
}
