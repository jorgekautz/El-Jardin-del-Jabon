import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useApp } from '../../store/AppStore';
import { useToast } from '../../store/toasts';
import { createIngredientDraft, nowIso, uniqueSlug } from '../../store/factory';
import { INGREDIENT_CATEGORY_LABELS, type Ingredient, type IngredientCategory, type SourceKind } from '../../domain/types';
import { recipesUsingIngredient } from '../../domain/search';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Badge, Notice, SectionHead } from '../../components/ui/primitives';

const CATEGORY_OPTIONS = (Object.keys(INGREDIENT_CATEGORY_LABELS) as IngredientCategory[])
  .filter((key) => key !== 'utensilios')
  .map((key) => ({ value: key, label: INGREDIENT_CATEGORY_LABELS[key] }));

const SOURCE_OPTIONS: { value: SourceKind; label: string }[] = [
  { value: 'documentado', label: 'Documentado en recetas.txt' },
  { value: 'editorial', label: 'Clasificación del sitio' },
  { value: 'pendiente', label: 'Pendiente de completar' },
];

/** Editor de fichas de ingrediente: alta, edición y borrado con control de procedencia. */
export function IngredientEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const { ingredients, recipes, dispatch } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  const existing = useMemo(
    () => (id ? ingredients.find((item) => item.id === id) : undefined),
    [id, ingredients],
  );

  const [draft, setDraft] = useState<Ingredient>(() => existing ?? createIngredientDraft());
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useDocumentMeta(
    isNew
      ? 'Nuevo ingrediente · Administración · El Jardín del Jabón'
      : `Editar ${existing?.name ?? 'ingrediente'}`,
    'Crear o completar una ficha de ingrediente.',
  );

  if (id && !existing) {
    return (
      <div className="stack">
        <h2>Ingrediente no encontrado</h2>
        <p className="lead">El identificador «{id}» no existe en este navegador.</p>
        <div className="row">
          <Button to="/administracion" variant="outline" icon="arrowLeft">
            Volver al resumen
          </Button>
        </div>
      </div>
    );
  }

  const patch = (changes: Partial<Ingredient>) => setDraft((current) => ({ ...current, ...changes }));

  const save = () => {
    const name = draft.name.trim();
    if (name.length < 2) {
      setNameError('Escribe un nombre de al menos 2 caracteres.');
      notify('Revisa el nombre del ingrediente.');
      return;
    }

    const ingredient: Ingredient = {
      ...draft,
      name,
      slug: uniqueSlug(
        draft.slug || name,
        ingredients.map((item) => item.slug),
        draft.slug,
      ),
      property: draft.property.trim(),
      family: draft.family?.trim() ? draft.family.trim() : undefined,
      caution: draft.caution?.trim() ? draft.caution.trim() : undefined,
      updatedAt: nowIso(),
    };

    dispatch({ type: 'upsertIngredient', ingredient });
    notify(isNew ? 'Ingrediente creado.' : 'Cambios guardados.');
    navigate(`/ingredientes/${ingredient.slug}`);
  };

  const usedIn = existing ? recipesUsingIngredient(recipes, existing) : [];

  return (
    <>
      <SectionHead
        eyebrow={isNew ? 'Creación' : 'Edición'}
        title={isNew ? 'Nuevo ingrediente' : draft.name || 'Ingrediente sin nombre'}
        description="La propiedad describe lo que dice el archivo. Si el archivo no lo dice, déjala vacía: la ficha se marcará como pendiente."
        action={
          <Badge tone={draft.property.trim() ? 'accent' : 'pending'}>
            {draft.property.trim() ? 'Propiedad definida' : 'Propiedad pendiente'}
          </Badge>
        }
      />

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        aria-label="Formulario de ingrediente"
      >
        <section className="filters" aria-labelledby="ficha-datos">
          <h2 id="ficha-datos" className="label">
            Ficha
          </h2>
          <div className="form-grid">
            <Field
              label="Nombre"
              required
              value={draft.name}
              onChange={(value) => {
                patch({ name: value });
                if (nameError) setNameError(null);
              }}
              error={nameError ?? undefined}
              placeholder="Manteca de karité"
            />
            <Field
              label="Categoría"
              kind="select"
              value={draft.category}
              onChange={(value) => patch({ category: value as IngredientCategory })}
              options={CATEGORY_OPTIONS}
            />
            <Field
              label="Familia o variante"
              value={draft.family ?? ''}
              onChange={(value) => patch({ family: value })}
              placeholder="Base de glicerina"
              hint="Agrupa fichas hermanas: base transparente, base de leche…"
            />
            <Field
              label="Enlace (slug)"
              value={draft.slug}
              onChange={(value) => patch({ slug: value })}
              placeholder="se calcula desde el nombre"
            />
          </div>

          <Field
            label="Propiedad o función"
            kind="textarea"
            rows={3}
            value={draft.property}
            onChange={(value) =>
              patch({
                property: value,
                propertySource: value.trim() ? draft.propertySource : 'pendiente',
              })
            }
            placeholder="Suaviza y calma la piel seca"
            hint="Escribe solo lo que aporta una fuente. Los textos vacíos se muestran como información pendiente."
          />

          <div className="form-grid">
            <Field
              label="Procedencia de la propiedad"
              kind="select"
              value={draft.propertySource}
              onChange={(value) => patch({ propertySource: value as SourceKind })}
              options={SOURCE_OPTIONS}
            />
            <Field
              label="Nota de seguridad"
              value={draft.caution ?? ''}
              onChange={(value) => patch({ caution: value })}
              placeholder="Puede teñir la piel clara"
              hint="Se muestra junto a la propiedad, destacada como precaución."
            />
          </div>
        </section>

        {existing ? (
          <section className="filters" aria-labelledby="ficha-usos">
            <h2 id="ficha-usos" className="label">
              Impacto de la ficha
            </h2>
            <p className="card__text">
              {usedIn.length === 0
                ? 'Ninguna receta referencia este ingrediente por nombre o enlace.'
                : `Aparece en ${usedIn.length} ${usedIn.length === 1 ? 'receta' : 'recetas'}: ${usedIn
                    .map((recipe) => recipe.name)
                    .join(', ')}.`}
            </p>
            <p className="meta">
              {existing.origin === 'archivo'
                ? 'Ficha transcrita del archivo de recetas.'
                : 'Ficha creada desde la administración.'}
            </p>
          </section>
        ) : null}

        <div className="row row--between">
          <div className="row">
            <Button type="submit" icon="check">
              {isNew ? 'Crear ingrediente' : 'Guardar cambios'}
            </Button>
            <Button to="/administracion" variant="outline" icon="arrowLeft">
              Cancelar
            </Button>
          </div>
          {!isNew ? (
            <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmDelete(true)}>
              Eliminar ficha
            </Button>
          ) : null}
        </div>
      </form>

      {confirmDelete && existing ? (
        <Modal
          title={`Eliminar «${existing.name}»`}
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <p className="meta">La acción no se puede deshacer.</p>
              <div className="row">
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                  Conservar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon="trash"
                  onClick={() => {
                    dispatch({ type: 'deleteIngredient', id: existing.id });
                    setConfirmDelete(false);
                    notify('Ficha eliminada.');
                    navigate('/administracion');
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </>
          }
        >
          <p>
            Las recetas que la enlazan conservan el nombre del ingrediente en su fórmula: solo se
            pierde la ficha y su propiedad documentada.
          </p>
          {usedIn.length > 0 ? (
            <Notice tone="pending" title="Enlaces que quedarán sin ficha" icon="warning">
              <p>
                {usedIn.map((recipe) => recipe.name).join(', ')} seguirán mencionando este
                ingrediente, pero sin enlace a la biblioteca.
              </p>
            </Notice>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
}
