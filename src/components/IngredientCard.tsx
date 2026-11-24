import { Link } from 'react-router-dom';
import { INGREDIENT_CATEGORY_LABELS, type Ingredient, type Recipe } from '../domain/types';
import { recipesUsingIngredient } from '../domain/search';
import { BotanicalPlate } from './BotanicalPlate';
import { Badge } from './ui/primitives';

export function IngredientCard({
  ingredient,
  recipes,
}: {
  ingredient: Ingredient;
  recipes: Recipe[];
}) {
  const usedIn = recipesUsingIngredient(recipes, ingredient);

  return (
    <article className="card">
      <div className="card__media">
        <BotanicalPlate seed={ingredient.name} label={ingredient.name} />
      </div>

      <div className="card__body">
        <div className="row">
          <Badge>{INGREDIENT_CATEGORY_LABELS[ingredient.category]}</Badge>
          {ingredient.property.trim() ? null : <Badge tone="pending">Propiedad pendiente</Badge>}
        </div>

        <h3 className="card__title">
          <Link to={`/ingredientes/${ingredient.slug}`}>{ingredient.name}</Link>
        </h3>

        <p className="card__text">
          {ingredient.property.trim() || 'Propiedad pendiente de completar.'}
        </p>

        <p className="meta">
          {usedIn.length === 0
            ? 'Sin recetas documentadas que lo incluyan'
            : usedIn.length === 1
              ? `Aparece en ${usedIn[0]?.name}`
              : `Aparece en ${usedIn.length} recetas`}
        </p>
      </div>
    </article>
  );
}
