import { SAFETY_NOTES } from '../data/seed';
import { Icon } from './Icon';

/**
 * Advertencias de responsabilidad.
 * Son recomendaciones generales del sitio, separadas de los datos del archivo:
 * no se presentan como información documentada ni como indicación médica.
 */
export function SafetyPanel({
  title = 'Antes de elaborar',
  recipeWarnings = [],
}: {
  title?: string;
  recipeWarnings?: string[];
}) {
  return (
    <section className="notice notice--accent" aria-labelledby="seguridad-titulo">
      <p className="notice__title" id="seguridad-titulo">
        <Icon name="warning" size={15} />
        {title}
      </p>
      <ul className="stack-xs">
        {recipeWarnings.map((warning) => (
          <li key={warning} style={{ fontWeight: 600 }}>
            {warning}
          </li>
        ))}
        {SAFETY_NOTES.map((note) => (
          <li key={note} className="card__text">
            {note}
          </li>
        ))}
      </ul>
      <p className="meta">
        Recomendaciones generales del sitio. No sustituyen la ficha técnica del proveedor de cada
        ingrediente.
      </p>
    </section>
  );
}
