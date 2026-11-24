import { useState } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useApp } from '../store/AppStore';
import { useToast } from '../store/toasts';
import { createShoppingDraft } from '../store/factory';
import { Icon } from '../components/Icon';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Badge, Meter, Notice, SectionHead } from '../components/ui/primitives';

export function ShoppingPage() {
  useDocumentMeta(
    'Lista de compras · El Jardín del Jabón',
    'Lista de compra interactiva para empezar a elaborar jabones artesanales. Las casillas se guardan en el navegador.',
  );

  const { shopping, dispatch, storageLabel } = useApp();
  const { notify } = useToast();

  const [draft, setDraft] = useState({ label: '', quantity: '', detail: '' });
  const [error, setError] = useState<string | null>(null);

  const checked = shopping.filter((item) => item.checked).length;
  const ratio = shopping.length === 0 ? 0 : checked / shopping.length;

  const addItem = () => {
    const label = draft.label.trim();
    if (label.length < 2) {
      setError('Escribe el nombre del producto (al menos 2 caracteres).');
      return;
    }
    if (shopping.some((item) => item.label.trim().toLowerCase() === label.toLowerCase())) {
      setError('Ese producto ya está en la lista.');
      return;
    }
    dispatch({
      type: 'addShopping',
      item: {
        ...createShoppingDraft(),
        label,
        quantity: draft.quantity.trim(),
        detail: draft.detail.trim(),
      },
    });
    setDraft({ label: '', quantity: '', detail: '' });
    setError(null);
    notify('Producto añadido a la lista.');
  };

  return (
    <div className="page section--tight">
      <SectionHead
        eyebrow="Kit de arranque"
        title="Lista de compras"
        description="La lista mínima que describe el archivo, con casillas para marcar lo que ya tienes."
        action={
          <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
            Imprimir lista
          </Button>
        }
      />

      <div className="row row--between" style={{ marginBottom: 'var(--space-m)' }}>
        <Meter
          ratio={ratio}
          caption={`${checked} de ${shopping.length} productos adquiridos`}
        />
        {checked > 0 ? (
          <Button
            variant="quiet"
            size="sm"
            onClick={() => {
              shopping
                .filter((item) => item.checked)
                .forEach((item) => dispatch({ type: 'toggleShopping', id: item.id }));
              notify('Casillas desmarcadas.');
            }}
          >
            Desmarcar todo
          </Button>
        ) : null}
      </div>

      <ul className="checklist">
        {shopping.map((item) => (
          <li className="checklist__item" key={item.id} data-checked={item.checked}>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => dispatch({ type: 'toggleShopping', id: item.id })}
                aria-label={`Marcar ${item.label} como adquirido`}
              />
              <span className="sr-only">{item.label}</span>
            </label>
            <span className="checklist__label">
              {item.label}
              {item.detail ? <span className="checklist__detail">{item.detail}</span> : null}
            </span>
            <span className="row" style={{ gap: 'var(--space-2xs)' }}>
              <span className="checklist__qty">{item.quantity || '—'}</span>
              <button
                type="button"
                className="btn btn--quiet btn--sm no-print"
                onClick={() => {
                  dispatch({ type: 'removeShopping', id: item.id });
                  notify(`«${item.label}» quitado de la lista.`);
                }}
                aria-label={`Quitar ${item.label} de la lista`}
                title={`Quitar ${item.label} de la lista`}
              >
                <Icon name="trash" size={15} />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {shopping.length === 0 ? (
        <div style={{ marginTop: 'var(--space-m)' }}>
          <Notice tone="pending" title="La lista está vacía" icon="warning">
            <p className="card__text">
              Puedes restaurar la lista original del archivo desde la administración.
            </p>
            <Button to="/administracion" variant="outline" size="sm">
              Ir a administración
            </Button>
          </Notice>
        </div>
      ) : null}

      <section className="filters no-print" style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="anadir-producto">
        <div className="stack-s">
          <div className="stack-xs">
            <span className="label">Añadir</span>
            <h2 id="anadir-producto">Productos propios</h2>
            <p className="meta">
              Molde extra, aromas nuevos, colorantes específicos: lo que añadas se guarda igual que
              la lista del archivo.
            </p>
          </div>

          <div className="form-grid">
            <Field
              label="Producto"
              required
              value={draft.label}
              onChange={(value) => {
                setDraft((current) => ({ ...current, label: value }));
                if (error) setError(null);
              }}
              placeholder="Molde de madera"
              error={error ?? undefined}
            />
            <Field
              label="Cantidad"
              value={draft.quantity}
              onChange={(value) => setDraft((current) => ({ ...current, quantity: value }))}
              placeholder="2"
            />
            <Field
              label="Nota"
              value={draft.detail}
              onChange={(value) => setDraft((current) => ({ ...current, detail: value }))}
              placeholder="Para la tanda de avena"
            />
          </div>

          <div className="row row--between">
            <Button icon="plus" onClick={addItem}>
              Añadir a la lista
            </Button>
            <p className="meta">{storageLabel}</p>
          </div>
        </div>
      </section>

      <p className="meta" style={{ marginTop: 'var(--space-l)' }}>
        <Badge>Guardado local</Badge> Favoritos y lista de compras viven en este navegador: no se
        envían a ningún servidor.
      </p>
    </div>
  );
}
