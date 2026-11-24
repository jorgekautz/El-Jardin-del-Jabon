import { useId } from 'react';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

type Props =
  | (BaseProps & { kind?: 'text'; type?: 'text' | 'number' | 'email'; maxLength?: number })
  | (BaseProps & { kind: 'textarea'; rows?: number })
  | (BaseProps & { kind: 'select'; options: { value: string; label: string }[] });

/** Campo de formulario etiquetado, con aviso de error asociado por aria-describedby. */
export function Field(props: Props) {
  const generated = useId();
  const id = props.id ?? generated;
  const describedBy = [props.hint ? `${id}-hint` : null, props.error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  const invalid = props.error ? true : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {props.label}
        {props.required ? <span aria-hidden="true"> *</span> : null}
      </label>

      {props.kind === 'textarea' ? (
        <textarea
          id={id}
          className="textarea"
          value={props.value}
          rows={props.rows ?? 3}
          placeholder={props.placeholder}
          disabled={props.disabled}
          onChange={(event) => props.onChange(event.target.value)}
          aria-required={props.required || undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        />
      ) : props.kind === 'select' ? (
        <select
          id={id}
          className="select"
          value={props.value}
          disabled={props.disabled}
          onChange={(event) => props.onChange(event.target.value)}
          aria-required={props.required || undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          className="input"
          type={props.type ?? 'text'}
          value={props.value}
          placeholder={props.placeholder}
          disabled={props.disabled}
          autoComplete={props.autoComplete}
          maxLength={props.maxLength}
          onChange={(event) => props.onChange(event.target.value)}
          aria-required={props.required || undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        />
      )}

      {props.hint ? (
        <span className="field__hint" id={`${id}-hint`}>
          {props.hint}
        </span>
      ) : null}

      {props.error ? (
        <span className="field__error" id={`${id}-error`} role="alert">
          {props.error}
        </span>
      ) : null}
    </div>
  );
}
