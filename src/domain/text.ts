/** Utilidades de texto: normalización para búsqueda y generación de slugs. */

const ACCENT_MAP: Record<string, string> = {
  á: 'a',
  à: 'a',
  ä: 'a',
  â: 'a',
  ã: 'a',
  é: 'e',
  è: 'e',
  ë: 'e',
  ê: 'e',
  í: 'i',
  ì: 'i',
  ï: 'i',
  î: 'i',
  ó: 'o',
  ò: 'o',
  ö: 'o',
  ô: 'o',
  õ: 'o',
  ú: 'u',
  ù: 'u',
  ü: 'u',
  û: 'u',
  ñ: 'n',
  ç: 'c',
  ÿ: 'y',
};

/** Minúsculas, sin tildes y con espacios colapsados. Base de toda comparación de búsqueda. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => ACCENT_MAP[char] ?? char)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Palabras de búsqueda normalizadas, filtrando vacías. */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Une partes con separador solo si ambas existen. */
export function joinNonEmpty(parts: (string | null | undefined)[], separator = ' · '): string {
  return parts.filter((p): p is string => Boolean(p && p.trim() !== '')).join(separator);
}
