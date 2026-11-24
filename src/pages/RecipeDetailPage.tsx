import { Link, useParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useApp } from '../store/AppStore';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  INGREDIENT_CATEGORY_LABELS,
} from '../domain/types';
import { completenessRatio, pendingFields } from '../domain/completeness';
import { resolveRecipePhoto } from '../assets/photos';
import { FavoriteButton } from '../components/FavoriteButton';
import { Icon } from '../components/Icon';
import { PendingPanel } from '../components/PendingPanel';
import { SafetyPanel } from '../components/SafetyPanel';
import { SmartImage } from '../components/SmartImage';
import { Button } from '../components/ui/Button';
import { Badge, Meter, SourceBadge } from '../components/ui/primitives';

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { recipes, ingredients } = useApp();
  const recipe = recipes.find((item) => item.slug === slug);

  useDocumentMeta(
    recipe ? `${recipe.name} · El Jardín del Jabón` : 'Receta no encontrada · El Jardín del Jabón',
    recipe?.tagline?.trim() || `Receta de jabón artesanal: ${recipe?.name ?? ''}`,
  );

  if (!recipe) {
    return (
      <div className="page section">
        <h1>Receta no encontrada</h1>
        <p className="lead">
          El enlace «{slug}» no corresponde a ninguna receta guardada en este navegador.
        </p>
        <div className="row" style={{ marginTop: 'var(--space-m)' }}>
          <Button to="/recetas" variant="outline" icon="arrowLeft">
            Volver al catálogo
          </Button>
          <Button to="/administracion/recetas/nueva" variant="quiet" icon="plus">
            Crear esa receta
          </Button>
        </div>
      </div>
    );
  }

  const photo = resolveRecipePhoto(recipe.image || recipe.slug);
  const pending = pendingFields(recipe);
  const ratio = completenessRatio(recipe);
  const linkedIngredients = recipe.ingredients
    .map((line) => ingredients.find((item) => item.id === line.ingredientId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <article className="page section--tight">
      <nav className="row no-print" aria-label="Migas de pan" style={{ marginBottom: 'var(--space-m)' }}>
        <Link to="/recetas" className="row" style={{ gap: 'var(--space-2xs)', textDecoration: 'none' }}>
          <Icon name="arrowLeft" size={15} />
          Catálogo de recetas
        </Link>
        <span className="meta" aria-hidden="true">
          /
        </span>
        <span className="meta">{recipe.name}</span>
      </nav>

      <header className="detail-head">
        <div className="stack">
          <div className="row">
            <Badge tone="accent">{CATEGORY_LABELS[recipe.category]}</Badge>
            {pending.length > 0 ? (
              <Badge tone="pending">
                {pending.length} {pending.length === 1 ? 'dato pendiente' : 'datos pendientes'}
              </Badge>
            ) : (
              <Badge tone="accent">Receta completa</Badge>
            )}
          </div>

          <div className="stack-xs">
            <h1>{recipe.name}</h1>
            <p className="lead">{recipe.tagline.trim() || 'Descripción pendiente de completar.'}</p>
          </div>

          <div className="row no-print">
            <FavoriteButton recipeId={recipe.id} recipeName={recipe.name} variant="button" />
            <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
              Imprimir receta
            </Button>
            <Button
              to={`/administracion/recetas/${recipe.id}/editar`}
              variant="quiet"
              size="sm"
              icon="pencil"
            >
              Editar
            </Button>
          </div>

          <div className="spec-sheet">
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Ingrediente principal</span>
              <span>{recipe.mainIngredient || 'Pendiente de completar'}</span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Propiedades</span>
              <span className="row" style={{ gap: 'var(--space-2xs)' }}>
                {recipe.properties.length > 0 ? (
                  <>
                    {recipe.properties.map((property) => (
                      <Badge key={property} tone="accent">
                        {property}
                      </Badge>
                    ))}
                    <SourceBadge source={recipe.propertiesSource} />
                  </>
                ) : (
                  <SourceBadge source="pendiente" suffix="Propiedades pendientes de completar" />
                )}
              </span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Nivel</span>
              <span className="row" style={{ gap: 'var(--space-2xs)' }}>
                {recipe.difficulty ? (
                  <>
                    {DIFFICULTY_LABELS[recipe.difficulty]}
                    <SourceBadge source={recipe.difficultySource} />
                  </>
                ) : (
                  <SourceBadge source="pendiente" suffix="Nivel pendiente" />
                )}
              </span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Elaboración</span>
              <span className="row" style={{ gap: 'var(--space-2xs)' }}>
                {recipe.timeLabel ? (
                  <>
                    <Icon name="clock" size={15} />
                    {recipe.timeLabel}
                    <SourceBadge source={recipe.timeSource} />
                  </>
                ) : (
                  <SourceBadge source="pendiente" suffix="Tiempo pendiente de completar" />
                )}
              </span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Categoría</span>
              <span className="row" style={{ gap: 'var(--space-2xs)' }}>
                {CATEGORY_LABELS[recipe.category]}
                <SourceBadge source={recipe.categorySource} />
              </span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Completitud</span>
              <Meter
                ratio={ratio}
                caption={`${Math.round(ratio * 100)} % de los campos clave con dato`}
              />
            </div>
          </div>
        </div>

        <div className="detail-media">
          <SmartImage
            photo={photo}
            seed={recipe.name}
            eager
            alt={`Fotografía de ${recipe.name}`}
            pendingLabel={photo ? undefined : 'Fotografía pendiente'}
          />
        </div>
      </header>

      <div className="print-header print-only">
        <h1>{recipe.name}</h1>
        <p className="print-header__meta">
          El Jardín del Jabón · {CATEGORY_LABELS[recipe.category]} ·{' '}
          {new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}
        </p>
      </div>

      {/* --- Ingredientes ------------------------------------------------- */}
      <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="ingredientes-titulo">
        <div className="section-head">
          <span className="label">Fórmula</span>
          <h2 id="ingredientes-titulo">Ingredientes y cantidades</h2>
        </div>
        {recipe.ingredients.length === 0 ? (
          <p className="lead">Información pendiente.</p>
        ) : (
          <ul className="formula">
            {recipe.ingredients.map((line, index) => (
              <li className="formula__row" key={line.id}>
                <span className="formula__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="formula__name">
                  <strong>{line.name}</strong>
                  {line.amountNote ? <span className="formula__note">{line.amountNote}</span> : null}
                  {line.source === 'pendiente' ? (
                    <span className="formula__note">
                      <SourceBadge source="pendiente" suffix="Dato del archivo incompleto" />
                    </span>
                  ) : null}
                </span>
                <span className="formula__amount">
                  {line.amount ? (
                    line.amount
                  ) : (
                    <span className="formula__amount--pending">Cantidad pendiente</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {recipe.note ? <p className="meta" style={{ marginTop: 'var(--space-s)' }}>{recipe.note}</p> : null}
      </section>

      {/* --- Utensilios ---------------------------------------------------- */}
      <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="utensilios-titulo">
        <div className="section-head">
          <span className="label">Mesa de trabajo</span>
          <h2 id="utensilios-titulo">Utensilios necesarios</h2>
        </div>
        {recipe.utensils.length === 0 ? (
          <p className="lead">
            Información pendiente de completar: el archivo no especifica los utensilios de esta
            receta. Las herramientas básicas del sitio aplican al método de glicerina.
          </p>
        ) : (
          <>
            <ul className="chips">
              {recipe.utensils.map((utensil) => (
                <li key={utensil}>
                  <Badge icon="mold">{utensil}</Badge>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 'var(--space-s)' }}>
              <SourceBadge source={recipe.utensilsSource} />
            </div>
          </>
        )}
      </section>

      {/* --- Preparación --------------------------------------------------- */}
      <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="pasos-titulo">
        <div className="section-head">
          <span className="label">Elaboración</span>
          <h2 id="pasos-titulo">Preparación paso a paso</h2>
        </div>
        {recipe.steps.length === 0 ? (
          <p className="lead">
            Información pendiente de completar: el archivo no describe la secuencia de pasos de esta
            receta.
          </p>
        ) : (
          <ol className="steps">
            {recipe.steps.map((step) => (
              <li className="steps__item" key={step.id}>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* --- Consejos ------------------------------------------------------ */}
      {recipe.tips.length > 0 ? (
        <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="consejos-titulo">
          <div className="section-head">
            <span className="label">Consejos</span>
            <h2 id="consejos-titulo">Consejos de elaboración</h2>
          </div>
          <ul className="stack-xs">
            {recipe.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --- Pendientes y seguridad ---------------------------------------- */}
      <section
        className="grid-two"
        style={{ marginTop: 'var(--space-xl)' }}
        aria-labelledby="observaciones-titulo"
      >
        <div>
          <div className="section-head">
            <span className="label">Observaciones</span>
            <h2 id="observaciones-titulo">Estado de la información</h2>
          </div>
          <PendingPanel recipe={recipe} />
        </div>
        <div>
          <div className="section-head">
            <span className="label">Responsabilidad</span>
            <h2 id="advertencias-titulo">Advertencias</h2>
          </div>
          <SafetyPanel recipeWarnings={recipe.warnings} />
        </div>
      </section>

      {/* --- Ingredientes enlazados ----------------------------------------- */}
      {linkedIngredients.length > 0 ? (
        <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="fichas-titulo">
          <div className="section-head">
            <span className="label">Fichas relacionadas</span>
            <h2 id="fichas-titulo">Ingredientes de esta receta</h2>
          </div>
          <ul className="chips">
            {linkedIngredients.map((ingredient) => (
              <li key={ingredient.id}>
                <Link className="chip" to={`/ingredientes/${ingredient.slug}`}>
                  <span className="meta">{INGREDIENT_CATEGORY_LABELS[ingredient.category]}</span>
                  {ingredient.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
