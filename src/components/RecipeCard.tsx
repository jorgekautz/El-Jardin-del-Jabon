import { Link } from 'react-router-dom';
import { CATEGORY_LABELS, type Recipe } from '../domain/types';
import { hasPendingInfo } from '../domain/completeness';
import { resolveRecipePhoto } from '../assets/photos';
import { FavoriteButton } from './FavoriteButton';
import { Icon } from './Icon';
import { SmartImage } from './SmartImage';
import { Badge } from './ui/primitives';
import { Button } from './ui/Button';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const photo = resolveRecipePhoto(recipe.image || recipe.slug);
  const pending = hasPendingInfo(recipe);

  return (
    <article className="card">
      <div className="card__media">
        <SmartImage
          photo={photo}
          seed={recipe.name}
          alt={`Ilustración de ${recipe.name}`}
          pendingLabel={photo ? undefined : 'Fotografía pendiente'}
        />
      </div>

      <div className="card__body">
        <div className="row">
          <Badge tone="accent">{CATEGORY_LABELS[recipe.category]}</Badge>
          {pending ? <Badge tone="pending">Datos pendientes</Badge> : null}
        </div>

        <h3 className="card__title">
          <Link to={`/recetas/${recipe.slug}`}>{recipe.name}</Link>
        </h3>

        <p className="card__text">
          {recipe.tagline.trim() || 'Descripción pendiente de completar.'}
        </p>

        <p className="meta">
          <span className="label">Ingrediente principal</span>
          <br />
          {recipe.mainIngredient || 'Pendiente'}
        </p>

        <p className="meta row" style={{ gap: 'var(--space-2xs)' }}>
          <Icon name="clock" size={14} />
          {recipe.timeLabel ? `Elaboración: ${recipe.timeLabel}` : 'Tiempo pendiente de completar'}
        </p>
      </div>

      <div className="card__foot">
        <Button to={`/recetas/${recipe.slug}`} variant="outline" size="sm" iconRight="arrowRight">
          Ver receta
        </Button>
        <FavoriteButton recipeId={recipe.id} recipeName={recipe.name} />
      </div>
    </article>
  );
}
