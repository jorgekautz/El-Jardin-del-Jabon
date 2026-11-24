import { BotanicalPlate, type PlateMotif } from './BotanicalPlate';

export interface SmartImageProps {
  /** URL resuelta por `resolveRecipePhoto` / `resolveSectionPhoto`, o `null`. */
  photo: string | null;
  /** Nombre del que se deriva el motivo de la placa ilustrativa. */
  seed: string;
  alt: string;
  motif?: PlateMotif;
  /** Aviso que se superpone cuando no hay fotografía. */
  pendingLabel?: string;
  eager?: boolean;
}

/**
 * Fotografía si existe; placa botánica si no.
 * La ausencia de imagen se comunica, no se disimula.
 */
export function SmartImage({
  photo,
  seed,
  alt,
  motif,
  pendingLabel,
  eager = false,
}: SmartImageProps) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
      />
    );
  }

  return (
    <>
      <BotanicalPlate seed={seed} motif={motif} label={alt} />
      {pendingLabel ? <span className="badge badge--pending media-flag">{pendingLabel}</span> : null}
    </>
  );
}
