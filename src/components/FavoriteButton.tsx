import { Icon } from './Icon';
import { useApp } from '../store/AppStore';

export interface FavoriteButtonProps {
  recipeId: string;
  recipeName: string;
  /** Variante compacta para cabeceras de detalle. */
  variant?: 'chip' | 'button';
}

/** Marca la receta como favorita. El estado se guarda en este navegador. */
export function FavoriteButton({ recipeId, recipeName, variant = 'chip' }: FavoriteButtonProps) {
  const { favorites, dispatch } = useApp();
  const active = favorites.includes(recipeId);
  const label = active
    ? `Quitar ${recipeName} de favoritos`
    : `Guardar ${recipeName} en favoritos`;

  return (
    <button
      type="button"
      className={variant === 'button' ? 'btn btn--outline btn--sm' : 'chip'}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => dispatch({ type: 'toggleFavorite', id: recipeId })}
    >
      <Icon name="star" size={variant === 'button' ? 16 : 15} filled={active} />
      {variant === 'button' ? (active ? 'En favoritos' : 'Añadir a favoritos') : null}
    </button>
  );
}
