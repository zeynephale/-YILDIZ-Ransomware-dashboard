import { useDetail } from '../context/detail';
import { normalizeThreatActorName } from '../utils/threatActorUtils';
import ThreatActorBadge from './ThreatActorBadge';
import { c } from '../theme';

export default function ActorLink({
  name,
  style,
  color = c.accentHi,
  badge = true,
  badgeSize = 'sm',
  badgeVariant = 'default',
}) {
  const { openActor } = useDetail();
  const display = normalizeThreatActorName(name);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); openActor(name); }}
      title={`View ${display} threat actor profile`}
      style={{
        background: 'none', border: 'none', padding: 0, margin: 0,
        font: 'inherit', color, cursor: 'pointer',
        borderBottom: `1px dashed ${c.accentLine}`,
        transition: 'color 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = c.accent; }}
      onMouseLeave={e => { e.currentTarget.style.color = color; }}
    >
      {badge && (
        <ThreatActorBadge name={name} size={badgeSize} variant={badgeVariant} />
      )}
      {display}
    </button>
  );
}
