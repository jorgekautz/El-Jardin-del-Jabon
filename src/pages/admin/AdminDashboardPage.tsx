import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useApp } from '../../store/AppStore';
import { useToast } from '../../store/toasts';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../../domain/types';
import { completenessRatio, pendingFields } from '../../domain/completeness';
import { photoInventory, resolveRecipePhoto } from '../../assets/photos';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge, Meter, Notice, SectionHead } from '../../components/ui/primitives';

type PendingDelete =
  | { kind: 'receta'; id: string; name: string }
  | { kind: 'ingrediente'; id: string; name: string }
  | null;

/** Panel de control: inventario de contenido, destacadas y restablecimiento del archivo. */
export function AdminDashboardPage() {
  useDocumentMeta(
    'Administración · El Jardín del Jabón',
    'Resumen del contenido de la biblioteca: recetas, ingredientes, lista de compra y campos pendientes.',
  );

  const { recipes, ingredients, shopping, favorites, dispatch, resetAll } = useApp();
  const { notify } = useToast();
  const [pending, setPending] = useState<PendingDelete>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useMemo(() => {
    const pendingTotal = recipes.reduce((sum, recipe) => sum + pendingFields(recipe).length, 0);
    return {
      featured: recipes.filter((recipe) => recipe.featured).length,
      pendingRecipes: recipes.filter((recipe) => pendingFields(recipe).length > 0).length,
      pendingTotal,
      photos: recipes.filter((recipe) => resolveRecipePhoto(recipe.image || recipe.slug)).length,
      pendingProps: ingredients.filter((item) => item.property.trim() === '').length,
      bought: shopping.filter((item) => item.checked).length,
    };
  }, [recipes, ingredients, shopping]);

  const orderedRecipes = useMemo(
    () => [...recipes].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [recipes],
  );

  const orderedIngredients = useMemo(
    () => [...ingredients].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [ingredients],
  );

  const confirmAction = () => {
    if (!pending) return;
    if (pending.kind === 'receta') {
      dispatch({ type: 'deleteRecipe', id: pending.id });
      notify(`Receta «${pending.name}» eliminada.`);
    } else {
      dispatch({ type: 'deleteIngredient', id: pending.id });
      notify(`Ficha «${pending.name}» eliminada.`);
    }
    setPending(null);
  };

  return (
    <>
      <SectionHead
        eyebrow="Resumen"
        title="Contenido de la biblioteca"
        description="Todo lo que se muestra en el sitio público, con los huecos que el archivo original no documenta."
        action={
          <div className="row">
            <Button to="/administracion/recetas/nueva" size="sm" icon="plus">
              Nueva receta
            </Button>
            <Button to="/administracion/ingredientes/nuevo" variant="outline" size="sm" icon="plus">
              Nuevo ingrediente
            </Button>
          </div>
        }
      />

      <div className="stat-grid">
        <div className="stat">
          <span className="stat__value">{recipes.length}</span>
          <span className="meta">recetas</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.featured}</span>
          <span className="meta">destacadas en portada</span>
        </div>
        <div className="stat">
          <span className="stat__value">{ingredients.length}</span>
          <span className="meta">fichas de ingrediente</span>
        </div>
        <div className="stat">
          <span className="stat__value">{favorites.length}</span>
          <span className="meta">favoritas guardadas</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            {stats.photos}
            <span className="stat__suffix">/{recipes.length}</span>
          </span>
          <span className="meta">con fotografía</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.pendingTotal}</span>
          <span className="meta">campos pendientes</span>
        </div>
      </div>

      {/* --- Recetas ------------------------------------------------------- */}
      <section aria-labelledby="admin-recetas">
        <div className="section-head row row--between">
          <h2 id="admin-recetas">Recetas</h2>
          <span className="meta">
            {stats.pendingRecipes} de {recipes.length} con información pendiente
          </span>
        </div>

        {orderedRecipes.length === 0 ? (
          <Notice tone="pending" title="Sin recetas" icon="warning">
            <p>
              El catálogo está vacío. Crea una receta o restablece el contenido del archivo más
              abajo.
            </p>
          </Notice>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Recetas de la biblioteca con su estado</caption>
              <thead>
                <tr>
                  <th scope="col">Receta</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Nivel</th>
                  <th scope="col">Completitud</th>
                  <th scope="col">Destacada</th>
                  <th scope="col"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {orderedRecipes.map((recipe) => {
                  const ratio = completenessRatio(recipe);
                  const pending = pendingFields(recipe);
                  return (
                    <tr key={recipe.id}>
                      <th scope="row" style={{ fontWeight: 600 }}>
                        <Link to={`/recetas/${recipe.slug}`}>{recipe.name}</Link>
                        {pending.length > 0 ? (
                          <span className="meta" style={{ display: 'block' }}>
                            {pending.map((item) => item.label).join(' · ')}
                          </span>
                        ) : null}
                      </th>
                      <td data-label="Tipo">{CATEGORY_LABELS[recipe.category]}</td>
                      <td data-label="Nivel">
                        {recipe.difficulty ? DIFFICULTY_LABELS[recipe.difficulty] : '—'}
                      </td>
                      <td data-label="Completitud" style={{ minWidth: '9rem' }}>
                        <Meter
                          ratio={ratio}
                          caption={`${Math.round(ratio * 100)}%`}
                        />
                      </td>
                      <td data-label="Destacada">
                        <button
                          type="button"
                          className="btn btn--quiet btn--sm"
                          onClick={() => dispatch({ type: 'toggleFeatured', id: recipe.id })}
                          aria-pressed={recipe.featured}
                          aria-label={
                            recipe.featured
                              ? `Quitar ${recipe.name} de destacadas`
                              : `Marcar ${recipe.name} como destacada`
                          }
                          title={recipe.featured ? 'Quitar de destacadas' : 'Marcar como destacada'}
                        >
                          <Icon name="star" size={16} filled={recipe.featured} />
                        </button>
                      </td>
                      <td data-label="Acciones">
                        <span className="table__actions">
                          <Button
                            to={`/administracion/recetas/${recipe.id}/editar`}
                            variant="quiet"
                            size="sm"
                            icon="pencil"
                            aria-label={`Editar ${recipe.name}`}
                            title={`Editar ${recipe.name}`}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            icon="trash"
                            aria-label={`Eliminar ${recipe.name}`}
                            title={`Eliminar ${recipe.name}`}
                            onClick={() => setPending({ kind: 'receta', id: recipe.id, name: recipe.name })}
                          />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- Ingredientes -------------------------------------------------- */}
      <section aria-labelledby="admin-ingredientes">
        <div className="section-head row row--between">
          <h2 id="admin-ingredientes">Ingredientes</h2>
          <span className="meta">
            {stats.pendingProps} {stats.pendingProps === 1 ? 'ficha' : 'fichas'} sin propiedad
            documentada
          </span>
        </div>

        {orderedIngredients.length === 0 ? (
          <Notice tone="pending" title="Sin fichas" icon="warning">
            <p>Crea fichas desde «Nuevo ingrediente» para enlazarlas a las recetas.</p>
          </Notice>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Fichas de ingredientes con su procedencia</caption>
              <thead>
                <tr>
                  <th scope="col">Ingrediente</th>
                  <th scope="col">Propiedad</th>
                  <th scope="col">Origen</th>
                  <th scope="col"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {orderedIngredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <th scope="row" style={{ fontWeight: 600 }}>
                      <Link to={`/ingredientes/${ingredient.slug}`}>{ingredient.name}</Link>
                    </th>
                    <td data-label="Propiedad">
                      {ingredient.property.trim() ? (
                        ingredient.property
                      ) : (
                        <Badge tone="pending">Pendiente</Badge>
                      )}
                    </td>
                    <td data-label="Origen">
                      {ingredient.origin === 'archivo' ? (
                        <Badge tone="accent">Archivo</Badge>
                      ) : (
                        <Badge>Añadida</Badge>
                      )}
                    </td>
                    <td data-label="Acciones">
                      <span className="table__actions">
                        <Button
                          to={`/administracion/ingredientes/${ingredient.id}/editar`}
                          variant="quiet"
                          size="sm"
                          icon="pencil"
                          aria-label={`Editar ${ingredient.name}`}
                          title={`Editar ${ingredient.name}`}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          icon="trash"
                          aria-label={`Eliminar ${ingredient.name}`}
                          title={`Eliminar ${ingredient.name}`}
                          onClick={() =>
                            setPending({ kind: 'ingrediente', id: ingredient.id, name: ingredient.name })
                          }
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- Fotografías --------------------------------------------------- */}
      <section aria-labelledby="admin-fotos">
        <div className="section-head">
          <h2 id="admin-fotos">Fotografías</h2>
          <p className="card__text">
            Las imágenes se depositan en <code>src/assets/images/recipes/</code> con el nombre del
            slug de la receta, y en <code>src/assets/images/sections/</code> como{' '}
            <code>hero</code>, <code>botanicals</code> y <code>tools</code>. Mientras no estén, el
            sitio muestra la placa botánica y el aviso de fotografía pendiente.
          </p>
        </div>
        <div className="row">
          {orderedRecipes.map((recipe) => {
            const has = Boolean(resolveRecipePhoto(recipe.image || recipe.slug));
            return (
              <Badge key={recipe.id} tone={has ? 'accent' : 'pending'}>
                {recipe.name}
              </Badge>
            );
          })}
        </div>
        <p className="meta">
          Imágenes detectadas: {photoInventory.recipeKeys.length} de recetas ·{' '}
          {photoInventory.sectionKeys.length} de secciones
          {photoInventory.sectionKeys.length > 0
            ? ` (${photoInventory.sectionKeys.join(', ')})`
            : ''}
          .
        </p>
      </section>

      {/* --- Lista de compra ------------------------------------------------ */}
      <section aria-labelledby="admin-compras">
        <div className="section-head row row--between">
          <h2 id="admin-compras">Lista de compra</h2>
          <span className="meta">
            {stats.bought} de {shopping.length} adquiridos
          </span>
        </div>
        <p className="card__text">
          Las casillas se guardan en este navegador. Puedes editar la lista desde la{' '}
          <Link to="/compras">pantalla de compras</Link>: ahí se añaden y se quitan productos.
        </p>
      </section>

      {/* --- Restablecer --------------------------------------------------- */}
      <section className="filters" aria-labelledby="admin-restaurar">
        <div className="stack-xs">
          <h2 id="admin-restaurar" className="label">
            Restablecer el contenido
          </h2>
          <p className="card__text">
            Vuelve al contenido transcrito de <code>recetas.txt</code>: se borrarán las recetas y
            fichas creadas aquí, las ediciones sobre las originales, la lista de compra propia y las
            recetas favoritas.
          </p>
        </div>
        <div className="row">
          <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmReset(true)}>
            Restablecer todo
          </Button>
          <Button to="/recetas" variant="quiet" size="sm" icon="arrowRight">
            Ver el sitio público
          </Button>
        </div>
      </section>

      {pending ? (
        <Modal
          title={`Eliminar ${pending.kind === 'receta' ? 'la receta' : 'la ficha'} «${pending.name}»`}
          onClose={() => setPending(null)}
          footer={
            <>
              <p className="meta">No se puede deshacer.</p>
              <div className="row">
                <Button variant="outline" size="sm" onClick={() => setPending(null)}>
                  Conservar
                </Button>
                <Button variant="danger" size="sm" icon="trash" onClick={confirmAction}>
                  Eliminar
                </Button>
              </div>
            </>
          }
        >
          <p>
            {pending.kind === 'receta'
              ? 'Saldrá del catálogo, de la portada y de tus favoritas.'
              : 'Las recetas que la mencionan conservarán el nombre en su fórmula.'}
          </p>
        </Modal>
      ) : null}

      {confirmReset ? (
        <Modal
          title="Restablecer el contenido del archivo"
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <p className="meta">Se borra lo guardado en este navegador.</p>
              <div className="row">
                <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                    notify('Contenido restablecido desde el archivo.');
                  }}
                >
                  Restablecer
                </Button>
              </div>
            </>
          }
        >
          <p>
            El sitio volverá a las 6 recetas y las fichas originales. Esta acción no afecta a las
            fotografías que hayas añadido a la carpeta de recursos.
          </p>
        </Modal>
      ) : null}
    </>
  );
}
