import { describe, expect, it } from 'vitest';
import { SEED_INGREDIENTS, SEED_RECIPES } from '../data/seed';
import {
  EMPTY_FILTERS,
  filterIngredients,
  filterRecipes,
  globalSearch,
  matchesQuery,
  recipeHaystack,
  recipesUsingIngredient,
  type RecipeFilters,
} from './search';
import type { Ingredient, Recipe } from './types';

const NO_FAVORITES = { favorites: [] };

function names(recipes: Recipe[]): string[] {
  return recipes.map((recipe) => recipe.name);
}

function filters(overrides: Partial<RecipeFilters> = {}): RecipeFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

describe('matchesQuery', () => {
  it('es tolerante a acentos y mayúsculas', () => {
    expect(matchesQuery(recipeHaystack(SEED_RECIPES[0] as Recipe), 'JABON BASICO')).toBe(true);
    expect(matchesQuery(recipeHaystack(SEED_RECIPES[0] as Recipe), 'jabón básico')).toBe(true);
  });

  it('exige todas las palabras', () => {
    const haystack = recipeHaystack(SEED_RECIPES[0] as Recipe);
    expect(matchesQuery(haystack, 'glicerina avena')).toBe(false);
    expect(matchesQuery(haystack, 'glicerina molde')).toBe(true);
  });

  it('una consulta vacía acepta todo', () => {
    expect(matchesQuery('cualquier cosa', '   ')).toBe(true);
  });
});

describe('recipeHaystack', () => {
  it('indexa ingredientes, utensilios y pasos', () => {
    const recipe = SEED_RECIPES[0] as Recipe;
    const haystack = recipeHaystack(recipe);
    expect(haystack).toContain('base de glicerina');
    expect(haystack).toContain('alcohol en spray');
    expect(haystack).toContain('derretir');
  });
});

