import { describe, expect, it } from 'vitest';
import { joinNonEmpty, normalizeText, slugify, tokenize } from './text';

describe('normalizeText', () => {
  it('pliega mayúsculas y tildes', () => {
    expect(normalizeText('Jabón de Avena Y Miel')).toBe('jabon de avena y miel');
    expect(normalizeText('Cúrcuma')).toBe('curcuma');
    expect(normalizeText('Mañanera')).toBe('mananera');
  });

  it('colapsa los espacios y recorta los extremos', () => {
    expect(normalizeText('  glicerina   transparente  ')).toBe('glicerina transparente');
  });
});

describe('tokenize', () => {
  it('divide en palabras normalizadas', () => {
    expect(tokenize('Aceite de Lavanda')).toEqual(['aceite', 'de', 'lavanda']);
  });

  it('descarta tokens vacíos', () => {
    expect(tokenize('  —  ·  ')).toEqual([]);
    expect(tokenize('')).toEqual([]);
  });
});

describe('slugify', () => {
  it('genera slugs aptos para URLs', () => {
    expect(slugify('Jabón de Manzanilla y Cúrcuma')).toBe('jabon-de-manzanilla-y-curcuma');
  });

  it('elimina guiones iniciales y finales', () => {
    expect(slugify('  !!!  avena  ')).toBe('avena');
  });

  it('recorta a 60 caracteres', () => {
    expect(slugify('a'.repeat(100))).toHaveLength(60);
  });

  it('devuelve cadena vacía si no hay caracteres alfanuméricos', () => {
    expect(slugify('·—·')).toBe('');
  });
});

describe('joinNonEmpty', () => {
  it('ignora vacíos y nulos', () => {
    expect(joinNonEmpty(['Principiante', '', null, undefined, '1–2 horas'])).toBe(
      'Principiante · 1–2 horas',
    );
  });

  it('permite cambiar el separador', () => {
    expect(joinNonEmpty(['a', 'b'], ' / ')).toBe('a / b');
  });
});
