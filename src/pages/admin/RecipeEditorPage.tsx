import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useApp } from '../../store/AppStore';
import { useToast } from '../../store/toasts';
import { createRecipeDraft, emptyIngredientLine, emptyStep, nowIso, uniqueSlug } from '../../store/factory';
import { CATEGORIES, PROPERTY_OPTIONS } from '../../data/seed';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type CategoryId,
  type Difficulty,
  type Recipe,
  type RecipeIngredientLine,
  type SourceKind,
} from '../../domain/types';
import { pendingFields } from '../../domain/completeness';
import { resolveRecipePhoto } from '../../assets/photos';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Badge, Meter, Notice, SectionHead } from '../../components/ui/primitives';

const SOURCE_OPTIONS: { value: SourceKind; label: string }[] = [
  { value: 'documentado', label: 'Documentado en recetas.txt' },
  { value: 'editorial', label: 'Clasificación del sitio' },
  { value: 'pendiente', label: 'Pendiente de completar' },
];

type Errors = Record<string, string>;

/** Editor de receta: creación, edición y borrado, con validación de campos clave. */
export function RecipeEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const { recipes, ingredients, dispatch } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  const existing = useMemo(
    () => (id ? recipes.find((recipe) => recipe.id === id) : undefined),
    [id, recipes],
  );

  const [draft, setDraft] = useState<Recipe>(() => existing ?? createRecipeDraft());
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [touched, setTouched] = useState(false);

  useDocumentMeta(
    isNew ? 'Nueva receta · Administración · El Jardín del Jabón' : `Editar ${existing?.name ?? 'receta'}`,
    'Crear o completar una receta de jabón artesanal.',
  );

  if (id && !existing) {
    return (
      <div className="stack">
        <h2>Receta no encontrada</h2>
        <p className="lead">
          El identificador «{id}» no existe en este navegador. Puede que se haya borrado.
        </p>
        <div className="row">
          <Button to="/administracion" variant="outline" icon="arrowLeft">
            Volver al resumen
          </Button>
          <Button to="/administracion/recetas/nueva" variant="quiet" icon="plus">
            Crear una receta nueva
          </Button>
        </div>
      </div>
    );
  }

  const patch = (changes: Partial<Recipe>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setTouched(true);
  };

  /**
   * Las líneas vacías no son un error: el formulario arranca con una en blanco y
   * `save` las descarta. Validar solo lo que de verdad impide guardar.
   */
  const validate = (candidate: Recipe): Errors => {
    const next: Errors = {};
    if (candidate.name.trim().length < 3) next.name = 'Escribe un nombre de al menos 3 caracteres.';
    if (candidate.properties.length === 0 && candidate.propertiesSource !== 'pendiente')
      next.properties =
        'Sin propiedades: elige alguna o deja el origen de datos en «Pendiente de completar».';
    return next;
  };

  const save = () => {
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      notify('Revisa los campos marcados.');
      return;
    }

    const slug = uniqueSlug(
      draft.slug || draft.name,
      recipes.map((recipe) => recipe.slug),
      draft.slug,
    );
    const recipe: Recipe = {
      ...draft,
      slug,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      mainIngredient: draft.mainIngredient.trim(),
      timeLabel: draft.timeLabel?.trim() ? draft.timeLabel.trim() : null,
      steps: draft.steps.filter((step) => step.text.trim() !== ''),
      ingredients: draft.ingredients.filter((line) => line.name.trim() !== ''),
      utensils: draft.utensils.map((item) => item.trim()).filter(Boolean),
      tips: draft.tips.map((item) => item.trim()).filter(Boolean),
      warnings: draft.warnings.map((item) => item.trim()).filter(Boolean),
      updatedAt: nowIso(),
    };

    dispatch({ type: 'upsertRecipe', recipe });
    notify(isNew ? 'Receta creada.' : 'Cambios guardados.');
    navigate(`/recetas/${recipe.slug}`);
  };

  const updateLine = (lineId: string, changes: Partial<RecipeIngredientLine>) =>
    patch({
      ingredients: draft.ingredients.map((line) =>
        line.id === lineId ? { ...line, ...changes } : line,
      ),
    });

  const move = <T,>(list: T[], index: number, delta: number): T[] => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    return next;
  };

  const photo = resolveRecipePhoto(draft.image || draft.slug);
  const pending = pendingFields(draft);

  return (
    <>
      <SectionHead
        eyebrow={isNew ? 'Creación' : 'Edición'}
        title={isNew ? 'Nueva receta' : draft.name || 'Receta sin nombre'}
        description={
          isNew
            ? 'Rellena solo lo que tengas documentado. Los huecos quedan marcados como pendientes.'
            : 'Los campos vacíos se muestran como información pendiente: no se rellenan automáticamente.'
        }
        action={
          <div className="row">
            <Meter
              ratio={(7 - pending.length) / 7}
              caption={`${pending.length} campos pendientes`}
            />
          </div>
        }
      />

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        aria-label="Formulario de receta"
      >
        {/* --- Identificación ------------------------------------------- */}
        <section className="filters" aria-labelledby="datos-basicos">
          <h2 id="datos-basicos" className="label">
            Datos básicos
          </h2>
          <div className="form-grid">
            <Field
              label="Nombre de la receta"
              required
              value={draft.name}
              onChange={(value) => patch({ name: value })}
              error={errors.name}
              placeholder="Jabón de avena y miel"
            />
            <Field
              label="Enlace (slug)"
              value={draft.slug}
              onChange={(value) => patch({ slug: value })}
              hint={
                photo
                  ? 'Hay fotografía asociada a esta clave.'
                  : 'Coincide con el nombre del archivo en src/assets/images/recipes/.'
              }
              placeholder="se calcula desde el nombre"
            />
            <Field
              label="Descripción breve"
              kind="textarea"
              rows={2}
              value={draft.tagline}
              onChange={(value) => patch({ tagline: value, taglineSource: value.trim() ? 'documentado' : 'pendiente' })}
              placeholder="Pensado para piel seca."
            />
            <Field
              label="Ingrediente principal"
              value={draft.mainIngredient}
              onChange={(value) => patch({ mainIngredient: value })}
              placeholder="Avena molida"
            />
            <Field
              label="Categoría"
              kind="select"
              value={draft.category}
              onChange={(value) => patch({ category: value as CategoryId, categorySource: 'editorial' })}
              options={CATEGORIES.map((category) => ({ value: category.id, label: category.label }))}
            />
            <Field
              label="Nivel de dificultad"
              kind="select"
              value={draft.difficulty ?? ''}
              onChange={(value) =>
                patch({
                  difficulty: value === '' ? null : (value as Difficulty),
                  difficultySource: value === '' ? 'pendiente' : 'editorial',
                })
              }
              options={[
                { value: '', label: 'Sin clasificar (pendiente)' },
                ...DIFFICULTIES.map((level) => ({ value: level, label: DIFFICULTY_LABELS[level] })),
              ]}
              hint="El archivo no clasifica niveles: es una etiqueta del sitio."
            />
            <Field
              label="Tiempo de elaboración"
              value={draft.timeLabel ?? ''}
              onChange={(value) =>
                patch({
                  timeLabel: value,
                  timeSource: value.trim() ? 'documentado' : 'pendiente',
                })
              }
              placeholder="1–2 horas"
            />
            <Field
              label="Clave de fotografía"
              value={draft.image}
              onChange={(value) => patch({ image: value })}
              hint={photo ? `Imagen resuelta: ${photo}` : 'Sin imagen: la receta mostrará la placa botánica.'}
              placeholder={draft.slug || 'slug-de-la-receta'}
            />
          </div>

          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="field__label">Propiedades o finalidad</legend>
            <div className="chips" role="group" aria-label="Propiedades de la receta">
              {PROPERTY_OPTIONS.map((property) => {
                const active = draft.properties.includes(property);
                return (
                  <button
                    key={property}
                    type="button"
                    className="chip"
                    aria-pressed={active}
                    onClick={() =>
                      patch({
                        properties: active
                          ? draft.properties.filter((item) => item !== property)
                          : [...draft.properties, property],
                        propertiesSource: active ? 'pendiente' : 'documentado',
                      })
                    }
                  >
                    {property}
                  </button>
                );
              })}
            </div>
            {errors.properties ? <span className="field__error">{errors.properties}</span> : null}
            <span className="field__hint">
              Se usan en los filtros del catálogo. Añádelas solo si el archivo las describe.
            </span>
          </fieldset>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={() => patch({ featured: !draft.featured })}
            />
            <span className="checkbox__text">
              <strong>Marcar como destacada</strong>
              <span className="field__hint">Aparece en la portada junto a las otras destacadas.</span>
            </span>
          </label>
        </section>

        {/* --- Ingredientes ---------------------------------------------- */}
        <section className="filters" aria-labelledby="lineas-ingredientes">
          <div className="row row--between">
            <h2 id="lineas-ingredientes" className="label">
              Ingredientes y cantidades
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon="plus"
              onClick={() => patch({ ingredients: [...draft.ingredients, emptyIngredientLine()] })}
            >
              Añadir línea
            </Button>
          </div>
          {errors.ingredients ? <span className="field__error">{errors.ingredients}</span> : null}
          <span className="field__hint">Las líneas vacías se descartan al guardar.</span>

          <div className="stack-xs">
            {draft.ingredients.map((line, index) => (
              <div className="repeat-row" key={line.id}>
                <Field
                  id={`linea-${line.id}-nombre`}
                  label={`Ingrediente ${index + 1}`}
                  value={line.name}
                  onChange={(value) => updateLine(line.id, { name: value })}
                  placeholder="Base de glicerina blanca"
                />
                <Field
                  label="Cantidad"
                  value={line.amount ?? ''}
                  onChange={(value) =>
                    updateLine(line.id, {
                      amount: value,
                      source: value.trim() ? 'documentado' : 'pendiente',
                    })
                  }
                  placeholder="120 g"
                />
                <Field
                  label="Enlace a ficha"
                  kind="select"
                  value={line.ingredientId ?? ''}
                  onChange={(value) => updateLine(line.id, { ingredientId: value || undefined })}
                  options={[
                    { value: '', label: 'Sin ficha enlazada' },
                    ...ingredients.map((item) => ({ value: item.id, label: item.name })),
                  ]}
                />
                <div className="row" style={{ gap: 'var(--space-3xs)', paddingTop: '1.66rem' }}>
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    aria-label={`Subir ${line.name || 'ingrediente'}`}
                    disabled={index === 0}
                    onClick={() => patch({ ingredients: move(draft.ingredients, index, -1) })}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    aria-label={`Bajar ${line.name || 'ingrediente'}`}
                    disabled={index === draft.ingredients.length - 1}
                    onClick={() => patch({ ingredients: move(draft.ingredients, index, 1) })}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    aria-label={`Quitar ${line.name || 'ingrediente'}`}
                    onClick={() =>
                      patch({ ingredients: draft.ingredients.filter((item) => item.id !== line.id) })
                    }
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            ))}
            {draft.ingredients.length === 0 ? (
              <p className="meta">Sin ingredientes: la receta se mostrará con la fórmula pendiente.</p>
            ) : null}
          </div>
        </section>

        {/* --- Pasos ------------------------------------------------------- */}
        <section className="filters" aria-labelledby="lineas-pasos">
          <div className="row row--between">
            <h2 id="lineas-pasos" className="label">
              Preparación paso a paso
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon="plus"
              onClick={() => patch({ steps: [...draft.steps, emptyStep()] })}
            >
              Añadir paso
            </Button>
          </div>
          {errors.steps ? <span className="field__error">{errors.steps}</span> : null}
          <span className="field__hint">Los pasos vacíos se descartan al guardar.</span>
          <div className="stack-xs">
            {draft.steps.map((step, index) => (
              <div className="repeat-row repeat-row--steps" key={step.id}>
                <Field
                  label={`Paso ${index + 1}`}
                  value={step.text}
                  onChange={(value) =>
                    patch({
                      steps: draft.steps.map((item) => (item.id === step.id ? { ...item, text: value } : item)),
                    })
                  }
                  placeholder="Derretir la base a fuego suave"
                />
                <div className="row" style={{ gap: 'var(--space-3xs)', paddingTop: '0.1rem' }}>
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    aria-label={`Subir paso ${index + 1}`}
                    disabled={index === 0}
                    onClick={() => patch({ steps: move(draft.steps, index, -1) })}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    aria-label={`Bajar paso ${index + 1}`}
                    disabled={index === draft.steps.length - 1}
                    onClick={() => patch({ steps: move(draft.steps, index, 1) })}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    aria-label={`Quitar paso ${index + 1}`}
                    onClick={() => patch({ steps: draft.steps.filter((item) => item.id !== step.id) })}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            ))}
            {draft.steps.length === 0 ? (
              <p className="meta">
                Sin pasos: la ficha pública mostrará «Información pendiente de completar».
              </p>
            ) : null}
          </div>
        </section>

        {/* --- Listas simples --------------------------------------------- */}
        <section className="filters" aria-labelledby="listas-complemento">
          <h2 id="listas-complemento" className="label">
            Utensilios, consejos y advertencias
          </h2>
          <div className="grid-two">
            <StringList
              title="Utensilios"
              items={draft.utensils}
              onChange={(utensils) => patch({ utensils, utensilsSource: utensils.length ? 'editorial' : 'pendiente' })}
              placeholder="Molde de silicona"
            />
            <StringList
              title="Consejos de elaboración"
              items={draft.tips}
              onChange={(tips) => patch({ tips })}
              placeholder="Rociar alcohol quita las burbujas"
            />
            <StringList
              title="Advertencias propias de la receta"
              items={draft.warnings}
              onChange={(warnings) => patch({ warnings })}
              placeholder="La cúrcuma puede teñir la piel clara"
            />
            <div className="field">
              <label className="field__label" htmlFor="nota-receta">
                Nota del archivo
              </label>
              <textarea
                id="nota-receta"
                className="textarea"
                rows={3}
                value={draft.note}
                onChange={(event) => patch({ note: event.target.value })}
                placeholder="Contexto textual que acompaña a la receta."
              />
            </div>
          </div>
        </section>

        {/* --- Procedencia ------------------------------------------------ */}
        <section className="filters" aria-labelledby="procedencia">
          <h2 id="procedencia" className="label">
            Procedencia de los datos
          </h2>
          <div className="form-grid">
            <Field
              label="Descripción breve"
              kind="select"
              value={draft.taglineSource}
              onChange={(value) => patch({ taglineSource: value as SourceKind })}
              options={SOURCE_OPTIONS}
              hint="Indica si el texto viene del archivo o es una etiqueta del sitio."
            />
          </div>
          <div className="row">
            {pending.map((item) => (
              <Badge key={item.field} tone="pending">
                {item.label}
              </Badge>
            ))}
            {pending.length === 0 ? <Badge tone="accent">Sin campos pendientes</Badge> : null}
          </div>
        </section>

        <div className="row row--between">
          <div className="row">
            <Button type="submit" icon="check">
              {isNew ? 'Crear receta' : 'Guardar cambios'}
            </Button>
            <Button to="/administracion" variant="outline" icon="arrowLeft">
              Cancelar
            </Button>
          </div>
          <div className="row">
            {touched ? <span className="meta">Cambios sin guardar</span> : null}
            {!isNew ? (
              <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmDelete(true)}>
                Eliminar receta
              </Button>
            ) : null}
          </div>
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
                  size="md"
                  icon="trash"
                  onClick={() => {
                    dispatch({ type: 'deleteRecipe', id: existing.id });
                    setConfirmDelete(false);
                    notify('Receta eliminada.');
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
            Se borrarán los ingredientes, los pasos y los consejos de esta receta, y saldrá de tus
            favoritos. El resto del contenido no cambia.
          </p>
          <Notice tone="pending" title="Si solo quieres vaciarla" icon="warning">
            <p>
              Guarda la receta con los campos vacíos: seguirá existiendo y se marcará como pendiente.
            </p>
          </Notice>
        </Modal>
      ) : null}
    </>
  );
}

/** Lista simple de textos con alta, baja y borrado. */
function StringList({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="field">
      <span className="field__label">{title}</span>
      <div className="stack-xs">
        {items.map((item, index) => (
          <div className="repeat-row repeat-row--steps" key={`${title}-${index}`}>
            <input
              className="input"
              value={item}
              placeholder={placeholder}
              aria-label={`${title}, elemento ${index + 1}`}
              onChange={(event) =>
                onChange(items.map((entry, position) => (position === index ? event.target.value : entry)))
              }
            />
            <button
              type="button"
              className="btn btn--quiet btn--sm"
              aria-label={`Quitar ${title.toLowerCase()}, elemento ${index + 1}`}
              onClick={() => onChange(items.filter((_, position) => position !== index))}
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
        {items.length === 0 ? <p className="meta">Sin elementos.</p> : null}
      </div>
      <Button
        variant="quiet"
        size="sm"
        icon="plus"
        onClick={() => onChange([...items, ''])}
        style={{ justifySelf: 'start' }}
      >
        Añadir
      </Button>
    </div>
  );
}
