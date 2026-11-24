import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <ScrollToTop />
      <SiteHeader />
      <main id="contenido">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
