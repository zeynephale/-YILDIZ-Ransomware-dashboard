import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend,
} from 'recharts';
import ChartCard from './ChartCard';
import { getMonthlyTrend, getGroupDistribution, ransomwareData } from '../data/ransomwareData';
import { c, ramp, series } from '../theme';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.panelAlt, border: `1px solid ${c.lineHi}`, borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ color: c.accentHi, marginBottom: '4px', fontWeight: 500 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || c.textMut, marginBottom: '2px' }}>
          <span style={{ opacity: 0.7 }}>{p.name}: </span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const fmt = m => {
  const [y, mo] = m.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+mo-1] + " '" + y.slice(2);
};

const quarterly = (data) => {
  const q = {};
  data.forEach(m => {
    const [y, mo] = m.month.split('-');
    const key = `Q${Math.ceil(+mo/3)} ${y}`;
    if (!q[key]) q[key] = { quarter: key, attacks: 0 };
    q[key].attacks += m.attacks;
  });
  return Object.values(q);
};

export default function TimelineTab() {
  const monthly = getMonthlyTrend();
  const fmted   = monthly.map(m => ({ ...m, label: fmt(m.month) }));
  const quart   = quarterly(monthly);
  const quartRamp = ramp(quart.length);

  const topGroups = getGroupDistribution().slice(0, 5).map(g => g.name);

  const groupLine = monthly.map(m => {
    const att = ransomwareData.filter(d => d.date.startsWith(m.month));
    const obj = { month: fmt(m.month) };
    topGroups.forEach(g => { obj[g] = att.filter(d => d.ransomware_group === g).length; });
    return obj;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <ChartCard title="Monthly Attack Volume" subtitle="Total ransomware incidents per month">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={fmted} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={c.accent} stopOpacity={0.28} />
                <stop offset="95%" stopColor={c.accent} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={c.lineSoft} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} interval={0} axisLine={{ stroke: c.line }} tickLine={false} />
            <YAxis tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="attacks" name="Attacks" stroke={c.accent} fill="url(#areaGrad)" strokeWidth={1.75} dot={false} activeDot={{ r: 4, fill: c.accentHi, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
        <ChartCard title="Average Severity Trend" subtitle="Mean severity score over time">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fmted} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.lineSoft} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 10, fontFamily: 'inherit' }} interval={0} axisLine={{ stroke: c.line }} tickLine={false} />
              <YAxis domain={[4, 10]} tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="avgSeverity" name="Avg Severity" stroke={c.high} strokeWidth={1.75} dot={false} activeDot={{ r: 4, fill: c.high, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quarterly Totals" subtitle="Attack volume grouped by quarter">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={quart} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.lineSoft} vertical={false} />
              <XAxis dataKey="quarter" tick={{ fill: c.textDim, fontSize: 9, fontFamily: 'inherit' }} axisLine={{ stroke: c.line }} tickLine={false} />
              <YAxis tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: c.accentBg }} />
              <Bar dataKey="attacks" name="Attacks" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {quart.map((_, i) => <Cell key={i} fill={quartRamp[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top Group Activity Timeline" subtitle={`Monthly attacks — ${topGroups.join(', ')}`}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={groupLine} margin={{ top: 8, right: 20, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.lineSoft} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: c.textDim, fontSize: 9, fontFamily: 'inherit' }} interval={0} axisLine={{ stroke: c.line }} tickLine={false} />
            <YAxis tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: c.textDim, fontFamily: 'inherit', paddingTop: '8px' }} />
            {topGroups.map((g, i) => (
              <Line key={g} type="monotone" dataKey={g} stroke={series[i % series.length]} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}
