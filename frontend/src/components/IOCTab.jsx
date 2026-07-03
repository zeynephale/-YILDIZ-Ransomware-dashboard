import { useState, useEffect } from 'react';
import { Search, SearchX, Shield, Globe, AlertTriangle } from 'lucide-react';
import { searchIOC, fetchIOCSamples } from '../data/ransomwareData';
import ChartCard from './ChartCard';
import ActorLink from './ActorLink';
import { c, sevColor } from '../theme';

export default function IOCTab() {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [samples,  setSamples]  = useState([]);

  useEffect(() => { fetchIOCSamples().then(setSamples); }, []);

  const run = async () => {
    if (!query.trim()) return;
    setScanning(true);
    try {
      const found = await searchIOC(query);
      setResults(found);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{
        background: c.panel, border: `1px solid ${c.line}`,
        borderRadius: '10px', padding: '24px',
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '3px', height: '26px', borderRadius: '2px', background: c.accent, opacity: 0.85 }} />
          <div>
            <div className="u-sans" style={{ fontSize: '12px', color: c.text, letterSpacing: '0.3px', fontWeight: 600 }}>
              IOC Search
            </div>
            <div style={{ fontSize: '10px', color: c.textDim, marginTop: '2px' }}>
              Search by IP address or file hash to find correlated threat records
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '13px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: c.textDim, pointerEvents: 'none' }} />
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && run()}
              placeholder="Enter IP address or hash value..."
              style={{
                width: '100%', padding: '11px 12px 11px 38px',
                background: c.bgElev, border: `1px solid ${c.line}`,
                borderRadius: '7px', color: c.text,
                fontSize: '12px', fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = c.accentLine; }}
              onBlur={e => { e.target.style.borderColor = c.line; }}
            />
          </div>
          <button
            onClick={run} disabled={scanning}
            style={{
              padding: '11px 20px',
              background: scanning ? c.panelAlt : c.accentBg,
              border: `1px solid ${c.accentLine}`,
              borderRadius: '7px', color: c.accentHi,
              fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer',
              letterSpacing: '0.4px', fontWeight: 500,
              transition: 'all 0.15s', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={e => { if (!scanning) e.currentTarget.style.background = c.accentBg2; }}
            onMouseLeave={e => { e.currentTarget.style.background = scanning ? c.panelAlt : c.accentBg; }}
          >
            <Search size={13} />
            {scanning ? 'Scanning...' : 'Search IOC'}
          </button>
        </div>
      </div>

      {searched && !scanning && (
        <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
          {results.length === 0 ? (
            <div style={{
              background: c.panel, border: `1px solid ${c.line}`, borderRadius: '10px',
              padding: '44px 40px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.bgElev, border: `1px solid ${c.line}`,
              }}>
                <SearchX size={20} style={{ color: c.textDim }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: c.textMut, marginBottom: '5px', fontWeight: 500 }}>
                  No matches found
                </div>
                <div style={{ fontSize: '11px', color: c.textDim, lineHeight: 1.6 }}>
                  "<span style={{ color: c.text }}>{query}</span>" was not found in the threat intelligence database.
                  <br />No ransomware group or incident is associated with this indicator.
                </div>
              </div>
              <div style={{ fontSize: '10px', color: c.faint, letterSpacing: '0.3px' }}>
                Try a partial IP (e.g. <span style={{ color: c.textDim }}>103.149</span>) or hash prefix.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '11px', marginBottom: '16px' }}>
                {[
                  { label: 'Matches',   val: results.length },
                  { label: 'Groups',    val: [...new Set(results.map(r => r.ransomware_group))].length },
                  { label: 'Avg Sev',   val: (results.reduce((s,r)=>s+r.severity,0)/results.length).toFixed(1) },
                  { label: 'Countries', val: [...new Set(results.map(r => r.country))].length },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: '8px', padding: '13px 15px' }}>
                    <div style={{ fontSize: '9px', color: c.faint, letterSpacing: '1px', marginBottom: '5px' }}>{label.toUpperCase()}</div>
                    <div className="u-sans" style={{ fontSize: '21px', fontWeight: 700, color: c.text }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {results.map(r => <ResultCard key={r.id} r={r} query={query} />)}
              </div>
            </>
          )}
        </div>
      )}

      {!searched && (
        <ChartCard title="IOC Reference" subtitle="Sample indicators in the threat intelligence database">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'inherit' }}>
            <thead>
              <tr>
                {['Type','Indicator','Group','Description',''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: c.faint, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500, borderBottom: `1px solid ${c.lineSoft}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samples.map((s, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${c.lineSoft}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = c.accentBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: '4px', fontSize: '10px',
                      background: c.accentBg, border: `1px solid ${c.accentLine}`, color: c.accentHi,
                    }}>{s.type}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: c.text }}>{s.value}</td>
                  <td style={{ padding: '10px 12px', color: c.accentHi }}>{s.group}</td>
                  <td style={{ padding: '10px 12px', color: c.textDim }}>{s.desc}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => setQuery(s.value)} style={{
                      padding: '4px 11px', background: 'transparent',
                      border: `1px solid ${c.line}`, borderRadius: '6px',
                      color: c.textDim, fontSize: '10px', fontFamily: 'inherit', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = c.accentHi; e.currentTarget.style.borderColor = c.accentLine; }}
                      onMouseLeave={e => { e.currentTarget.style.color = c.textDim; e.currentTarget.style.borderColor = c.line; }}
                    >
                      Search
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
      )}

    </div>
  );
}

function ResultCard({ r, query }) {
  const sev = sevColor(r.severity);
  const l = r.severity >= 9 ? 'CRITICAL' : r.severity >= 7 ? 'HIGH' : 'MEDIUM';

  return (
    <div style={{
      background: c.panel, border: `1px solid ${c.line}`,
      borderRadius: '8px', padding: '15px 16px',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.lineHi; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.line; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '11px', flexWrap: 'wrap' }}>
        <span className="u-sans" style={{ color: c.text, fontWeight: 600, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ActorLink name={r.ransomware_group} color={c.text} />
        </span>
        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', background: `${sev}14`, border: `1px solid ${sev}33`, color: sev, letterSpacing: '0.5px' }}>
          {l} {r.severity}/10
        </span>
        <span style={{ fontSize: '10px', color: c.faint, marginLeft: 'auto' }}>#{r.id} · {r.date}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '7px', fontSize: '11px', marginBottom: '11px' }}>
        {[
          { Icon: Globe,         val: r.country },
          { Icon: AlertTriangle, val: r.target_sector },
          { Icon: Shield,        val: r.attack_vector },
        ].map(({ Icon, val }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon size={11} style={{ color: c.textDim, flexShrink: 0 }} />
            <span style={{ color: c.textMut }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ background: c.bgElev, borderRadius: '6px', padding: '8px 11px', fontSize: '10px', color: c.textDim, marginBottom: '9px' }}>
        <span style={{ color: c.faint }}>MITRE: </span>{r.technique}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {r.ioc_ip   && <IOCChip type="IP"   value={r.ioc_ip}   query={query} />}
        {r.ioc_hash && <IOCChip type="HASH" value={r.ioc_hash} query={query} />}
      </div>
    </div>
  );
}

function IOCChip({ type, value, query }) {
  const q   = query.toLowerCase();
  const v   = value.toLowerCase();
  const idx = v.indexOf(q);

  let display;
  if (idx >= 0 && query) {
    display = (
      <>
        {value.slice(0, idx)}
        <span style={{ background: c.accentBg2, color: c.accentHi, borderRadius: '2px', padding: '0 2px' }}>
          {value.slice(idx, idx + query.length)}
        </span>
        {value.slice(idx + query.length)}
      </>
    );
  } else {
    display = value;
  }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 10px', background: c.bgElev,
      border: `1px solid ${c.line}`, borderRadius: '6px',
      fontSize: '10px', fontFamily: 'inherit', maxWidth: '100%',
    }}>
      <span style={{ color: c.accentHi, fontSize: '9px', background: c.accentBg, padding: '1px 5px', borderRadius: '3px', flexShrink: 0 }}>
        {type}
      </span>
      <span style={{ color: c.textMut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {display}
      </span>
    </div>
  );
}
