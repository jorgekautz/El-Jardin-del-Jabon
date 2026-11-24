# El Jardín del Jabón

Biblioteca digital de recetas de jabones artesanales. Contiene **todo** el contenido del
archivo `recetas.txt` (útiles, lista de compra, ingredientes y las seis recetas) y lo
convierte en una web navegable: buscador, filtros, favoritos, lista de compras interactiva,
páginas de receta y de ingrediente, y un panel de administración para completar los huecos.

El proyecto es una aplicación real (React + TypeScript compilado con Vite), no un prototipo
visual: se ejecuta, persiste datos en el navegador y se empaqueta para producción.

```bash
npm install     # instala dependencias
npm run dev     # http://localhost:5173
npm run build   # carpeta dist/
npm run preview # sirve el build
npm test        # 56 pruebas unitarias
npm run typecheck
```

---

## 1. Contenido: qué hay y de dónde viene

`src/data/seed.ts` es la transcripción fiel de `recetas.txt`. La copia literal del archivo
original está en [`docs/recetas.txt`](docs/recetas.txt).

| Bloque del archivo | Dónde aparece en la app |
| --- | --- |
| Herramientas básicas (5 útiles) | `/utensilios` |
| Lista de compra básica (6 productos con cantidad) | `/compras` |
| Bases de glicerina, aceites y mantecas, aromas, complementos (27 fichas) | `/ingredientes` |
| Receta 1 · Jabón básico (ingredientes, pasos, tiempo) | `/recetas/jabon-basico-para-empezar` |
| Receta 2 · Jabón exfoliante | `/recetas/jabon-exfoliante` |
| Receta 3 · Jabón hidratante | `/recetas/jabon-hidratante` |
| Jabón de manzanilla y cúrcuma | `/recetas/jabon-de-manzanilla-y-curcuma` |
| Jabón de café exfoliante | `/recetas/jabon-de-cafe-exfoliante` |
| Jabón de arroz absorbente | `/recetas/jabon-de-arroz-absorbente` |

### Reglas de integridad del dato

El archivo original es una guía breve: no describe niveles de dificultad, categorías,
utensilios ni pasos de la mayoría de las recetas. La app **no inventa** esa información.

1. **Cada campo lleva un origen.** `documentado` (está en `recetas.txt`), `editorial`
   (clasificación añadida por el sitio, nunca propiedad de un ingrediente) o `pendiente`
   (el archivo no lo dice). Se ve en las fichas con etiquetas explícitas.
2. **Los huecos se muestran como huecos.** `src/domain/completeness.ts` calcula los campos
   pendientes y la interfaz escribe «Información pendiente de completar» en lugar de
   rellenar con texto genérico.
3. **Nada de propiedades inventadas.** Un ingrediente solo muestra la propiedad que el
   archivo le atribuye; si el archivo no la describe, la ficha lo dice.
4. **Cosmética, no medicina.** El panel de advertencias (`SAFETY_NOTES`) aparece en cada
   receta y en cada ficha de ingrediente, y recuerda que las notas de aromaterapia son
   folclore cosmético, que se haga prueba de piel y que se respeten las dosis del proveedor.
5. **Las clasificaciones del sitio se nombran como tales.** Categorías y niveles de
   dificultad van marcados con «Clasificación del sitio» porque `recetas.txt` no los menciona.

El test `src/data/seed.test.ts` vigila estas reglas: las seis recetas están, cada línea sin
cantidad es `pendiente` o está aclarada, ninguna propiedad sale del vocabulario, y ningún
campo vacío queda marcado como documentado.

## 2. Funcionalidades

- **Buscador global** en la cabecera: recetas e ingredientes, sugerencias navegables con
  flechas y Enter, `role="combobox"` + `listbox`.
- **Filtros del catálogo** (`/recetas`): consulta de texto, tipo de jabón, propiedad o
  finalidad, ingrediente principal, nivel de dificultad, solo favoritas y orden
  (relevancia, nombre, recientes). Todo viaja por la URL (`/recetas?q=avena&categoria=exfoliantes`),
  así que un filtro se puede compartir o marcar.
- **Favoritos**: se guardan en el navegador, con contador en la cabecera y página propia.
- **Lista de compras**: casillas persistentes, productos propios, restablecer.
- **Recetas destacadas** en portada (conmutables desde administración).
- **Detalle de receta** con la fórmula en formato de botica (filas numeradas, cantidades en
  monoespaciada), utensilios, pasos numerados, consejos, estado de la información y
  ingredientes enlazados con sus fichas.
- **Vista de impresión**: botón «Imprimir receta» y hoja `print.css` que deja solo la receta.
- **Administración** (`/administracion`): resumen con métricas, tablas de recetas e
  ingredientes, crear/editar/borrar recetas e ingredientes, conmutar destacadas, inventario
  de fotografías y restablecer el contenido del archivo.
- **Persistencia**: un único estado versionado en `localStorage`
  (`el-jardin-del-jabon:v1`) con saneado al leer y avisos si el navegador bloquea el
  almacenamiento (modo privado, cuota llena, datos corruptos).

## 3. Stack y estructura

