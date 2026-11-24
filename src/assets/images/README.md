# Carpeta de imágenes

Aquí van las fotografías reales del sitio. El proyecto se entrega **sin fotografías**:
mientras una receta no tenga imagen, la interfaz muestra una placa botánica vectorial
y el aviso «Fotografía pendiente».

## Recetas

`src/assets/images/recipes/<slug-de-la-receta>.jpg`

```
src/assets/images/recipes/jabon-basico-para-empezar.jpg
src/assets/images/recipes/jabon-exfoliante.jpg
src/assets/images/recipes/jabon-hidratante.jpg
src/assets/images/recipes/jabon-de-manzanilla-y-curcuma.jpg
src/assets/images/recipes/jabon-de-cafe-exfoliante.jpg
src/assets/images/recipes/jabon-de-arroz-absorbente.jpg
```

Acepta `.jpg`, `.jpeg`, `.png`, `.webp` y `.avif`. El nombre se compara con el slug de la
receta sin tildes, en minúsculas y con guiones.

## Secciones

`src/assets/images/sections/hero.jpg` — portada.
`src/assets/images/sections/botanicals.jpg` — banda de ingredientes naturales.
`src/assets/images/sections/tools.jpg` — página de herramientas.

## Recomendaciones

- Composición cuadrada o 4:3, luz natural, fondo neutro.
- 1200 px de ancho bastan; el sitio recorta con `object-fit: cover`.
- Nombra el archivo con el slug de la receta y la foto aparece sola, sin tocar código.
