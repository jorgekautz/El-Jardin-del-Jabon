import type { ReactElement } from 'react';
import { normalizeText } from '../domain/text';

export type PlateMotif =
  | 'bar'
  | 'oat'
  | 'lavender'
  | 'chamomile'
  | 'coffee'
  | 'rice'
  | 'leaf'
  | 'drop'
  | 'seed'
  | 'flower'
  | 'clay'
  | 'honey'
  | 'mold';

const MOTIF_BY_WORD: [string, PlateMotif][] = [
  ['avena', 'oat'],
  ['amapola', 'seed'],
  ['chia', 'seed'],
  ['lavanda', 'lavender'],
  ['rosas', 'flower'],
  ['manzanilla', 'chamomile'],
  ['curcuma', 'chamomile'],
  ['cafe', 'coffee'],
  ['arroz', 'rice'],
  ['coco', 'drop'],
  ['oliva', 'leaf'],
  ['almendras', 'drop'],
  ['karite', 'clay'],
  ['cacao', 'coffee'],
  ['miel', 'honey'],
  ['arcilla', 'clay'],
  ['aloe', 'leaf'],
  ['leche', 'drop'],
  ['carbon', 'clay'],
  ['eucalipto', 'leaf'],
  ['naranja', 'drop'],
  ['limon', 'drop'],
  ['fragancia', 'flower'],
  ['petalos', 'flower'],
  ['colorante', 'drop'],
  ['glicerina', 'bar'],
  ['jabon', 'bar'],
  ['molde', 'mold'],
  ['espatula', 'mold'],
];

/** Motif derivado del nombre: la placa ilustrativa acompaña al contenido. */
export function motifFromName(name: string): PlateMotif {
  const key = normalizeText(name);
  for (const [word, motif] of MOTIF_BY_WORD) {
    if (key.includes(word)) return motif;
  }
  return 'bar';
}

