import { Link } from 'react-router-dom';
import { SAFETY_NOTES } from '../data/seed';
import { useApp } from '../store/AppStore';

export function SiteFooter() {
  const { recipes, ingredients, storageLabel } = useApp();

  return (
    <footer className="site-footer">
      <div className="page">
        <div className="site-footer__grid">
          <div className="stack-xs">
            <span className="label">El Jardín del Jabón</span>
            <p className="site-footer__note">
              Biblioteca de recetas de jabones artesanales. El contenido procede del archivo
              original de recetas; los huecos se muestran como información pendiente.
            </p>
          </div>

          <nav aria-label="Secciones">
            <span className="label">Secciones</span>
            <ul className="stack-xs">
              <li>
                <Link to="/recetas">Catálogo de recetas</Link>
              </li>
              <li>
                <Link to="/ingredientes">Biblioteca de ingredientes</Link>
              </li>
              <li>
                <Link to="/utensilios">Herramientas y materiales</Link>
              </li>
              <li>
                <Link to="/compras">Lista de compras</Link>
              </li>
              <li>
                <Link to="/favoritos">Favoritos</Link>
              </li>
            </ul>
          </nav>

          <div className="stack-xs">
            <span className="label">Contenido</span>
            <p className="site-footer__note">
              {recipes.length} recetas · {ingredients.length} ingredientes documentados
            </p>
            <p className="site-footer__note">{storageLabel}</p>
          </div>

          <div className="stack-xs">
            <span className="label">Antes de empezar</span>
            <p className="site-footer__note">{SAFETY_NOTES[0]}</p>
            <p className="site-footer__note">{SAFETY_NOTES[1]}</p>
          </div>
        </div>

        <hr className="site-footer__rule" />

        <p className="site-footer__note">
          Uso cosmético. Estas recetas no son tratamientos médicos y no garantizan tolerancia en
          todos los tipos de piel.
        </p>
      </div>
    </footer>
  );
}
