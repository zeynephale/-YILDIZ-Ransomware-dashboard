import { getThreatActorInitials, normalizeThreatActorName } from '../utils/threatActorUtils';
import { c } from '../theme';

const SIZES = {
  sm: { box: 22, font: 9, radius: 5 },
  md: { box: 28, font: 10, radius: 6 },
  lg: { box: 38, font: 13, radius: 8 },
};

const VARIANTS = {
  default: {
    bg: c.panelAlt,
    border: c.accentLine,
    text: c.accentHi,
    glow: '0 0 10px rgba(59,164,196,0.12)',
  },
  critical: {
    bg: `${c.crit}12`,
    border: `${c.crit}44`,
    text: c.crit,
    glow: '0 0 10px rgba(212,87,78,0.15)',
  },
  muted: {
    bg: c.bgElev,
    border: c.line,
    text: c.textDim,
    glow: 'none',
  },
};

export default function ThreatActorBadge({
  name,
  size = 'md',
  variant = 'default',
  title,
  style = {},
}) {
  const initials = getThreatActorInitials(name);
  const display = normalizeThreatActorName(name);
  const dim = SIZES[size] || SIZES.md;
  const tone = VARIANTS[variant] || VARIANTS.default;

  return (
    <span
      title={title || display}
      aria-label={`${display} badge`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: dim.box,
        height: dim.box,
        borderRadius: dim.radius,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        boxShadow: tone.glow,
        color: tone.text,
        fontSize: dim.font,
        fontWeight: 700,
        letterSpacing: '0.4px',
        lineHeight: 1,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        userSelect: 'none',
        ...style,
      }}
    >
      {initials}
    </span>
  );
}