describe('filterRecipes', () => {
  it('sin filtros devuelve el catálogo completo', () => {
    expect(filterRecipes(SEED_RECIPES, filters(), NO_FAVORITES)).toHaveLength(SEED_RECIPES.length);
  });

  it('filtra por categoría', () => {
    const results = filterRecipes(SEED_RECIPES, filters({ category: 'exfoliantes' }), NO_FAVORITES);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((recipe) => recipe.category === 'exfoliantes')).toBe(true);
  });

  it('filtra por propiedad y por nivel', () => {
    const exfoliante = filterRecipes(SEED_RECIPES, filters({ property: 'exfoliante' }), NO_FAVORITES);
    expect(exfoliante.every((recipe) => recipe.properties.includes('exfoliante'))).toBe(true);

    const principiante = filterRecipes(
      SEED_RECIPES,
      filters({ difficulty: 'principiante' }),
      NO_FAVORITES,
    );
    expect(principiante.length).toBeGreaterThan(0);
    expect(principiante.every((recipe) => recipe.difficulty === 'principiante')).toBe(true);
  });

  it('filtra por ingrediente enlazado', () => {
    const glicerina = SEED_INGREDIENTS.find((item) => item.id === 'base-glicerina') as Ingredient;
    const results = filterRecipes(
      SEED_RECIPES,
      filters({ ingredientId: glicerina.id }),
      NO_FAVORITES,
    );
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((recipe) => recipe.ingredients.some((line) => line.ingredientId === glicerina.id)),
    ).toBe(true);
  });

  it('filtra solo por favoritas usando el contexto', () => {
    const id = (SEED_RECIPES[1] as Recipe).id;
    const results = filterRecipes(SEED_RECIPES, filters({ favoritesOnly: true }), {
      favorites: [id],
    });
    expect(names(results)).toEqual([(SEED_RECIPES[1] as Recipe).name]);
  });

  it('combina consulta y categoría', () => {
    const results = filterRecipes(
      SEED_RECIPES,
      filters({ q: 'avena', category: 'exfoliantes' }),
      NO_FAVORITES,
    );
    expect(results.length).toBe(1);
    expect(results[0]?.name).toBe('Jabón exfoliante');
  });

  it('ordena por nombre y por modificación reciente', () => {
    const byName = filterRecipes(SEED_RECIPES, filters({ sort: 'nombre' }), NO_FAVORITES);
    const sorted = [...byName].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    expect(names(byName)).toEqual(names(sorted));

    const recientes = filterRecipes(SEED_RECIPES, filters({ sort: 'recientes' }), NO_FAVORITES);
    const dates = recientes.map((recipe) => recipe.updatedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('pone las destacadas primero cuando no hay consulta', () => {
    const results = filterRecipes(SEED_RECIPES, filters(), NO_FAVORITES);
    const flags = results.map((recipe) => recipe.featured);
    expect(flags).toEqual([...flags].sort((a, b) => Number(b) - Number(a)));
  });

  it('prioriza el nombre en la relevancia de una consulta', () => {
    const results = filterRecipes(SEED_RECIPES, filters({ q: 'jabón' }), NO_FAVORITES);
    expect(results.length).toBe(SEED_RECIPES.length);
  });
});

describe('filterIngredients', () => {
  it('devuelve todo ordenado por nombre si la consulta está vacía', () => {
    const results = filterIngredients(SEED_INGREDIENTS, '');
    expect(results).toHaveLength(SEED_INGREDIENTS.length);
    const sorted = [...results].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    expect(results.map((item) => item.id)).toEqual(sorted.map((item) => item.id));
  });

  it('busca también en la propiedad documentada', () => {
    const results = filterIngredients(SEED_INGREDIENTS, 'exfolia');
    expect(results.length).toBeGreaterThan(1);
    expect(results.map((item) => item.name)).toContain('Avena');
    expect(
      results.every((item) =>
        `${item.name} ${item.property} ${item.family ?? ''}`.toLowerCase().includes('exfolia'),
      ),
    ).toBe(true);
  });

  it('no devuelve nada si nada coincide', () => {
    expect(filterIngredients(SEED_INGREDIENTS, 'termómetro láser')).toEqual([]);
  });
});

describe('recipesUsingIngredient', () => {
  it('usa el enlace directo cuando existe', () => {
    const glicerina = SEED_INGREDIENTS.find((item) => item.id === 'base-glicerina') as Ingredient;
    const used = recipesUsingIngredient(SEED_RECIPES, glicerina);
    expect(used.length).toBeGreaterThan(1);
  });

  it('enlaza por nombre sin arrastrar la ficha a todas las recetas', () => {
    const coco = SEED_INGREDIENTS.find((item) => item.id === 'aceite-de-coco') as Ingredient;
    const used = recipesUsingIngredient(SEED_RECIPES, coco);
    // Solo la receta hidratante menciona el aceite de coco; «de» no cuenta como coincidencia.
    expect(names(used)).toEqual(['Jabón hidratante']);
  });

  it('reconoce variantes largas del mismo nombre', () => {
    const blanca = SEED_INGREDIENTS.find(
      (item) => item.id === 'base-glicerina-blanca',
    ) as Ingredient;
    const used = recipesUsingIngredient(SEED_RECIPES, blanca);
    expect(names(used)).toContain('Jabón hidratante');
  });

  it('no inventa usos para un ingrediente sin relación', () => {
    const ajeno: Ingredient = {
      id: 'ing-ajeno',
      slug: 'ingrediente-ajeno',
      name: 'Arcilla verde ultrasónica',
      category: 'complementarios',
      property: '',
      propertySource: 'pendiente',
      origin: 'usuario',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(recipesUsingIngredient(SEED_RECIPES, ajeno)).toEqual([]);
  });
});

describe('globalSearch', () => {
  it('mezcla recetas e ingredientes', () => {
    const hits = globalSearch(SEED_RECIPES, SEED_INGREDIENTS, 'lavanda');
    expect(hits.some((hit) => hit.type === 'ingrediente')).toBe(true);
  });

  it('devuelve vacío sin consulta', () => {
    expect(globalSearch(SEED_RECIPES, SEED_INGREDIENTS, '   ')).toEqual([]);
  });

  it('limita el número de sugerencias', () => {
    const hits = globalSearch(SEED_RECIPES, SEED_INGREDIENTS, 'jabón', 3);
    expect(hits.length).toBeLessThanOrEqual(3);
  });
});
