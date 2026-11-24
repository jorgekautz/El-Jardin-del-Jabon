import type { ReactElement, SVGProps } from 'react';
/**
 * Iconografía propia del sitio: línea fina, 24 px, sin relleno.
 * Un solo trazo de grosor para que la biblioteca se mantenga coherente.
 */
export type IconName =
  | 'search'
  | 'leaf'
  | 'soap'
  | 'drop'
  | 'flower'
  | 'seed'
  | 'jar'
  | 'mold'
  | 'spatula'
  | 'heat'
  | 'spray'
  | 'star'
  | 'print'
  | 'plus'
  | 'pencil'
  | 'trash'
  | 'check'
  | 'close'
  | 'menu'
  | 'cart'
  | 'clock'
  | 'flask'
  | 'scale'
  | 'warning'
  | 'arrowLeft'
  | 'arrowRight'
  | 'layers'
  | 'sparkle';

const PATHS: Record<IconName, ReactElement> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 20c0-6 3-10 8-12-1 7-3 10-8 12Z" />
      <path d="M12 20C12 13 9 9 4 7c1 7 3 10 8 13Z" />
    </>
  ),
  soap: (
    <>
      <rect x="3.5" y="8.5" width="17" height="9" rx="3" />
      <path d="M7 8.5v9M17 8.5v9" />
    </>
  ),
  drop: <path d="M12 4c3.5 4 5.5 6.5 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 10.5 8.5 8 12 4Z" />,
  flower: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5V5M12 14.5V19M9.5 12H5M14.5 12H19M10 10 7 7M14 14l3 3M14 10l3-3M10 14l-3 3" />
    </>
  ),
  seed: (
    <>
      <ellipse cx="9" cy="9" rx="2.5" ry="3.5" transform="rotate(-25 9 9)" />
      <ellipse cx="15" cy="12" rx="2.5" ry="3.5" transform="rotate(20 15 12)" />
      <ellipse cx="10" cy="16" rx="2.5" ry="3.5" transform="rotate(-10 10 16)" />
    </>
  ),
  jar: (
    <>
      <path d="M8 4h8M9 4v2.5M15 4v2.5" />
      <path d="M7.5 9a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3Z" />
      <path d="M7.5 12h9" />
    </>
  ),
  mold: (
    <>
      <rect x="3.5" y="7" width="17" height="11" rx="2" />
      <path d="M9 7v11M15 7v11M3.5 12.5h17" />
    </>
  ),
  spatula: (
    <>
      <path d="M14 4l6 6-7 7-6-6Z" />
      <path d="m7 17-3 3" />
    </>
  ),
  heat: (
    <>
      <path d="M4 18h16M4 21h16" />
      <path d="M8 14c0-2 2-2.5 2-4.5S8.5 6 9 4M14 14c0-2 2-2.5 2-4.5s-1.5-3.5-1-5" />
    </>
  ),
  spray: (
    <>
      <path d="M9 9h6v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z" />
      <path d="M10 9V5h4v4M12 5V3" />
      <path d="M17 6h.01M19 8h.01M17.5 10.5h.01" />
    </>
  ),
  star: (
    <path d="m12 4.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 10.2l5.4-.8Z" />
  ),
  print: (
    <>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="7" rx="2" />
      <path d="M7 14h10v6H7Z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  pencil: (
    <>
      <path d="M4 20h4L20 8l-4-4L4 16Z" />
      <path d="m15 5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  check: <path d="m5 13 4 4 10-10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  cart: (
    <>
      <path d="M4 5h2l2 11h9l2-8H7" />
      <circle cx="10" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
      <path d="M7 15h10" />
    </>
  ),
  scale: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 9h8M9 14h6" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4 3 20h18Z" />
      <path d="M12 10v5M12 17.5v.01" />
    </>
  ),
  arrowLeft: <path d="M19 12H5m5-6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-5-6 6 6-6 6" />,
  layers: (
    <>
      <path d="m12 4 8 4-8 4-8-4Z" />
      <path d="m4 13 8 4 8-4" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4c1 4.5 2.5 6 7 7-4.5 1-6 2.5-7 7-1-4.5-2.5-6-7-7 4.5-1 6-2.5 7-7Z" />
      <path d="M19 4v3M17.5 5.5h3" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Tamaño en píxeles. Por defecto 20. */
  size?: number;
  /** Relleno sólido (estrellas de favorito). */
  filled?: boolean;
}

export function Icon({ name, size = 20, filled = false, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
