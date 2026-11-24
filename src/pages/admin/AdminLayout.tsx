import { Link, Outlet } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Notice } from '../../components/ui/primitives';
import { useApp } from '../../store/AppStore';

/**
 * Armazón del panel de administración.
 *
 * Decisión de seguridad: no hay autenticación simulada en el cliente.
 * El panel edita datos que viven en el navegador del usuario; cualquier
 * publicación multiusuario exige autenticación y validación en el servidor.
 */
export function AdminLayout() {
  const { recipes, ingredients, storageLabel } = useApp();

  return (
    <div className="page section--tight admin-shell">
      <header className="stack-xs">
        <span className="label">Zona de contenido</span>
        <h1>Administración</h1>
        <p className="lead">
          Crear, editar y completar recetas e ingredientes. Los cambios se guardan en este navegador.
        </p>
      </header>

      <Notice tone="deep" title="Cómo funciona el acceso" icon="warning">
        <p>
          No hay contraseña en el sitio. Una clave guardada en JavaScript o en LocalStorage no es
          seguridad: cualquiera la lee en el navegador. Este panel está pensado para un sitio local o
          de un solo editor. Para publicar el contenido en un servidor, la autenticación, la
          validación y el guardado deben vivir en el backend.
        </p>
      </Notice>

      <nav className="admin-bar" aria-label="Secciones de administración">
        <div className="row">
          <Link to="/administracion" className="chip">
            <Icon name="layers" size={15} />
            Resumen
          </Link>
          <Link to="/administracion/recetas/nueva" className="chip">
            <Icon name="plus" size={15} />
            Nueva receta
          </Link>
          <Link to="/administracion/ingredientes/nuevo" className="chip">
            <Icon name="plus" size={15} />
            Nuevo ingrediente
          </Link>
        </div>
        <p className="meta">
          {recipes.length} recetas · {ingredients.length} ingredientes · {storageLabel}
        </p>
      </nav>

      <Outlet />
    </div>
  );
}
