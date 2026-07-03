export const c = {
  bg:        '#060910',
  bgElev:    '#080d16',
  panel:     '#0b1119',
  panelAlt:  '#0e1622',

  line:      '#151d2b',
  lineSoft:  '#101724',
  lineHi:    '#23324a',

  text:      '#e8eef7',
  textMut:   '#95a4bb',
  textDim:   '#5c6f8a',
  faint:     '#3a4c63',

  accent:    '#3ba4c4',
  accentHi:  '#63c2df',
  accentDim: '#2b7089',
  accentBg:  'rgba(59,164,196,0.09)',
  accentBg2: 'rgba(59,164,196,0.16)',
  accentLine:'rgba(59,164,196,0.22)',

  crit:      '#d4574e',
  high:      '#c8963f',
  med:       '#4f9e86',
};

export const sevColor = (s) => (s >= 9 ? c.crit : s >= 7 ? c.high : c.med);
export const sevLabel = (s) => (s >= 9 ? 'CRIT' : s >= 7 ? 'HIGH' : 'MED');

const RAMP_HI  = [0x74, 0xcb, 0xe6];
const RAMP_LO  = [0x1e, 0x4d, 0x60];
const hex = (n) => n.toString(16).padStart(2, '0');
export function ramp(n) {
  if (n <= 1) return [c.accent];
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const r = Math.round(RAMP_HI[0] + (RAMP_LO[0] - RAMP_HI[0]) * t);
    const g = Math.round(RAMP_HI[1] + (RAMP_LO[1] - RAMP_HI[1]) * t);
    const b = Math.round(RAMP_HI[2] + (RAMP_LO[2] - RAMP_HI[2]) * t);
    out.push(`#${hex(r)}${hex(g)}${hex(b)}`);
  }
  return out;
}

export const series = ['#3ba4c4', '#c8963f', '#6f8cc6', '#4f9e86', '#b0728c'];
