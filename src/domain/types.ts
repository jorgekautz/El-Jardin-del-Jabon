/**
 * Modelo de datos de El Jardín del Jabón.
 *
 * Principio rector: el archivo `recetas.txt` es la única fuente de datos documentados.
 * Cada campo lleva una procedencia explícita para no mezclar información del archivo
 * con clasificaciones editoriales o datos que faltan por completar.
 */

/** Procedencia de un valor concreto de una receta o ingrediente. */
export type SourceKind =
  /** Copiado del archivo `recetas.txt`. */
  | 'documentado'
  /** Clasificación añadida por el sitio (nivel, categoría, agrupación). No está en el archivo. */
  | 'editorial'
  /** El archivo no aporta el dato: hay que completarlo desde la administración. */
  | 'pendiente';

export type Difficulty = 'principiante' | 'intermedio' | 'avanzado';

export const DIFFICULTIES: Difficulty[] = ['principiante', 'intermedio', 'avanzado'];

/** Categorías de la biblioteca de recetas. */
export type CategoryId =
  | 'basicos'
  | 'exfoliantes'
  | 'hidratantes'
  | 'absorbentes'
  | 'aromaticos'
  | 'otros';

export interface Category {
  id: CategoryId;
  label: string;
  /** Descripción tomada del archivo cuando existe. */
  blurb: string;
  /** Fuente de `blurb`. */
  blurbSource: SourceKind;
}

/** Categorías de la biblioteca de ingredientes. */
export type IngredientCategory =
  | 'bases'
  | 'aceites'
  | 'aromas'
  | 'complementarios'
  | 'utensilios';

export interface Ingredient {
  id: string;
  slug: string;
  name: string;
  category: IngredientCategory;
  /** Propiedad o función tal y como la describe el archivo. Vacía si el archivo no la describe. */
  property: string;
  propertySource: SourceKind;
  /** Variante o familia a la que pertenece (p. ej. "Base de glicerina"). */
  family?: string;
  /** Nota de seguridad específica del ingrediente. */
  caution?: string;
  origin: 'archivo' | 'usuario';
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredientLine {
  id: string;
  /** Nombre tal como aparece en la receta (puede ser "avena molida o semillas de amapola"). */
  name: string;
  /** Enlace opcional a la biblioteca de ingredientes. */
  ingredientId?: string;
  /** Cantidad documentada, en texto libre para respetar el original ("0,5 g", "10–15 gotas"). */
  amount?: string;
  /** Aclaración del archivo sobre la cantidad ("o ½ cucharadita"). */
  amountNote?: string;
  source: SourceKind;
}

export interface RecipeStep {
  id: string;
  text: string;
}

export interface Recipe {
  id: string;
  slug: string;
  name: string;
  /** Descripción breve de una línea. */
  tagline: string;
  taglineSource: SourceKind;
  category: CategoryId;
  categorySource: SourceKind;
  mainIngredient: string;
  /** Finalidades o propiedades usadas como filtro ("exfoliante", "hidratación"). */
  properties: string[];
  propertiesSource: SourceKind;
  difficulty: Difficulty | null;
  difficultySource: SourceKind;
  /** Tiempo de elaboración en texto libre ("1–2 horas"). */
  timeLabel: string | null;
  timeSource: SourceKind;
  /** Ruta de la fotografía. Vacía si aún no hay imagen. */
  image: string;
  ingredients: RecipeIngredientLine[];
  utensils: string[];
  utensilsSource: SourceKind;
  steps: RecipeStep[];
  tips: string[];
  warnings: string[];
  /** Nota de contexto del archivo. */
  note: string;
  featured: boolean;
  origin: 'archivo' | 'usuario';
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  label: string;
  detail: string;
  quantity: string;
  checked: boolean;
  origin: 'archivo' | 'usuario';
}

export interface Tool {
  id: string;
  name: string;
  use: string;
  /** Procedencia de la descripción de uso. */
  useSource: SourceKind;
}

/** Campos de una receta que el archivo no documenta y conviene completar. */
export type PendingField =
  | 'ingredientes'
  | 'pasos'
  | 'utensilios'
  | 'tiempo'
  | 'nivel'
  | 'descripcion'
  | 'fotografia';

export interface PendingItem {
  field: PendingField;
  label: string;
  /** Detalle concreto de qué falta. */
  detail: string;
}

export const SOURCE_LABELS: Record<SourceKind, string> = {
  documentado: 'Documentado en recetas.txt',
  editorial: 'Clasificación editorial',
  pendiente: 'Información pendiente de completar',
};

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  basicos: 'Básicos',
  exfoliantes: 'Exfoliantes',
  hidratantes: 'Hidratantes',
  absorbentes: 'Absorbentes',
  aromaticos: 'Aromáticos',
  otros: 'Otros',
};

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  bases: 'Bases de jabón',
  aceites: 'Aceites y mantecas',
  aromas: 'Fragancias y aceites esenciales',
  complementarios: 'Exfoliantes y complementarios',
  utensilios: 'Utensilios',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
