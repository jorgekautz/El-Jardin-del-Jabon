import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/Icon';

export function NotFoundPage() {
  useDocumentMeta(
    'Página no encontrada · El Jardín del Jabón',
    'La página solicitada no existe en la biblioteca de recetas de jabón artesanal.',
  );

  return (
    <div className="page section">
      <div className="stack">
        <span className="label">
          <Icon name="close" size={14} />
          Enlace roto
        </span>
        <h1>Esta página no está en la biblioteca</h1>
        <p className="lead">
          Puede que la receta se haya eliminado desde la administración, o que el enlace esté mal
          escrito. El catálogo sigue disponible.
        </p>

        <div className="row">
          <Button to="/" icon="arrowLeft">
            Portada
          </Button>
          <Button to="/recetas" variant="outline" icon="search">
            Ver las recetas
          </Button>
          <Button to="/ingredientes" variant="quiet">
            Ver los ingredientes
          </Button>
        </div>

        <p className="meta">
          ¿Buscas una receta concreta? Empieza por{' '}
          <Link to="/recetas">la búsqueda del catálogo</Link>.
        </p>
      </div>
    </div>
  );
}
