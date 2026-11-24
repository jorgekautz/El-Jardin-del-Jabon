import { useEffect } from 'react';

/** Título y descripción por ruta: base de SEO y de la pestaña del navegador. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (!description) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [title, description]);
}
