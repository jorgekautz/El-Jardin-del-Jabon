import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { SearchBox } from './SearchBox';
import { useApp } from '../store/AppStore';

const LINKS = [
  { to: '/recetas', label: 'Recetas' },
  { to: '/ingredientes', label: 'Ingredientes' },
  { to: '/utensilios', label: 'Utensilios' },
  { to: '/compras', label: 'Lista de compras' },
  { to: '/favoritos', label: 'Favoritos' },
  { to: '/administracion', label: 'Administración' },
];

export function SiteHeader() {
  const { favorites } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <NavLink to="/" className="wordmark">
          <Icon name="leaf" size={20} className="wordmark__mark" />
          El Jardín del Jabón
        </NavLink>

        <div className="site-header__search">
          <SearchBox id="busqueda-cabecera" placeholder="Buscar receta o ingrediente" />
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="navegacion-principal"
          onClick={() => setOpen((current) => !current)}
        >
          <Icon name={open ? 'close' : 'menu'} size={18} />
          Menú
        </button>

        <nav className="site-nav" id="navegacion-principal" data-open={open} aria-label="Principal">
          <div className="site-nav__search">
            <SearchBox id="busqueda-menu" placeholder="Buscar receta o ingrediente" />
          </div>
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="site-nav__link">
              {({ isActive }) => (
                <>
                  {link.label}
                  {link.to === '/favoritos' && favorites.length > 0 ? (
                    <span className="badge badge--accent" style={{ marginLeft: '0.4rem' }}>
                      {favorites.length}
                    </span>
                  ) : null}
                  {isActive ? <span className="sr-only"> (sección actual)</span> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