const MARKS: Record<PlateMotif, ReactElement> = {
  bar: (
    <g>
      <rect x="58" y="72" width="84" height="42" rx="10" fill="var(--accent-soft)" stroke="var(--accent-ink)" />
      <path d="M58 84h84" stroke="var(--accent-line)" />
    </g>
  ),
  oat: (
    <g stroke="var(--accent-ink)" fill="var(--accent-soft)">
      <ellipse cx="76" cy="86" rx="7" ry="11" transform="rotate(-18 76 86)" />
      <ellipse cx="100" cy="96" rx="7" ry="11" transform="rotate(14 100 96)" />
      <ellipse cx="124" cy="82" rx="7" ry="11" transform="rotate(-8 124 82)" />
      <path d="M64 112c22 8 52 8 76-4" />
    </g>
  ),
  lavender: (
    <g stroke="var(--accent-ink)" fill="none">
      <path d="M100 122V70" />
      <path d="M100 78c-9-4-14-11-13-20 9 2 14 9 13 20ZM100 78c9-4 14-11 13-20-9 2-14 9-13 20Z" fill="var(--accent-soft)" />
      <path d="M100 96c-8-3-12-9-11-17 8 2 12 8 11 17ZM100 96c8-3 12-9 11-17-8 2-12 8-11 17Z" fill="var(--accent-soft)" />
      <path d="M100 112c-7-3-10-8-9-15 7 2 10 7 9 15ZM100 112c7-3 10-8 9-15-7 2-10 7-9 15Z" fill="var(--accent-soft)" />
    </g>
  ),
  chamomile: (
    <g stroke="var(--accent-ink)" fill="var(--surface)">
      <path d="M100 122V84" fill="none" />
      <circle cx="100" cy="76" r="8" fill="var(--pending-soft)" />
      <g fill="var(--surface)">
        <ellipse cx="100" cy="60" rx="5" ry="8" />
        <ellipse cx="100" cy="92" rx="5" ry="8" />
        <ellipse cx="84" cy="76" rx="8" ry="5" />
        <ellipse cx="116" cy="76" rx="8" ry="5" />
      </g>
      <path d="M84 108c8 6 24 6 32 0" fill="none" />
    </g>
  ),
  coffee: (
    <g stroke="var(--pending)" fill="var(--pending-soft)">
      <ellipse cx="82" cy="88" rx="12" ry="16" transform="rotate(-20 82 88)" />
      <ellipse cx="118" cy="96" rx="12" ry="16" transform="rotate(16 118 96)" />
      <path d="M78 80c4 8 4 12 8 18M114 90c4 8 4 12 8 18" fill="none" />
      <path d="M64 118c24 8 52 6 74-6" fill="none" stroke="var(--accent-ink)" />
    </g>
  ),
  rice: (
    <g stroke="var(--accent-ink)" fill="var(--surface)">
      <ellipse cx="80" cy="88" rx="4" ry="9" transform="rotate(-24 80 88)" />
      <ellipse cx="96" cy="98" rx="4" ry="9" transform="rotate(12 96 98)" />
      <ellipse cx="112" cy="84" rx="4" ry="9" transform="rotate(-14 112 84)" />
      <ellipse cx="124" cy="102" rx="4" ry="9" transform="rotate(22 124 102)" />
      <ellipse cx="92" cy="76" rx="4" ry="9" transform="rotate(6 92 76)" />
      <path d="M66 114c22 10 54 10 76-2" fill="none" />
    </g>
  ),
  leaf: (
    <g stroke="var(--accent-ink)" fill="var(--accent-soft)">
      <path d="M100 124c0-26 12-42 34-50-4 28-14 42-34 50Z" />
      <path d="M100 124c0-26-12-42-34-50 4 28 14 42 34 50Z" />
      <path d="M100 124V64" fill="none" />
    </g>
  ),
  drop: (
    <g stroke="var(--accent-ink)" fill="var(--accent-soft)">
      <path d="M100 56c14 16 22 26 22 38a22 22 0 0 1-44 0c0-12 8-22 22-38Z" />
      <path d="M88 92a12 12 0 0 0 12 12" fill="none" />
    </g>
  ),
  seed: (
    <g fill="var(--accent-ink)" stroke="none">
      <ellipse cx="82" cy="82" rx="4" ry="6" />
      <ellipse cx="104" cy="74" rx="4" ry="6" />
      <ellipse cx="120" cy="92" rx="4" ry="6" />
      <ellipse cx="92" cy="102" rx="4" ry="6" />
      <ellipse cx="112" cy="114" rx="4" ry="6" />
      <ellipse cx="72" cy="106" rx="4" ry="6" />
      <ellipse cx="132" cy="72" rx="4" ry="6" />
    </g>
  ),
  flower: (
    <g stroke="var(--accent-ink)" fill="var(--surface)">
      <circle cx="100" cy="84" r="7" fill="var(--pending-soft)" />
      <ellipse cx="100" cy="66" rx="7" ry="11" />
      <ellipse cx="100" cy="102" rx="7" ry="11" />
      <ellipse cx="82" cy="84" rx="11" ry="7" />
      <ellipse cx="118" cy="84" rx="11" ry="7" />
      <path d="M100 124v-10" fill="none" />
    </g>
  ),
  clay: (
    <g stroke="var(--accent-ink)" fill="var(--pending-soft)">
      <path d="M64 108c8-22 20-32 36-32s28 10 36 32Z" />
      <path d="M64 108h72" fill="none" />
      <path d="M84 66c6-8 12-12 16-12s10 4 16 12" fill="none" />
    </g>
  ),
  honey: (
    <g stroke="var(--pending)" fill="var(--pending-soft)">
      <path d="M100 58l18 10v22l-18 10-18-10V68Z" />
      <path d="M100 58v22M82 68l18 10 18-10" fill="none" />
      <path d="M70 116c14 8 46 8 60 0" fill="none" stroke="var(--accent-ink)" />
    </g>
  ),
  mold: (
    <g stroke="var(--accent-ink)" fill="var(--accent-soft)">
      <rect x="56" y="66" width="88" height="52" rx="8" />
      <path d="M85 66v52M115 66v52M56 92h88" fill="none" stroke="var(--accent-line)" />
    </g>
  ),
};

export interface BotanicalPlateProps {
  /** Nombre de la entidad: de él se deriva el motivo de la placa. */
  seed: string;
  motif?: PlateMotif;
  label?: string;
  className?: string;
}

/**
 * Placa botánica: ilustración vectorial que sustituye a la fotografía
 * cuando el proyecto todavía no tiene imagen para la entidad.
 */
export function BotanicalPlate({ seed, motif, label, className }: BotanicalPlateProps) {
  const resolved = motif ?? motifFromName(seed);
  return (
    <div className={className ? `plate ${className}` : 'plate'}>
      <svg viewBox="0 0 200 160" role="img" aria-label={label ? `Ilustración: ${label}` : 'Ilustración botánica'}>
        <ellipse cx="100" cy="132" rx="62" ry="7" fill="var(--line)" opacity="0.55" />
        {MARKS[resolved]}
      </svg>
    </div>
  );
}
