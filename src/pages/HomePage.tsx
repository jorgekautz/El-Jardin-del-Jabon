import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useApp } from '../store/AppStore';
import { CATEGORIES } from '../data/seed';
import { CATEGORY_LABELS } from '../domain/types';
import { resolveSectionPhoto } from '../assets/photos';
import { Icon } from '../components/Icon';
import { RecipeCard } from '../components/RecipeCard';
import { IngredientCard } from '../components/IngredientCard';
import { SmartImage } from '../components/SmartImage';
import { SearchBox } from '../components/SearchBox';
import { Button } from '../components/ui/Button';
import { Badge, SectionHead } from '../components/ui/primitives';

export function HomePage() {
  useDocumentMeta(
    'El Jardín del Jabón · Recetas de jabones artesanales',
    'Descubre el arte de crear tus propios jabones naturales: recetas documentadas, ingredientes, utensilios y lista de compras.',
  );

  const { recipes, ingredients } = useApp();
  const featured = recipes.filter((recipe) => recipe.featured).slice(0, 3);
  const showcaseIngredients = ingredients
    .filter((ingredient) => ingredient.category === 'complementarios' || ingredient.category === 'aceites')
    .slice(0, 8);
  const heroPhoto = resolveSectionPhoto('hero');
  const botanicalsPhoto = resolveSectionPhoto('botanicals');

  return (
    <>
      {/* --- Portada ------------------------------------------------------- */}
      <section className="hero">
        <div className="page split">
          <div className="stack">
            <div className="stack-xs">
              <span className="label">Biblioteca de jabones artesanales</span>
              <h1 className="hero__title">
                El Jardín del&nbsp;Jabón
              </h1>
              <p className="hero__phrase">
                Descubre el arte de crear tus propios jabones naturales.
              </p>
            </div>

            <form
              className="searchbox"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <SearchBox id="buscador-portada" placeholder="Buscar por nombre o ingrediente" />
              <Button to="/recetas" size="md">
                Explorar recetas
              </Button>
            </form>

            <dl className="hero__stats">
              <div>
                <dt className="label">Recetas</dt>
                <dd className="stat__value" style={{ margin: 0 }}>
                  {recipes.length}
                </dd>
              </div>
              <div>
                <dt className="label">Ingredientes</dt>
                <dd className="stat__value" style={{ margin: 0 }}>
                  {ingredients.length}
                </dd>
              </div>
              <div>
                <dt className="label">Categorías</dt>
                <dd className="stat__value" style={{ margin: 0 }}>
                  {CATEGORIES.length}
                </dd>
              </div>
            </dl>
          </div>

          <div className="hero__media">
            <SmartImage
              photo={heroPhoto}
              seed="jabon"
              motif="bar"
              eager
              alt="Jabones artesanales elaborados a mano"
              pendingLabel={heroPhoto ? undefined : 'Fotografía de portada pendiente'}
            />
          </div>
        </div>
      </section>

      {/* --- Destacadas ---------------------------------------------------- */}
      <section className="page section--tight" aria-labelledby="destacadas">
        <SectionHead
          eyebrow="Selección del sitio"
          title="Recetas destacadas"
          description="Las recetas que el archivo describe como punto de partida y las más vendibles."
          action={
            <Button to="/recetas" variant="quiet" iconRight="arrowRight">
              Ver todas
            </Button>
          }
        />
        <div className="grid-cards">
          {featured.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* --- Categorías ---------------------------------------------------- */}
      <section className="page section--tight" aria-labelledby="categorias">
        <SectionHead
          eyebrow="Navegar por tipo"
          title="Categorías de jabones"
          description="Cada categoría agrupa las recetas por su finalidad. Las etiquetas son del sitio; las propiedades, del archivo."
        />
        <div className="grid-two">
          {CATEGORIES.map((category) => {
            const count = recipes.filter((recipe) => recipe.category === category.id).length;
            return (
              <article className="card" key={category.id}>
                <div className="card__body">
                  <div className="row row--between">
                    <h3>{category.label}</h3>
                    <Badge tone={count > 0 ? 'accent' : 'neutral'}>
                      {count} {count === 1 ? 'receta' : 'recetas'}
                    </Badge>
                  </div>
                  <p className="card__text">{category.blurb}</p>
                  <p>
                    <Link
                      to={`/recetas?categoria=${category.id}`}
                      className="row"
                      style={{ gap: 'var(--space-2xs)', textDecoration: 'none' }}
                    >
                      <Icon name="layers" size={15} />
                      Ver {CATEGORY_LABELS[category.id].toLowerCase()}
                    </Link>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* --- Ingredientes (banda oscura) ------------------------------------ */}
      <section className="band" aria-labelledby="ingredientes-portada">
        <div className="page stack">
          <SectionHead
            eyebrow="Materia prima"
            title="Ingredientes naturales"
            description="Bases, aceites, aromas y complementos con la propiedad que les atribuye el archivo."
            action={
              <Button to="/ingredientes" variant="outline" style={{ borderColor: 'var(--on-deep-2)', color: 'var(--on-deep)' }}>
                Biblioteca completa
              </Button>
            }
          />
          <div className="grid-cards">
            {showcaseIngredients.map((ingredient) => (
              <IngredientCard key={ingredient.id} ingredient={ingredient} recipes={recipes} />
            ))}
          </div>
          <div className="band__note">
            <p className="card__text">
              El archivo documenta la función de cada ingrediente. Cuando no la describe, la ficha
              lo indica en lugar de atribuirle propiedades.
            </p>
            <SmartImage
              photo={botanicalsPhoto}
              seed="arcilla"
              motif="clay"
              alt="Ingredientes naturales sobre lienzo"
              pendingLabel={botanicalsPhoto ? undefined : 'Fotografía pendiente'}
            />
          </div>
        </div>
      </section>

      {/* --- Acceso rápido -------------------------------------------------- */}
      <section className="page section--tight" aria-labelledby="acceso">
        <SectionHead
          eyebrow="Todas las recetas"
          title="Acceso directo"
          description="Las seis recetas del archivo original, en orden alfabético."
        />
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Listado de todas las recetas</caption>
            <thead>
              <tr>
                <th scope="col">Receta</th>
                <th scope="col">Categoría</th>
                <th scope="col">Ingrediente principal</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[...recipes]
                .sort((a, b) => a.name.localeCompare(b.name, 'es'))
                .map((recipe) => (
                  <tr key={recipe.id}>
                    <th scope="row" style={{ fontWeight: 600 }}>
                      <Link to={`/recetas/${recipe.slug}`}>{recipe.name}</Link>
                    </th>
                    <td data-label="Categoría">{CATEGORY_LABELS[recipe.category]}</td>
                    <td data-label="Ingrediente principal">{recipe.mainIngredient}</td>
                    <td data-label="Estado">
                      {recipe.steps.length > 0 ? (
                        <Badge tone="accent">Pasos documentados</Badge>
                      ) : (
                        <Badge tone="pending">Pasos pendientes</Badge>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Utensilios y compras ------------------------------------------- */}
      <section className="page section--tight" aria-labelledby="kit">
        <div className="grid-two">
          <article className="card">
            <div className="card__media">
              <SmartImage
                photo={resolveSectionPhoto('tools')}
                seed="molde"
                motif="mold"
                alt="Utensilios básicos de elaboración"
                pendingLabel={resolveSectionPhoto('tools') ? undefined : 'Fotografía pendiente'}
              />
            </div>
            <div className="card__body">
              <h3>Herramientas y materiales</h3>
              <p className="card__text">
                Molde, recipiente, espátula, fuente de calor y alcohol en spray: lo mínimo para
                trabajar la glicerina.
              </p>
              <Button to="/utensilios" variant="outline" size="sm" iconRight="arrowRight">
                Ver utensilios
              </Button>
            </div>
          </article>

          <article className="card">
            <div className="card__body">
              <h3>Lista de compras</h3>
              <p className="card__text">
                El kit de arranque descrito en el archivo, con casillas para marcar lo que ya tienes.
              </p>
              <Button to="/compras" variant="outline" size="sm" icon="cart" iconRight="arrowRight">
                Abrir la lista
              </Button>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
