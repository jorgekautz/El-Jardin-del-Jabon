import { Link, useParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useApp } from '../store/AppStore';
import { INGREDIENT_CATEGORY_LABELS } from '../domain/types';
import { recipesUsingIngredient } from '../domain/search';
import { BotanicalPlate } from '../components/BotanicalPlate';
import { Icon } from '../components/Icon';
import { RecipeCard } from '../components/RecipeCard';
import { SafetyPanel } from '../components/SafetyPanel';
import { Button } from '../components/ui/Button';
import { Badge, Notice, SourceBadge } from '../components/ui/primitives';

export function IngredientDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { ingredients, recipes } = useApp();
  const ingredient = ingredients.find((item) => item.slug === slug);

  useDocumentMeta(
    ingredient ? `${ingredient.name} · Ingredientes · El Jardín del Jabón` : 'Ingrediente no encontrado',
    ingredient?.property?.trim() || `Ficha de ${ingredient?.name ?? 'ingrediente'} en El Jardín del Jabón`,
  );

  if (!ingredient) {
    return (
      <div className="page section">
        <h1>Ingrediente no encontrado</h1>
        <p className="lead">El enlace «{slug}» no corresponde a ninguna ficha guardada.</p>
        <div className="row" style={{ marginTop: 'var(--space-m)' }}>
          <Button to="/ingredientes" variant="outline" icon="arrowLeft">
            Volver a la biblioteca
          </Button>
        </div>
      </div>
    );
  }

  const usedIn = recipesUsingIngredient(recipes, ingredient);

  return (
    <article className="page section--tight">
      <nav className="row no-print" aria-label="Migas de pan" style={{ marginBottom: 'var(--space-m)' }}>
        <Link to="/ingredientes" className="row" style={{ gap: 'var(--space-2xs)', textDecoration: 'none' }}>
          <Icon name="arrowLeft" size={15} />
          Biblioteca de ingredientes
        </Link>
        <span className="meta" aria-hidden="true">
          /
        </span>
        <span className="meta">{ingredient.name}</span>
      </nav>

      <div className="detail-head">
        <div className="stack">
          <div className="row">
            <Badge>{INGREDIENT_CATEGORY_LABELS[ingredient.category]}</Badge>
            {ingredient.family ? <Badge tone="accent">{ingredient.family}</Badge> : null}
          </div>

          <div className="stack-xs">
            <h1>{ingredient.name}</h1>
            <p className="lead">
              {ingredient.property.trim() || 'Propiedad pendiente de completar.'}
            </p>
          </div>

          <div className="spec-sheet">
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Función</span>
              <span className="row" style={{ gap: 'var(--space-2xs)' }}>
                {ingredient.property.trim() ? (
                  <>
                    {ingredient.property}
                    <SourceBadge source={ingredient.propertySource} />
                  </>
                ) : (
                  <SourceBadge source="pendiente" suffix="Propiedad pendiente de completar" />
                )}
              </span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">En recetas</span>
              <span>
                {usedIn.length === 0
                  ? 'Ninguna receta documentada lo incluye por ahora.'
                  : `${usedIn.length} ${usedIn.length === 1 ? 'receta lo incluye' : 'recetas lo incluyen'}`}
              </span>
            </div>
            <div className="spec-sheet__row">
              <span className="spec-sheet__key">Origen del dato</span>
              <span>
                {ingredient.origin === 'archivo'
                  ? 'Ficha transcrita del archivo de recetas.'
                  : 'Ficha creada desde la administración.'}
              </span>
            </div>
          </div>

          <div className="row no-print">
            <Button
              to={`/administracion/ingredientes/${ingredient.id}/editar`}
              variant="outline"
              size="sm"
              icon="pencil"
            >
              Editar ficha
            </Button>
          </div>

          {ingredient.caution ? (
            <Notice tone="pending" title="Nota del archivo" icon="warning">
              <p className="card__text">{ingredient.caution}</p>
            </Notice>
          ) : null}
        </div>

        <div className="detail-media">
          <BotanicalPlate seed={ingredient.name} label={ingredient.name} />
        </div>
      </div>

      <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="usos-titulo">
        <div className="section-head">
          <span className="label">Aplicaciones</span>
          <h2 id="usos-titulo">Recetas con {ingredient.name.toLowerCase()}</h2>
        </div>
        {usedIn.length === 0 ? (
          <p className="lead">
            Todavía no hay recetas documentadas que incluyan este ingrediente. Puedes añadirlo a una
            receta desde la administración.
          </p>
        ) : (
          <div className="grid-cards">
            {usedIn.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="seguridad-ingrediente">
        <div className="section-head">
          <span className="label">Responsabilidad</span>
          <h2 id="seguridad-ingrediente">Sobre el uso cosmético</h2>
        </div>
        <SafetyPanel title="Uso de ingredientes naturales" />
      </section>
    </article>
  );
}
