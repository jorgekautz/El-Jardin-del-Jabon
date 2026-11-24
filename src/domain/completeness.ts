import type { PendingItem, Recipe, RecipeIngredientLine } from './types';

/** Líneas de ingrediente cuya cantidad no aparece en el archivo. */
export function missingAmountLines(recipe: Recipe): RecipeIngredientLine[] {
  return recipe.ingredients.filter((line) => !line.amount || line.amount.trim() === '');
}

/**
 * Lista de campos que el archivo original no documenta.
 * La interfaz muestra estos huecos como "Información pendiente de completar"
 * en lugar de rellenarlos con valores inventados.
 */
export function pendingFields(recipe: Recipe): PendingItem[] {
  const pending: PendingItem[] = [];

  const missing = missingAmountLines(recipe);
  if (missing.length > 0) {
    pending.push({
      field: 'ingredientes',
      label: 'Cantidades de ingredientes',
      detail: `Sin cantidad documentada: ${missing.map((l) => l.name).join(', ')}.`,
    });
  }

  if (recipe.steps.length === 0) {
    pending.push({
      field: 'pasos',
      label: 'Preparación paso a paso',
      detail: 'El archivo no describe los pasos de esta receta.',
    });
  }

  if (recipe.utensils.length === 0) {
    pending.push({
      field: 'utensilios',
      label: 'Utensilios necesarios',
      detail: 'El archivo no especifica los utensilios de esta receta.',
    });
  }

  if (!recipe.timeLabel) {
    pending.push({
      field: 'tiempo',
      label: 'Tiempo de elaboración',
      detail: 'Sin tiempo documentado.',
    });
  }

  if (!recipe.difficulty) {
    pending.push({
      field: 'nivel',
      label: 'Nivel de dificultad',
      detail: 'El archivo no clasifica el nivel de esta receta.',
    });
  }

  if (recipe.tagline.trim() === '') {
    pending.push({
      field: 'descripcion',
      label: 'Descripción',
      detail: 'Sin descripción breve.',
    });
  }

  if (recipe.image.trim() === '') {
    pending.push({
      field: 'fotografia',
      label: 'Fotografía',
      detail: 'Aún no hay imagen para esta receta.',
    });
  }

  return pending;
}

/** Proporción de los siete campos clave que sí tienen dato (0 a 1). */
export function completenessRatio(recipe: Recipe): number {
  const total = 7;
  return (total - pendingFields(recipe).length) / total;
}

export function hasPendingInfo(recipe: Recipe): boolean {
  return pendingFields(recipe).length > 0;
}
