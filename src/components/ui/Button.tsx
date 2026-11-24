import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../Icon';

type Variant = 'primary' | 'outline' | 'quiet' | 'danger';

interface CommonProps {
  variant?: Variant;
  size?: 'md' | 'sm';
  block?: boolean;
  icon?: IconName;
  iconFilled?: boolean;
  iconRight?: IconName;
  busy?: boolean;
  /** Opcional: un botón de solo icono se nombra con `aria-label`. */
  children?: ReactNode;
  className?: string;
}

export type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };

type Props =
  | ButtonProps
  | (CommonProps & { to: string; href?: undefined } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | (CommonProps & { href: string; to?: undefined } & AnchorHTMLAttributes<HTMLAnchorElement>);

const CLASS: Record<Variant, string> = {
  primary: 'btn',
  outline: 'btn btn--outline',
  quiet: 'btn btn--quiet',
  danger: 'btn btn--danger',
};

export function Button(props: Props) {
  const {
    variant = 'primary',
    size = 'md',
    block,
    icon,
    iconFilled,
    iconRight,
    busy,
    children,
    className = '',
    ...rest
  } = props as CommonProps & Record<string, unknown>;

  const classes = [
    CLASS[variant],
    size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} filled={iconFilled} /> : null}
      <span>{children}</span>
      {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} /> : null}
    </>
  );

  const to = props.to;
  if (typeof to === 'string') {
    return (
      <Link
        to={to}
        className={classes}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  const href = props.href;
  if (typeof href === 'string') {
    return (
      <a href={href} className={classes} {...(rest as Record<string, unknown>)}>
        {content}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type="button"
      {...buttonProps}
      className={classes}
      aria-busy={busy ? true : undefined}
    >
      {content}
    </button>
  );
}
