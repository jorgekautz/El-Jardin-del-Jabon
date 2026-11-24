import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useApp } from '../store/AppStore';
import { globalSearch } from '../domain/search';

export interface SearchBoxProps {
  id: string;
  placeholder?: string;
  autoFocus?: boolean;
  /** Envía la consulta al catálogo en lugar de abrir una sugerencia. */
  goOnSubmit?: boolean;
}

/**
 * Buscador global con sugerencias: recetas e ingredientes, navegación por flechas
 * y Enter para abrir la sugerencia activa.
 */
export function SearchBox({ id, placeholder = 'Buscar receta o ingrediente', autoFocus }: SearchBoxProps) {
  const { recipes, ingredients } = useApp();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => globalSearch(recipes, ingredients, value), [recipes, ingredients, value]);

  useEffect(() => {
    setActive(0);
  }, [value]);

  useEffect(() => {
    const onDocDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const go = (index: number) => {
    const hit = hits[index];
    setOpen(false);
    if (!hit) {
      navigate(`/recetas?q=${encodeURIComponent(value.trim())}`);
      return;
    }
    navigate(hit.type === 'receta' ? `/recetas/${hit.slug}` : `/ingredientes/${hit.slug}`);
    setValue('');
  };

  const listId = `${id}-sugerencias`;

  return (
    <div className="searchbox__input" ref={wrapRef}>
      <span className="searchbox__icon">
        <Icon name="search" size={18} />
      </span>
      <input
        id={id}
        className="input"
        type="search"
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Buscar recetas e ingredientes"
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActive((current) => Math.min(current + 1, Math.max(hits.length - 1, 0)));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((current) => Math.max(current - 1, 0));
          } else if (event.key === 'Enter') {
            event.preventDefault();
            go(value.trim() ? active : 0);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />

      {open && value.trim() ? (
        <ul className="suggest" id={listId} role="listbox" aria-label="Sugerencias de búsqueda">
          {hits.length === 0 ? (
            <li className="suggest__item">
              <span className="meta" style={{ padding: 'var(--space-2xs) var(--space-xs)' }}>
                Sin coincidencias para «{value.trim()}».
              </span>
            </li>
          ) : (
            hits.map((hit, index) => (
              <li className="suggest__item" role="option" key={hit.id} aria-selected={index === active}>
                <button
                  type="button"
                  data-active={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(index)}
                >
                  <span className="suggest__type">{hit.type}</span>
                  <span>
                    <strong>{hit.title}</strong>
                    {hit.subtitle ? <span className="meta"> — {hit.subtitle}</span> : null}
                  </span>
                </button>
              </li>
            ))
          )}
          <li className="suggest__item">
            <button
              type="button"
              data-active={false}
              onClick={() => {
                setOpen(false);
                navigate(`/recetas?q=${encodeURIComponent(value.trim())}`);
              }}
            >
              <span className="suggest__type">catálogo</span>
              <span>Ver todos los resultados de «{value.trim()}»</span>
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
