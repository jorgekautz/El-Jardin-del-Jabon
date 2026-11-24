import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useDebounced } from '../hooks/useDebounced';
import { useApp } from '../store/AppStore';
import { INGREDIENT_CATEGORY_LABELS, type IngredientCategory } from '../domain/types';
import { filterIngredients } from '../domain/search';
import { IngredientCard } from '../components/IngredientCard';
import { Icon } from '../components/Icon';
import { Button } from '../components/ui/Button';
import { EmptyState, SectionHead } from '../components/ui/primitives';

const ORDER: IngredientCategory[] = [
  'bases',
  'aceites',
  'aromas',
  'complementarios',
];

export function IngredientsPage() {
  useDocumentMeta(
    'Ingredientes de jabón artesanal · El Jardín del Jabón',
    'Bases de glicerina, aceites y mantecas, fragancias y complementos: función documentada y recetas en las que aparecen.',
  );

  const { ingredients, recipes } = useApp();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') ?? '');
  const debounced = useDebounced(draft);
  const [category, setCategory] = useState<IngredientCategory | 'todas'>('todas');

  const results = useMemo(() => filterIngredients(ingredients, debounced), [ingredients, debounced]);
  const grouped = ORDER.filter((key) => category === 'todas' || key === category)
    .map((key) => ({
      key,
      items: results.filter((item) => item.category === key),
    }))
    .filter((group) => group.items.length > 0);

  const applyQuery = (value: string) => {
    setDraft(value);
    const sp = new URLSearchParams();
    if (value.trim()) sp.set('q', value.trim());
    setParams(sp, { replace: true });
  };

  return (
    <div className="page section--tight">
      <SectionHead
        eyebrow="Materia prima"
        title="Biblioteca de ingredientes"
        description="Cada ficha recoge la propiedad que le atribuye el archivo original y las recetas en las que aparece."
        action={
          <Button to="/administracion/ingredientes/nuevo" variant="outline" size="sm" icon="plus">
            Nuevo ingrediente
          </Button>
        }
      />

      <form className="filters no-print" onSubmit={(event) => event.preventDefault()} aria-label="Filtros de ingredientes">
        <div className="stack-s">
          <div className="field">
            <label className="field__label" htmlFor="buscar-ingrediente">
              Buscar ingrediente
            </label>
            <div className="searchbox__input">
              <span className="searchbox__icon">
                <Icon name="search" size={18} />
              </span>
              <input
                id="buscar-ingrediente"
                className="input"
                type="search"
                placeholder="Avena, karité, lavanda…"
                value={draft}
                onChange={(event) => applyQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="chips" role="group" aria-label="Categoría de ingrediente">
            <button
              type="button"
              className="chip"
              aria-pressed={category === 'todas'}
              onClick={() => setCategory('todas')}
            >
              Todas
            </button>
            {ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className="chip"
                aria-pressed={category === key}
                onClick={() => setCategory(key)}
              >
                {INGREDIENT_CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>

          <p className="meta" aria-live="polite">
            {results.length} de {ingredients.length} ingredientes
            {debounced.trim() ? <> para «{debounced.trim()}»</> : null}
          </p>
        </div>
      </form>

      {grouped.length === 0 ? (
        <div style={{ marginTop: 'var(--space-l)' }}>
          <EmptyState
            icon="search"
            title="Sin ingredientes"
            description="Ningún ingrediente coincide con la búsqueda en la categoría seleccionada."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  applyQuery('');
                  setCategory('todas');
                }}
              >
                Quitar los filtros
              </Button>
            }
          />
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 'var(--space-l)' }}>
          {grouped.map((group) => (
            <section key={group.key} aria-labelledby={`grupo-${group.key}`}>
              <div className="section-head row row--between">
                <h2 id={`grupo-${group.key}`}>{INGREDIENT_CATEGORY_LABELS[group.key]}</h2>
                <span className="meta">
                  {group.items.length} {group.items.length === 1 ? 'ficha' : 'fichas'}
                </span>
              </div>
              <div className="grid-cards">
                {group.items.map((ingredient) => (
                  <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    recipes={recipes}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
