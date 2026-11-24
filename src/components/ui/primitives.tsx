import type { ReactNode } from 'react';
import { SOURCE_LABELS, type SourceKind } from '../../domain/types';
import { Icon, type IconName } from '../Icon';

/* --- Insignia genérica --------------------------------------------------- */

export function Badge({
  children,
  tone = 'neutral',
  icon,
  title,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'pending' | 'solid';
  icon?: IconName;
  title?: string;
}) {
  const classes = ['badge'];
  if (tone === 'accent') classes.push('badge--accent');
  if (tone === 'pending') classes.push('badge--pending');
  if (tone === 'solid') classes.push('badge--solid');
  return (
    <span className={classes.join(' ')} title={title}>
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}

/* --- Chip de procedencia -------------------------------------------------- */

const TONE_BY_SOURCE: Record<SourceKind, 'accent' | 'pending' | 'neutral'> = {
  documentado: 'accent',
  pendiente: 'pending',
  editorial: 'neutral',
};

/** Indica si un dato viene del archivo, es clasificación del sitio o falta por completar. */
export function SourceBadge({ source, suffix }: { source: SourceKind; suffix?: string }) {
  return (
    <Badge tone={TONE_BY_SOURCE[source]} title={SOURCE_LABELS[source]}>
      {suffix ?? SOURCE_LABELS[source]}
    </Badge>
  );
}

/* --- Medidor de completitud ----------------------------------------------- */

export function Meter({ ratio, caption }: { ratio: number; caption: string }) {
  const percent = Math.round(ratio * 100);
  return (
    <div className="meter">
      <span className="meter__track" aria-hidden="true">
        <span
          className={`meter__fill${percent < 100 ? ' meter__fill--partial' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="meta">{caption}</span>
    </div>
  );
}

/* --- Encabezado de sección ------------------------------------------------ */

export function SectionHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="section-head row row--between">
      <div className="stack-xs">
        {eyebrow ? <span className="label">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p className="card__text">{description}</p> : null}
      </div>
      {action ? <div className="row">{action}</div> : null}
    </header>
  );
}

/* --- Aviso ---------------------------------------------------------------- */

export function Notice({
  tone = 'neutral',
  title,
  children,
  icon,
}: {
  tone?: 'neutral' | 'accent' | 'pending' | 'deep';
  title?: string;
  children: ReactNode;
  icon?: IconName;
}) {
  const classes = ['notice'];
  if (tone !== 'neutral') classes.push(`notice--${tone}`);
  return (
    <div className={classes.join(' ')}>
      {title ? (
        <p className="notice__title row" style={{ gap: 'var(--space-2xs)' }}>
          {icon ? <Icon name={icon} size={15} /> : null}
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* --- Estado vacío ---------------------------------------------------------- */

export function EmptyState({
  title,
  description,
  action,
  icon = 'leaf',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty">
      <Icon name={icon} size={30} />
      <h3>{title}</h3>
      {description ? <p className="card__text">{description}</p> : null}
      {action}
    </div>
  );
}
