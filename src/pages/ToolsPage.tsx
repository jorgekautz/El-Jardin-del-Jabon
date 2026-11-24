import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { SEED_TOOLS } from '../data/seed';
import { resolveSectionPhoto } from '../assets/photos';
import { motifFromName } from '../components/BotanicalPlate';
import { SmartImage } from '../components/SmartImage';
import { Button } from '../components/ui/Button';
import { Badge, SectionHead, SourceBadge } from '../components/ui/primitives';
import { useApp } from '../store/AppStore';

export function ToolsPage() {
  useDocumentMeta(
    'Herramientas y materiales · El Jardín del Jabón',
    'Utensilios básicos para trabajar la glicerina y la lista de compra mínima descrita en el archivo.',
  );

  const { shopping } = useApp();
  const bought = shopping.filter((item) => item.checked).length;
  const photo = resolveSectionPhoto('tools');

  return (
    <div className="page section--tight">
      <SectionHead
        eyebrow="Kit mínimo"
        title="Herramientas y materiales"
        description="Los utensilios que el archivo enumera como herramientas básicas, más la lista de compra realista."
        action={
          <Button to="/compras" variant="outline" size="sm" icon="cart">
            Lista de compras
          </Button>
        }
      />

      <div className="split" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stack-s">
          <p className="lead">
            Para el método de derretir y verter hacen falta cinco cosas. Todo lo demás es
            comodidad, no necesidad.
          </p>
          <p className="meta">
            El archivo describe el uso del alcohol en spray; para el resto de utensilios no
            documenta indicaciones, y así se muestra.
          </p>
        </div>
        <div className="detail-media" style={{ aspectRatio: '4 / 3' }}>
          <SmartImage
            photo={photo}
            seed="molde"
            motif="mold"
            alt="Utensilios básicos sobre lienzo"
            pendingLabel={photo ? undefined : 'Fotografía pendiente'}
          />
        </div>
      </div>

      <div className="grid-cards">
        {SEED_TOOLS.map((tool) => (
          <article className="card" key={tool.id}>
            <div className="card__media">
              <SmartImage
                photo={null}
                seed={tool.name}
                motif={motifFromName(tool.name)}
                alt={`Ilustración de ${tool.name}`}
              />
            </div>
            <div className="card__body">
              <h3>{tool.name}</h3>
              <p className="card__text">
                {tool.use || 'Uso pendiente de completar: el archivo no describe este utensilio.'}
              </p>
              <div className="row">
                <SourceBadge source={tool.useSource} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <section style={{ marginTop: 'var(--space-xl)' }} aria-labelledby="compra-resumen">
        <div className="section-head row row--between">
          <div className="stack-xs">
            <span className="label">Lista de compra básica</span>
            <h2 id="compra-resumen">Lo que hay que comprar para empezar</h2>
          </div>
          <Badge tone={bought === shopping.length ? 'accent' : 'pending'}>
            {bought} de {shopping.length} adquiridos
          </Badge>
        </div>

        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Lista de compra básica del archivo</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Nota</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {shopping.map((item) => (
                <tr key={item.id}>
                  <th scope="row" style={{ fontWeight: 600 }}>
                    {item.label}
                  </th>
                  <td className="quantity" data-label="Cantidad">
                    {item.quantity || '—'}
                  </td>
                  <td data-label="Nota">{item.detail}</td>
                  <td data-label="Estado">
                    {item.checked ? (
                      <Badge tone="accent" icon="check">
                        Adquirido
                      </Badge>
                    ) : (
                      <Badge>Por adquirir</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="meta" style={{ marginTop: 'var(--space-s)' }}>
          Las casillas se guardan en este navegador. Marca y desmarca desde la{' '}
          <Link to="/compras">lista interactiva</Link>.
        </p>
      </section>
    </div>
  );
}
