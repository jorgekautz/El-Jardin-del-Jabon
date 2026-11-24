# Fotografías propias

El sitio funciona sin ninguna imagen: las ilustraciones son placas botánicas en SVG.
Cuando un hueco corresponde a una fotografía, la interfaz muestra la placa y el aviso
«Fotografía pendiente». Nunca se pone una imagen que no corresponda.

Para añadir tus fotos, suelta los archivos en estas dos carpetas y vuelve a construir:

```
src/assets/images/
  recipes/     <slug-de-la-receta>.jpg
  sections/    hero.jpg · botanicals.jpg · tools.jpg
```

Formatos aceptados: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. El nombre se compara sin
tildes, sin mayúsculas y con guiones, así que `Jabón de café.jpg` sirve para la receta
`jabon-de-cafe-exfoliante` solo si el nombre coincide con el slug.

## Recetas (usa el slug de cada receta)

| Receta | Archivo |
| --- | --- |
| Jabón básico para empezar | `recipes/jabon-basico-para-empezar.jpg` |
| Jabón exfoliante | `recipes/jabon-exfoliante.jpg` |
| Jabón hidratante | `recipes/jabon-hidratante.jpg` |
| Jabón de manzanilla y cúrcuma | `recipes/jabon-de-manzanilla-y-curcuma.jpg` |
| Jabón de café exfoliante | `recipes/jabon-de-cafe-exfoliante.jpg` |
| Jabón de arroz absorbente | `recipes/jabon-de-arroz-absorbente.jpg` |

Una receta creada desde la administración usa su propio slug: el campo «Clave de la
fotografía» del editor muestra la clave que hay que usar.

## Secciones

| Imagen | Archivo | Dónde aparece |
| --- | --- | --- |
| Portada | `sections/hero.jpg` | Cabecera de la página de inicio |
| Ingredientes | `sections/botanicals.jpg` | Banda «Ingredientes naturales» |
| Utensilios | `sections/tools.jpg` | Tarjeta de herramientas y página de utensilios |

## Cómo se resuelven

`src/assets/photos.ts` indexa con `import.meta.glob` los archivos que existan en el momento
de la compilación. Vite les pone hash y la app solo muestra la imagen si el archivo está:
por eso las fotos forman parte del proyecto y viajan con el build.

El panel de administración lista el inventario (qué recetas tienen foto y cuáles no) para
saber qué falta sin abrir carpetas.

## Consejos

- Recorta en 5:4 para la portada y en 4:3 para las tarjetas; el recorte lo controla CSS.
- Nombra los archivos en minúsculas y sin espacios: es la forma más previsible.
- Después de añadir imágenes, `npm run build` (o recargar el servidor de desarrollo) para
  que Vite las incorpore al índice.
