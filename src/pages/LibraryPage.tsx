import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useApp } from '../store/AppStore';
import { CATEGORIES, PROPERTY_OPTIONS } from '../data/seed';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  CATEGORY_LABELS,
  type CategoryId,
  type Difficulty,
} from '../domain/types';
import { filterRecipes, type RecipeFilters, type SortOrder } from '../domain/search';
import { RecipeCard } from '../components/RecipeCard';
import { Icon } from '../components/Icon';
import { Button } from '../components/ui/Button';
import { Badge, EmptyState, SectionHead } from '../components/ui/primitives';

const SORT_LABELS: Record<SortOrder, string> = {
  relevancia: 'Relevancia',
  nombre: 'Nombre (A-Z)',
  recientes: 'Modificadas recientemente',
};

function readFilters(params: URLSearchParams): RecipeFilters {
  return {
    q: params.get('q') ?? '',
    category: (params.get('categoria') ?? 'todas') as CategoryId | 'todas',
    property: params.get('propiedad') ?? '',
    ingredientId: params.get('ingrediente') ?? '',
    difficulty: (params.get('nivel') ?? 'todos') as Difficulty | 'todos',
    favoritesOnly: params.get('favoritas') === '1',
    sort: (params.get('orden') ?? 'relevancia') as SortOrder,
  };
}

export function LibraryPage() {
  useDocumentMeta(
    'Recetas de jabones artesanales · El Jardín del Jabón',
    'Catálogo de recetas de jabón artesanal con filtros por tipo, propiedad, ingrediente y nivel.',
  );

  const { recipes, ingredients, favorites } = useApp();
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);

  const results = useMemo(
    () => filterRecipes(recipes, filters, { favorites }),
    [recipes, filters, favorites],
  );

  const activeCount =
    (filters.category !== 'todas' ? 1 : 0) +
    (filters.property ? 1 : 0) +
    (filters.ingredientId ? 1 : 0) +
    (filters.difficulty !== 'todos' ? 1 : 0) +
    (filters.favoritesOnly ? 1 : 0) +
    (filters.q ? 1 : 0);

  const update = (patch: Partial<RecipeFilters>) => {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams();
    if (next.q) sp.set('q', next.q);
    if (next.category !== 'todas') sp.set('categoria', next.category);
    if (next.property) sp.set('propiedad', next.property);
    if (next.ingredientId) sp.set('ingrediente', next.ingredientId);
    if (next.difficulty !== 'todos') sp.set('nivel', next.difficulty);
    if (next.favoritesOnly) sp.set('favoritas', '1');
    if (next.sort !== 'relevancia') sp.set('orden', next.sort);
    setParams(sp, { replace: true });
  };

  return (
    <div className="page section--tight">
      <SectionHead
        eyebrow="Catálogo"
        title="Biblioteca de recetas"
        description="Todas las recetas documentadas, con filtros por tipo, propiedad, ingrediente principal y nivel."
        action={
          <Button to="/administracion/recetas/nueva" variant="outline" size="sm" icon="plus">
            Nueva receta
          </Button>
        }
      />

      <form className="filters no-print" onSubmit={(event) => event.preventDefault()} aria-label="Filtros del catálogo">
        <div className="stack-s">
          <div className="field">
            <label className="field__label" htmlFor="filtro-nombre">
              Buscar
            </label>
            <div className="searchbox__input">
              <span className="searchbox__icon">
                <Icon name="search" size={18} />
              </span>
              <input
                id="filtro-nombre"
                className="input"
                type="search"
                placeholder="Nombre, ingrediente, paso…"
                value={filters.q}
                onChange={(event) => update({ q: event.target.value })}
              />
            </div>
            <span className="field__hint">
              Busca en nombre, ingredientes, utensilios y pasos. Ignora tildes y mayúsculas.
            </span>
          </div>

          <div className="chips" role="group" aria-label="Tipo de jabón">
            <button
              type="button"
              className="chip"
              aria-pressed={filters.category === 'todas'}
              onClick={() => update({ category: 'todas' })}
            >
              Todos
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className="chip"
                aria-pressed={filters.category === category.id}
                onClick={() => update({ category: category.id })}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="filters__grid">
            <div className="field">
              <label className="field__label" htmlFor="filtro-propiedad">
                Propiedad o finalidad
              </label>
              <select
                id="filtro-propiedad"
                className="select"
                value={filters.property}
                onChange={(event) => update({ property: event.target.value })}
              >
                <option value="">Todas las propiedades</option>
                {PROPERTY_OPTIONS.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filtro-ingrediente">
                Ingrediente principal
              </label>
              <select
                id="filtro-ingrediente"
                className="select"
                value={filters.ingredientId}
                onChange={(event) => update({ ingredientId: event.target.value })}
              >
                <option value="">Todos los ingredientes</option>
                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filtro-nivel">
                Nivel de dificultad
              </label>
              <select
                id="filtro-nivel"
                className="select"
                value={filters.difficulty}
                onChange={(event) => update({ difficulty: event.target.value as Difficulty | 'todos' })}
              >
                <option value="todos">Todos los niveles</option>
                {DIFFICULTIES.map((level) => (
                  <option key={level} value={level}>
                    {DIFFICULTY_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filtro-orden">
                Orden
              </label>
              <select
                id="filtro-orden"
                className="select"
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value as SortOrder })}
              >
                {(Object.keys(SORT_LABELS) as SortOrder[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row row--between">
            <div className="chips">
              <button
                type="button"
                className="chip"
                aria-pressed={filters.favoritesOnly}
                onClick={() => update({ favoritesOnly: !filters.favoritesOnly })}
              >
                <Icon name="star" size={15} filled={filters.favoritesOnly} />
                Solo favoritas
              </button>
              {activeCount > 0 ? (
                <Button variant="quiet" size="sm" icon="close" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  Limpiar filtros
                </Button>
              ) : null}
            </div>
            <p className="meta">
              Clasificaciones de nivel añadidas por el sitio: el archivo no las documenta.
            </p>
          </div>
        </div>
      </form>

      <div className="results-bar" style={{ marginTop: 'var(--space-m)' }}>
        <p aria-live="polite">
          <strong>{results.length}</strong> {results.length === 1 ? 'receta' : 'recetas'}
          {filters.q ? <> para «{filters.q}»</> : null}
        </p>
        <div className="row">
          {filters.category !== 'todas' ? (
            <Badge tone="accent">{CATEGORY_LABELS[filters.category]}</Badge>
          ) : null}
          {filters.property ? <Badge tone="accent">{filters.property}</Badge> : null}
          {filters.difficulty !== 'todos' ? (
            <Badge tone="accent">{DIFFICULTY_LABELS[filters.difficulty]}</Badge>
          ) : null}
          {filters.favoritesOnly ? <Badge tone="accent">Favoritas</Badge> : null}
        </div>
      </div>

      {results.length === 0 ? (
        <div style={{ marginTop: 'var(--space-l)' }}>
          <EmptyState
            icon="search"
            title="Ninguna receta coincide"
            description="Prueba con un término más corto o quita algún filtro: las recetas del archivo son seis."
            action={
              <Button variant="outline" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                Quitar todos los filtros
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid-cards" style={{ marginTop: 'var(--space-l)' }}>
          {results.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
