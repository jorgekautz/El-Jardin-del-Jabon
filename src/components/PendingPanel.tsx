import { Link } from 'react-router-dom';
import { pendingFields } from '../domain/completeness';
import type { Recipe } from '../domain/types';
import { Icon } from './Icon';
import { Notice } from './ui/primitives';

/**
 * Muestra los huecos del archivo original en lugar de rellenarlos.
 * Cada hueco enlaza con la pantalla de edición donde completarlo.
 */
export function PendingPanel({ recipe }: { recipe: Recipe }) {
  const pending = pendingFields(recipe);
  if (pending.length === 0) {
    return (
      <Notice tone="accent" title="Receta completa" icon="check">
        <p className="card__text">
          Todos los campos clave tienen dato. Los campos marcados como clasificación editorial son
          etiquetas del sitio, no texto del archivo.
        </p>
      </Notice>
    );
  }

  return (
    <Notice tone="pending" title="Información pendiente de completar" icon="warning">
      <p className="card__text">
        El archivo original no documenta estos datos. El sitio no los inventa: quedan vacíos hasta
        que se completen con una fuente de confianza.
      </p>
      <ul className="pending-list">
        {pending.map((item) => (
          <li key={item.field}>
            <strong>{item.label}</strong>
            <span className="meta">{item.detail}</span>
          </li>
        ))}
      </ul>
      <p>
        <Link to={`/administracion/recetas/${recipe.id}/editar`} className="row" style={{ gap: 'var(--space-2xs)', textDecoration: 'none' }}>
          <Icon name="pencil" size={15} />
          Completar desde la administración
        </Link>
      </p>
    </Notice>
  );
}