Vite 7 · React 19 · TypeScript 7 (strict) · React Router 7 · Vitest 5 · CSS propio (sin
framework de UI).

```
src/
  assets/photos.ts        resolución de fotografías (ver docs/FOTOGRAFIAS.md)
  components/             Icon, BotanicalPlate, SmartImage, SearchBox, SiteHeader,
                          SiteFooter, Layout, FavoriteButton, RecipeCard, IngredientCard,
                          SafetyPanel, PendingPanel, ui/{Button,Field,Modal,primitives}
  data/seed.ts            todo el contenido de recetas.txt
  domain/                 types, text (normalización y slugs), completeness, search
  hooks/                  useDocumentMeta, useDebounced
  pages/                  Home, Library, RecipeDetail, Ingredients, IngredientDetail,
                          Tools, Shopping, Favorites, NotFound
  pages/admin/            AdminLayout, AdminDashboard, RecipeEditor, IngredientEditor
  store/                  AppStore (reducer + persistencia), factory, storage, toasts
  styles/                 tokens, base, components, layout, print
```

El dominio (`src/domain`) no depende de React: se prueba solo con Vitest. El store es un
`useReducer` con persistencia; la hidratación de `localStorage` ocurre en el primer render
para que un formulario abierto con datos guardados nunca los vea como inexistentes.

## 4. Fotografías

No hay imágenes de fondo: las ilustraciones son **placas botánicas** en SVG generadas por
código (`BotanicalPlate.tsx`). Cuando un hueco debe ser fotografía, la interfaz muestra la
placa y el aviso «Fotografía pendiente»; nunca se sustituye por una imagen ajena.

Para añadir fotos propias, deja los archivos en `src/assets/images/` y reconstruye:
ver [`docs/FOTOGRAFIAS.md`](docs/FOTOGRAFIAS.md) con los nombres exactos.

## 5. Accesibilidad

- Skip link, encabezado con `aria-current`, navegación etiquetada, pie con puntos de acceso.
- El buscador es un combobox accesible (flechas, Enter, Escape, `aria-expanded`,
  `aria-controls`, `aria-activedescendant` implícito en `aria-selected`).
- Modales con foco inicial, bucle de tabulación, Escape y devolución del foco al disparador.
- Formularios con `label` asociado, `aria-required`, `aria-invalid` y errores anunciados con
  `role="alert"`; el mensaje de error se enlaza con `aria-describedby`.
- Textos de estado («N recetas», «1 de 7 adquiridas») en vivo, no solo en el botón.
- Contraste AA sobre papel crema; el acento salvia nunca es el único indicador de estado
  (siempre va acompañado de texto o icono).
- Botones táctiles ≥ 40 px, foco visible, y respeto por `prefers-reduced-motion`.

## 6. Sobre la administración y la autenticación

El panel está separado de la experiencia pública (su propio armazón y rutas
`/administracion/*`), pero **no** trae autenticación: el contenido vive en el navegador de
quien edita. Una contraseña metida en JavaScript o en `localStorage` sería decorativa, así
que el proyecto no la finge: la pantalla de administración lo dice explícitamente y la
validación y el guardado están listos para conectar un backend cuando exista.

Si se publica en internet, la protección real exige servidor (sesiones, cabeceras, base de
datos). El `README` del backend queda pendiente; el contrato de datos es el tipo `Recipe` e
`Ingredient` de `src/domain/types.ts`.

## 7. Pruebas

```bash
npm test
```

56 pruebas en 4 archivos:

- `src/domain/text.test.ts` — normalización, tokenización, slugs.
- `src/domain/completeness.test.ts` — detección de huecos y medidor de completitud.
- `src/domain/search.test.ts` — consulta, filtros combinados, orden, enlaces de ingredientes.
- `src/data/seed.test.ts` — integridad del contenido frente a `recetas.txt`.

## 8. Publicar el build

`npm run build` deja `dist/` y `npm run preview` lo sirve en `http://localhost:4173`.

- **`base: '/'`** en `vite.config.ts`: la app usa rutas de historia (`/recetas/…`), así que
  los assets se piden desde la raíz. Con `base: './'` una URL profunda pide
  `/recetas/assets/index-….js`, recibe 404 y la página queda en blanco.
- **Subcarpeta:** si lo publicas en `https://dominio.io/jabones/`, pon
  `base: '/jabones/'` en `vite.config.ts` y el mismo valor como `basename` del
  `BrowserRouter` en `src/main.tsx`.
- **Reescritura:** cualquier hosting de SPA necesita enviar `index.html` en las rutas que no
  son archivos (Vercel y Netlify lo hacen por defecto; en Nginx, `try_files $uri /index.html`).
- **Fotografías:** colócalas antes de compilar (ver §4 y `docs/FOTOGRAFIAS.md`).

## 9. Documentación

- [`docs/recetas.txt`](docs/recetas.txt) — copia literal del archivo original (lo que ve
  quien llega sin JavaScript).
- [`docs/CONTENIDO.md`](docs/CONTENIDO.md) — cómo se tradujo cada línea y qué se añadió.
- [`docs/FOTOGRAFIAS.md`](docs/FOTOGRAFIAS.md) — contrato de las imágenes propias.
