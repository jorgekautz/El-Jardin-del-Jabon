import { describe, expect, it } from 'vitest';
import { SEED_RECIPES } from '../data/seed';
import { completenessRatio, hasPendingInfo, missingAmountLines, pendingFields } from './completeness';
import type { Recipe } from './types';

/** Receta con todos los campos cubiertos: sirve para aislar cada hueco. */
function completeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  const stamp = '2026-01-01T00:00:00.000Z';
  return {
    id: 'r-test',
    slug: 'jabon-de-prueba',
    name: 'Jabón de prueba',
    tagline: 'Para piel seca',
    taglineSource: 'documentado',
    category: 'hidratantes',
    categorySource: 'editorial',
    mainIngredient: 'Manteca de karité',
    properties: ['hidratación'],
    propertiesSource: 'documentado',
    difficulty: 'principiante',
    difficultySource: 'editorial',
    timeLabel: '1–2 horas',
    timeSource: 'documentado',
    image: 'jabon-de-prueba',
    ingredients: [{ id: 'l1', name: 'Base de glicerina', amount: '500 g', source: 'documentado' }],
    utensils: ['Molde de silicona'],
    utensilsSource: 'documentado',
    steps: [{ id: 's1', text: 'Derretir la base' }],
    tips: [],
    warnings: [],
    note: '',
    featured: false,
    origin: 'archivo',
    createdAt: stamp,
    updatedAt: stamp,
    ...overrides,
  };
}

describe('pendingFields', () => {
  it('no marca nada cuando la receta está completa', () => {
    expect(pendingFields(completeRecipe())).toEqual([]);
  });

  it('solo marca la cantidad opcional del colorante en la receta básica', () => {
    const basica = SEED_RECIPES.find((recipe) => recipe.id === 'r-jabon-basico');
    expect(basica).toBeDefined();
    const pending = pendingFields(basica as Recipe);
    expect(pending.map((item) => item.field)).toEqual(['ingredientes']);
    expect(pending[0]?.detail).toContain('Colorante');
  });

  it('marca cada hueco por separado', () => {
    const cases: [Partial<Recipe>, string][] = [
      [{ tagline: '' }, 'descripcion'],
      [{ timeLabel: null }, 'tiempo'],
      [{ difficulty: null }, 'nivel'],
      [{ image: '' }, 'fotografia'],
      [{ utensils: [] }, 'utensilios'],
      [{ steps: [] }, 'pasos'],
      [
        { ingredients: [{ id: 'l1', name: 'Avena', source: 'pendiente' }] },
        'ingredientes',
      ],
    ];

    for (const [overrides, field] of cases) {
      const pending = pendingFields(completeRecipe(overrides));
      expect(pending.map((item) => item.field)).toContain(field);
    }
  });

  it('explica qué ingredientes concretos faltan por cantidad', () => {
    const recipe = completeRecipe({
      ingredients: [
        { id: 'l1', name: 'Avena molida', amount: '2 cucharadas', source: 'documentado' },
        { id: 'l2', name: 'Miel', source: 'pendiente' },
      ],
    });
    const item = pendingFields(recipe).find((entry) => entry.field === 'ingredientes');
    expect(item?.detail).toContain('Miel');
    expect(item?.detail).not.toContain('Avena molida');
  });
});

describe('missingAmountLines', () => {
  it('detecta cantidades vacías o ausentes', () => {
    const recipe = completeRecipe({
      ingredients: [
        { id: 'l1', name: 'A', amount: '', source: 'pendiente' },
        { id: 'l2', name: 'B', amount: '   ', source: 'pendiente' },
        { id: 'l3', name: 'C', amount: '10 g', source: 'documentado' },
      ],
    });
    expect(missingAmountLines(recipe).map((line) => line.id)).toEqual(['l1', 'l2']);
  });
});

describe('completenessRatio', () => {
  it('vale 1 cuando no hay huecos', () => {
    expect(completenessRatio(completeRecipe())).toBe(1);
  });

  it('baja con cada campo pendiente y nunca es negativa', () => {
    const vacia = completeRecipe({
      tagline: '',
      timeLabel: null,
      difficulty: null,
      image: '',
      utensils: [],
      steps: [],
      ingredients: [{ id: 'l1', name: 'X', source: 'pendiente' }],
    });
    expect(completenessRatio(vacia)).toBe(0);
    expect(completenessRatio(completeRecipe({ tagline: '' }))).toBeCloseTo(6 / 7);
  });
});

describe('hasPendingInfo', () => {
  it('es coherente con el medidor', () => {
    for (const recipe of SEED_RECIPES) {
      expect(hasPendingInfo(recipe)).toBe(completenessRatio(recipe) < 1);
    }
  });
});
