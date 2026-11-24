/**
 * Resolución de fotografías.
 *
 * Las imágenes del sitio se depositan en `src/assets/images/`:
 *   - `recipes/<clave>.jpg`  → fotografía de una receta (la clave es el slug de la receta).
 *   - `sections/<nombre>.jpg` → imágenes de portada, utensilios e ingredientes.
 *
 * Vite empaqueta esas imágenes con hash y `resolveRecipePhoto` devuelve la URL
 * solo si el archivo existe. Si no existe, la interfaz muestra la placa botánica
 * y el aviso de fotografía pendiente: nunca se sustituye por una imagen ajena.
 */

const recipePhotos = import.meta.glob('./images/recipes/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const sectionPhotos = import.meta.glob('./images/sections/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function keyOf(path: string): string {
  const file = path.split('/').pop() ?? '';
  return file.replace(/\.[^.]+$/, '').toLowerCase();
}

const RECIPE_INDEX = new Map(Object.entries(recipePhotos).map(([p, url]) => [keyOf(p), url]));
const SECTION_INDEX = new Map(Object.entries(sectionPhotos).map(([p, url]) => [keyOf(p), url]));

function canonicalKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** URL de la fotografía de una receta, o `null` si el archivo no está en el proyecto. */
export function resolveRecipePhoto(key: string): string | null {
  if (!key) return null;
  return RECIPE_INDEX.get(canonicalKey(key)) ?? null;
}

/** URL de una imagen de sección (`hero`, `botanicals`, `tools`), o `null`. */
export function resolveSectionPhoto(name: string): string | null {
  return SECTION_INDEX.get(canonicalKey(name)) ?? null;
}

/** Inventario visible en administración: qué recetas tienen foto y cuáles no. */
export const photoInventory = {
  recipeKeys: [...RECIPE_INDEX.keys()],
  sectionKeys: [...SECTION_INDEX.keys()],
};
