import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  PROPERTY_OPTIONS,
  SAFETY_NOTES,
  SEED_INGREDIENTS,
  SEED_RECIPES,
  SEED_SHOPPING,
  SEED_TOOLS,
} from './seed';
import { CATEGORY_LABELS, INGREDIENT_CATEGORY_LABELS, type IngredientCategory } from '../domain/types';

const EXPECTED_RECIPES = [
  'r-jabon-basico',
  'r-jabon-exfoliante',
  'r-jabon-hidratante',
  'r-jabon-manzanilla-curcuma',
  'r-jabon-cafe',
  'r-jabon-arroz',
];

describe('recetas del archivo', () => {
  it('contienen las seis recetas de recetas.txt', () => {
    expect(SEED_RECIPES.map((recipe) => recipe.id)).toEqual(EXPECTED_RECIPES);
  });

  it('tienen identificadores y slugs únicos', () => {
    const ids = SEED_RECIPES.map((recipe) => recipe.id);
    const slugs = SEED_RECIPES.map((recipe) => recipe.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9-]+$/.test(slug))).toBe(true);
  });

  it('usan categorías definidas', () => {
    const defined = new Set(CATEGORIES.map((category) => category.id));
    expect(SEED_RECIPES.every((recipe) => defined.has(recipe.category))).toBe(true);
  });

  it('unen cada línea con la biblioteca de ingredientes', () => {
    const known = new Set(SEED_INGREDIENTS.map((item) => item.id));
    const broken = SEED_RECIPES.flatMap((recipe) =>
      recipe.ingredients
        .filter((line) => line.ingredientId && !known.has(line.ingredientId))
        .map((line) => `${recipe.slug} → ${line.ingredientId}`),
    );
    expect(broken).toEqual([]);
  });

  it('no inventan cantidades: una línea sin cantidad es pendiente o está aclarada', () => {
    const offenders = SEED_RECIPES.flatMap((recipe) =>
      recipe.ingredients
        .filter((line) => !line.amount && line.source !== 'pendiente' && !line.amountNote)
        .map((line) => `${recipe.slug} → ${line.name}`),
    );
    expect(offenders).toEqual([]);
  });

  it('marcan como pendiente todo campo sin dato', () => {
    const offenders: string[] = [];
    for (const recipe of SEED_RECIPES) {
      if (recipe.tagline.trim() === '' && recipe.taglineSource !== 'pendiente') offenders.push(`${recipe.slug}: tagline`);
      if (recipe.properties.length === 0 && recipe.propertiesSource !== 'pendiente')
        offenders.push(`${recipe.slug}: propiedades`);
      if (recipe.utensils.length === 0 && recipe.utensilsSource !== 'pendiente')
        offenders.push(`${recipe.slug}: utensilios`);
      if (!recipe.timeLabel && recipe.timeSource !== 'pendiente') offenders.push(`${recipe.slug}: tiempo`);
      if (!recipe.difficulty && recipe.difficultySource !== 'pendiente')
        offenders.push(`${recipe.slug}: nivel`);
    }
    expect(offenders).toEqual([]);
  });

  it('solo usan propiedades del vocabulario de filtros', () => {
    const vocabulary = new Set(PROPERTY_OPTIONS);
    const unknown = SEED_RECIPES.flatMap((recipe) =>
      recipe.properties.filter((property) => !vocabulary.has(property)),
    );
    expect(unknown).toEqual([]);
  });

  it('cubren todas las propiedades del archivo', () => {
    const used = new Set(SEED_RECIPES.flatMap((recipe) => recipe.properties));
    // El vocabulario existe para filtrar: cada propiedad debe devolver al menos una receta.
    for (const property of PROPERTY_OPTIONS) {
      expect(used.has(property), `ninguna receta usa «${property}»`).toBe(true);
    }
  });
});

describe('biblioteca de ingredientes', () => {
  it('incluye las materias primas que nombran las recetas', () => {
    const names = new Set(SEED_INGREDIENTS.map((item) => item.name.toLowerCase()));
    const required = [
      'base de glicerina',
      'base de glicerina blanca (opaca)',
      'base con leche de cabra',
      'base con carbón activado',
      'aceite de coco',
      'aceite de oliva',
      'aceite de almendras',
      'manteca de karité',
      'manteca de cacao',
      'aceite esencial de lavanda',
      'fragancias cosméticas',
      'avena',
      'semillas de amapola',
      'semillas de chía',
      'pétalos secos',
      'arcillas',
      'miel',
      'manzanilla deshidratada',
      'cúrcuma en polvo',
      'café molido',
      'arroz en polvo',
      'colorantes',
    ];
    const missing = required.filter((name) => !names.has(name));
    expect(missing).toEqual([]);
  });

  it('mantiene identificadores, slugs y categorías coherentes', () => {
    const ids = SEED_INGREDIENTS.map((item) => item.id);
    const slugs = SEED_INGREDIENTS.map((item) => item.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);

    const categories = new Set(Object.keys(INGREDIENT_CATEGORY_LABELS) as IngredientCategory[]);
    expect(SEED_INGREDIENTS.every((item) => categories.has(item.category))).toBe(true);
  });

  it('distingue propiedad documentada de propiedad pendiente', () => {
    const offenders = SEED_INGREDIENTS.filter(
      (item) => item.property.trim() === '' && item.propertySource !== 'pendiente',
    ).map((item) => item.name);
    expect(offenders).toEqual([]);
  });
});

describe('utensilios, compra y seguridad', () => {
  it('lista los cinco utensilios del archivo', () => {
    expect(SEED_TOOLS.map((tool) => tool.name)).toEqual([
      'Molde de silicona',
      'Recipiente para derretir',
      'Espátula',
      'Microondas o baño María',
      'Alcohol en spray',
    ]);
  });

  it('lista la compra mínima con cantidades', () => {
    expect(SEED_SHOPPING.length).toBeGreaterThanOrEqual(5);
    expect(SEED_SHOPPING.every((item) => item.label.trim() !== '' && item.quantity.trim() !== '')).toBe(
      true,
    );
  });

  it('recordó las advertencias de uso cosmético', () => {
    expect(SAFETY_NOTES.length).toBeGreaterThanOrEqual(4);
    expect(SAFETY_NOTES.join(' ').toLowerCase()).toContain('cosmét');
  });
});

describe('categorías del catálogo', () => {
  it('tienen etiqueta y descripción', () => {
    expect(CATEGORIES.map((category) => category.id)).toEqual(Object.keys(CATEGORY_LABELS));
    expect(CATEGORIES.every((category) => category.blurb.trim() !== '')).toBe(true);
  });
});
