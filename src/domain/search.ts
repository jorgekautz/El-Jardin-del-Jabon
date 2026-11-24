import { CATEGORY_LABELS, type CategoryId, type Difficulty, type Ingredient, type Recipe } from './types';
import { normalizeText, tokenize } from './text';

export type SortOrder = 'relevancia' | 'nombre' | 'recientes';

export interface RecipeFilters {
  q: string;
  category: CategoryId | 'todas';
  property: string;
  ingredientId: string;
  difficulty: Difficulty | 'todos';
  favoritesOnly: boolean;
  sort: SortOrder;
}

export const EMPTY_FILTERS: RecipeFilters = {
  q: '',
  category: 'todas',
  property: '',
  ingredientId: '',
  difficulty: 'todos',
  favoritesOnly: false,
  sort: 'relevancia',
};

/** Texto indexado de una receta: nombre, descripción, ingredientes, pasos y utensilios. */
export function recipeHaystack(recipe: Recipe): string {
  return normalizeText(
    [
      recipe.name,
      recipe.tagline,
      recipe.mainIngredient,
      CATEGORY_LABELS[recipe.category],
      recipe.properties.join(' '),
      recipe.ingredients.map((line) => line.name).join(' '),
      recipe.utensils.join(' '),
      recipe.steps.map((step) => step.text).join(' '),
      recipe.note,
    ].join(' \u0000 '),
  );
}

/** Coincidencia por palabras: cada término del consulta debe aparecer (tolerante a acentos). */
export function matchesQuery(haystack: string, query: string): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return true;
  return tokens.every((token) => haystack.includes(token));
}

function relevanceScore(haystack: string, query: string, recipe: Recipe, favorites: string[]): number {
  const tokens = tokenize(query);
  const name = normalizeText(recipe.name);
  let score = 0;
  for (const token of tokens) {
    if (name.startsWith(token)) score += 40;
    else if (name.includes(token)) score += 25;
    else if (haystack.includes(token)) score += 10;
  }
  if (recipe.featured) score += 4;
  if (favorites.includes(recipe.id)) score += 3;
  return score;
}

export interface FilterContext {
  favorites: string[];
}

export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeFilters,
  context: FilterContext,
): Recipe[] {
  const query = filters.q.trim();
  const results = recipes.filter((recipe) => {
    if (filters.category !== 'todas' && recipe.category !== filters.category) return false;
    if (filters.property && !recipe.properties.includes(filters.property)) return false;
    if (filters.difficulty !== 'todos' && recipe.difficulty !== filters.difficulty) return false;
    if (filters.favoritesOnly && !context.favorites.includes(recipe.id)) return false;
    if (filters.ingredientId) {
      const linked = recipe.ingredients.some((line) => line.ingredientId === filters.ingredientId);
      if (!linked) return false;
    }
    if (query && !matchesQuery(recipeHaystack(recipe), query)) return false;
    return true;
  });

  const sorted = [...results];
  if (filters.sort === 'nombre') {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  } else if (filters.sort === 'recientes') {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } else if (query) {
    sorted.sort((a, b) => {
      const haystackA = recipeHaystack(a);
      const haystackB = recipeHaystack(b);
      return (
        relevanceScore(haystackB, query, b, context.favorites) -
          relevanceScore(haystackA, query, a, context.favorites) ||
        a.name.localeCompare(b.name, 'es')
      );
    });
  } else {
    // Sin consulta: destacadas primero, luego alfabético para un orden predecible.
    sorted.sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es'),
    );
  }
  return sorted;
}

export function filterIngredients(ingredients: Ingredient[], query: string): Ingredient[] {
  const trimmed = query.trim();
  const results = trimmed
    ? ingredients.filter((ingredient) =>
        matchesQuery(normalizeText(`${ingredient.name} ${ingredient.property} ${ingredient.family ?? ''}`), trimmed),
      )
    : [...ingredients];
  return results.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

/** Tokens que aportan información: descarta palabras vacías y terminaciones cortas. */
function significant(tokens: string[]): string[] {
  return tokens.filter((token) => token.length >= 4);
}

/**
 * Coincidencia de nombre entre la ficha y la línea de la receta.
 *
 * Exige que las palabras significativas de uno de los dos nombres aparezcan todas
 * en el otro: así «Aceite de coco» enlaza con «Aceite de almendras o coco», pero
 * la palabra suelta «de» no arrastra la ficha a todas las recetas.
 */
function namesOverlap(ingredientTokens: string[], lineTokens: string[]): boolean {
  const fromIngredient = significant(ingredientTokens);
  const fromLine = significant(lineTokens);
  if (fromIngredient.length === 0 || fromLine.length === 0) return false;
  const ingredientInside = fromIngredient.every((token) => fromLine.includes(token));
  const lineInside = fromLine.every((token) => fromIngredient.includes(token));
  return ingredientInside || lineInside;
}

/** Recetas que usan un ingrediente, por enlace directo o por coincidencia de nombre. */
export function recipesUsingIngredient(recipes: Recipe[], ingredient: Ingredient): Recipe[] {
  const nameTokens = tokenize(ingredient.name);
  return recipes.filter((recipe) =>
    recipe.ingredients.some((line) => {
      if (line.ingredientId === ingredient.id) return true;
      return namesOverlap(nameTokens, tokenize(line.name));
    }),
  );
}

export interface GlobalHit {
  type: 'receta' | 'ingrediente';
  id: string;
  slug: string;
  title: string;
  subtitle: string;
}

/** Búsqueda global para el buscador de cabecera: recetas e ingredientes, top 8. */
export function globalSearch(
  recipes: Recipe[],
  ingredients: Ingredient[],
  query: string,
  limit = 8,
): GlobalHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const hits: GlobalHit[] = [];
  for (const recipe of recipes) {
    const haystack = recipeHaystack(recipe);
    if (matchesQuery(haystack, trimmed)) {
      hits.push({
        type: 'receta',
        id: recipe.id,
        slug: recipe.slug,
        title: recipe.name,
        subtitle: recipe.tagline.trim() || CATEGORY_LABELS[recipe.category],
      });
    }
  }
  for (const ingredient of ingredients) {
    if (
      matchesQuery(normalizeText(`${ingredient.name} ${ingredient.property} ${ingredient.family ?? ''}`), trimmed)
    ) {
      hits.push({
        type: 'ingrediente',
        id: ingredient.id,
        slug: ingredient.slug,
        title: ingredient.name,
        subtitle: ingredient.property.trim() || 'Propiedad pendiente de completar',
      });
    }
  }
  return hits.slice(0, limit);
}
