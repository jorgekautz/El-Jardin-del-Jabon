/**
 * Persistencia en LocalStorage.
 *
 * Todo acceso pasa por aquí: el resto de la aplicación nunca toca `localStorage`
 * directamente, así el modo privado, la cuota llena o un JSON corrupto no rompen la app.
 */

import type { Ingredient, Recipe, ShoppingItem } from '../domain/types';

const STORAGE_KEY = 'el-jardin-del-jabon:v1';
const SCHEMA_VERSION = 1;

export interface PersistedState {
  version: number;
  recipes: Recipe[];
  ingredients: Ingredient[];
  shopping: ShoppingItem[];
  favorites: string[];
}

export type StorageStatus = 'ok' | 'no-disponible' | 'cuota' | 'corrupto';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asStringArray(value: unknown): string[] {
  return asArray<unknown>(value).filter((item): item is string => typeof item === 'string');
}

/** Descarta datos que no cumplan la forma mínima: evita reventar por un estado corrupto. */
function sanitize(raw: unknown): PersistedState | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== SCHEMA_VERSION) return null;

  const recipes = asArray<Recipe>(raw.recipes).filter(
    (r) => isRecord(r) && typeof r.id === 'string' && typeof r.name === 'string',
  );
  const ingredients = asArray<Ingredient>(raw.ingredients).filter(
    (i) => isRecord(i) && typeof i.id === 'string' && typeof i.name === 'string',
  );
  const shopping = asArray<ShoppingItem>(raw.shopping).filter(
    (s) => isRecord(s) && typeof s.id === 'string' && typeof s.label === 'string',
  );
  const favorites = asStringArray(raw.favorites);

  return { version: SCHEMA_VERSION, recipes, ingredients, shopping, favorites };
}

export function loadState(): { state: PersistedState | null; status: StorageStatus } {
  let stored: Storage | undefined;
  try {
    stored = window.localStorage;
  } catch {
    return { state: null, status: 'no-disponible' };
  }
  if (!stored) return { state: null, status: 'no-disponible' };

  try {
    const text = stored.getItem(STORAGE_KEY);
    if (!text) return { state: null, status: 'ok' };
    const parsed = sanitize(JSON.parse(text));
    if (!parsed) return { state: null, status: 'corrupto' };
    return { state: parsed, status: 'ok' };
  } catch {
    return { state: null, status: 'corrupto' };
  }
}

export function saveState(state: Omit<PersistedState, 'version'>): StorageStatus {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, ...state }));
    return 'ok';
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return quota ? 'cuota' : 'no-disponible';
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Sin persistencia disponible: la app sigue funcionando en memoria. */
  }
}

export const STORAGE_LABELS: Record<StorageStatus, string> = {
  ok: 'Los cambios se guardan en este navegador.',
  'no-disponible':
    'Este navegador no permite guardar datos (modo privado). La sesión funciona sin persistencia.',
  cuota: 'El almacenamiento del navegador está lleno: los cambios no se están guardando.',
  corrupto: 'Los datos guardados no eran válidos y se han descartado. Se usó el contenido original.',
};
