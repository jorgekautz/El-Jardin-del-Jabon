import type { Ingredient, Recipe, RecipeIngredientLine, RecipeStep, ShoppingItem } from '../domain/types';
import { slugify } from '../domain/text';

/** Identificador estable y legible para entidades creadas en el navegador. */
export function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function emptyStep(text = ''): RecipeStep {
  return { id: createId('paso'), text };
}

export function emptyIngredientLine(name = ''): RecipeIngredientLine {
  return { id: createId('ing'), name, amount: '', source: 'pendiente' };
}

/** Receta en blanco para el formulario de administración. */
export function createRecipeDraft(): Recipe {
  const stamp = nowIso();
  return {
    id: createId('r'),
    slug: '',
    name: '',
    tagline: '',
    taglineSource: 'pendiente',
    category: 'otros',
    categorySource: 'editorial',
    mainIngredient: '',
    properties: [],
    propertiesSource: 'pendiente',
    difficulty: null,
    difficultySource: 'pendiente',
    timeLabel: null,
    timeSource: 'pendiente',
    image: '',
    ingredients: [emptyIngredientLine()],
    utensils: [],
    utensilsSource: 'pendiente',
    steps: [emptyStep()],
    tips: [],
    warnings: [],
    note: '',
    featured: false,
    origin: 'usuario',
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function createIngredientDraft(): Ingredient {
  const stamp = nowIso();
  return {
    id: createId('ing'),
    slug: '',
    name: '',
    category: 'complementarios',
    property: '',
    propertySource: 'pendiente',
    origin: 'usuario',
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function createShoppingDraft(): ShoppingItem {
  return {
    id: createId('s'),
    label: '',
    detail: '',
    quantity: '',
    checked: false,
    origin: 'usuario',
  };
}

/**
 * Slug único dentro de la colección.
 * `ownSlug` permite que la entidad que se está editando conserve su slug actual.
 */
export function uniqueSlug(
  base: string,
  slugs: string[],
  ownSlug?: string,
): string {
  const root = slugify(base) || 'sin-nombre';
  const taken = new Set(slugs.filter((slug) => slug !== ownSlug));
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
