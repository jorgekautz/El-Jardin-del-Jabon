import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useApp } from '../store/AppStore';
import { RecipeCard } from '../components/RecipeCard';
import { Button } from '../components/ui/Button';
import { EmptyState, SectionHead } from '../components/ui/primitives';

export function FavoritesPage() {
  useDocumentMeta(
    'Recetas favoritas · El Jardín del Jabón',
    'Tu selección de recetas de jabón artesanal, guardada en este navegador.',
  );

  const { recipes, favorites } = useApp();
  const saved = recipes.filter((recipe) => favorites.includes(recipe.id));

  return (
    <div className="page section--tight">
      <SectionHead
        eyebrow="Tu selección"
        title="Recetas favoritas"
        description="Marca una receta con la estrella desde cualquier pantalla para tenerla aquí."
        action={
          <Button to="/recetas" variant="outline" size="sm" icon="search">
            Buscar recetas
          </Button>
        }
      />

      {saved.length === 0 ? (
        <EmptyState
          icon="star"
          title="Todavía no hay favoritas"
          description="Las recetas que marques con la estrella aparecerán aquí. La selección se guarda en este navegador."
          action={
            <Button to="/recetas" size="sm">
              Explorar el catálogo
            </Button>
          }
        />
      ) : (
        <>
          <p className="meta" style={{ marginBottom: 'var(--space-m)' }}>
            {saved.length} {saved.length === 1 ? 'receta guardada' : 'recetas guardadas'}
          </p>
          <div className="grid-cards">
            {saved.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
