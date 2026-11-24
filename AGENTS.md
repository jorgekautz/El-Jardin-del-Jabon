# AGENTS.md · El Jardín del Jabón

Guía para agentes que trabajen sobre este repositorio. Léela antes de tocar código.

## Qué es el proyecto

Biblioteca digital de recetas de jabones artesanales. Convierte el contenido de `recetas.txt`
(copia literal en `docs/recetas.txt`) en una SPA real y navegable: buscador, filtros por URL,
favoritos, lista de compras interactiva, páginas de receta e ingrediente, vista de impresión y
panel de administración con CRUD. Es una aplicación compilada, no un prototipo visual.

`Prompt.md` es el brief del producto y su lista de verificación final (7 puntos).
`README.md` es la documentación para personas que desarrollan o publican. Este archivo resume
lo que un agente necesita saber para no romper nada.

## Comandos

```bash
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b --pretty false (debe quedar limpio)
npm test           # vitest run: 4 archivos, 56 pruebas
npm run build      # tsc -b && vite build -> dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

Antes de dar por bueno un cambio: `npm run typecheck` y `npm test` en verde, y `npm run build`
sin errores.

## Stack y convenciones

- Vite 7 · React 19 · TypeScript 7 (strict) · React Router 7 · Vitest 5 · CSS propio.
- Sin framework de UI ni librería de componentes: los estilos viven en `src/styles/`
  (`tokens`, `base`, `layout`, `components`, `print`) con design tokens.
- Tipografías: Fraunces (display), Karla (texto), IBM Plex Mono (cantidades). Se importan en
  `src/main.tsx` desde `@fontsource`.
- Dirección visual «botica/herbario»: papel crema, acento salvia, banda profunda, hairlines y
  tintes. Agrupar con reglas y tintes, no con sombras.
- El dominio (`src/domain/`) **no depende de React**: se prueba solo con Vitest. Mantén ahí la
  lógica de negocio y llévala fuera de los componentes.
- `tsconfig.app.json` activa `noUnusedLocals`, `noUnusedParameters` y `noUncheckedIndexedAccess`:
  un import sin usar rompe el typecheck.

## Estructura

```
src/
  assets/photos.ts     resolución de fotografías (contrato en docs/FOTOGRAFIAS.md)
  components/          Icon, BotanicalPlate, SmartImage, SearchBox, SiteHeader, SiteFooter,
                       Layout, FavoriteButton, RecipeCard, IngredientCard, SafetyPanel,
                       PendingPanel, ui/{Button,Field,Modal,primitives}
  data/seed.ts         TODO el contenido de recetas.txt + PROPERTY_OPTIONS + SAFETY_NOTES
  domain/              types, text, completeness, search (+ sus .test.ts)
  hooks/               useDocumentMeta, useDebounced
  pages/               Home, Library, RecipeDetail, Ingredients, IngredientDetail,
                       Tools, Shopping, Favorites, NotFound
  pages/admin/         AdminLayout, AdminDashboard, RecipeEditor, IngredientEditor
  store/               AppStore (reducer + persistencia), factory, storage, toasts
  styles/              tokens, base, layout, components, print
```

## Reglas de integridad del contenido (no negociables)

El archivo original es una guía breve. La app **no inventa** datos.

1. **Cada campo lleva origen.** `SourceKind = documentado | editorial | pendiente`
   (`src/domain/types.ts`), visible con `SourceBadge`. `documentado` = está en `recetas.txt`;
   `editorial` = clasificación añadida por el sitio; `pendiente` = el archivo no lo dice.
2. **Los huecos se muestran como huecos.** `src/domain/completeness.ts` detecta campos
   pendientes; la UI escribe «Información pendiente de completar». Nunca rellenar con texto
   genérico, cantidades estimadas ni «una pizca».
3. **Nada de propiedades inventadas.** Un ingrediente solo muestra la propiedad del archivo.
   `PROPERTY_OPTIONS` es exactamente `['limpieza', 'exfoliante', 'hidratación', 'absorción']`.
4. **Cosmética, no medicina.** `SAFETY_NOTES` aparece en cada receta y ficha de ingrediente.
   No añadir afirmaciones terapéuticas ni dosis médicas.
5. **Categorías y dificultades son del sitio** (`categorySource`/`difficultySource: 'editorial'`)
   y deben seguir etiquetadas como «Clasificación del sitio».

Contenido actual del seed: 5 utensilios, 6 productos de compra, 27 fichas de ingrediente y
6 recetas (`r-jabon-basico` … `r-jabon-arroz`). `src/data/seed.test.ts` vigila todo esto; si
cambias el seed, actualiza el test y `docs/CONTENIDO.md`.

Huecos conocidos del archivo: las recetas 2–6 no tienen pasos, utensilios ni tiempo
documentados; las recetas 4–6 no tienen tagline; las propiedades de manzanilla, cúrcuma, café,
arroz y colorantes son `pendiente`. Déjalas en `pendiente`.

## Persistencia

- Una única clave versionada en LocalStorage: `el-jardin-del-jabon:v1` (`src/store/storage.ts`).
- Claves del estado: `version`, `recipes`, `ingredients`, `shopping`, `favorites`. Los utensilios
  son seed estático y **no** se persisten.
- Lectura con saneado y estados de almacenamiento etiquetados (`storageLabel`); la hidratación
  ocurre en el primer render para que un formulario abierto no vea los datos como inexistentes.
- No añadir claves nuevas sin migración explícita.

## Administración y autenticación

El panel (`/administracion/*`) está separado de la UI pública, pero **no tiene autenticación y
no se debe simular**: una contraseña en JavaScript o LocalStorage sería decorativa. El guardado
y la validación están listos para un backend; el contrato son los tipos `Recipe` e `Ingredient`.
Si te piden «login», dilo explícitamente en la UI y no finjes la protección.

## Accesibilidad y responsive

Son requisitos del brief, no mejoras: skip link, combobox accesible en el buscador, modales con
bucle de foco y Escape, formularios con `label` asociado + `aria-invalid` + errores en
`role="alert"`, textos de estado en vivo, contraste AA, objetivos táctiles ≥ 40 px, foco visible
y `prefers-reduced-motion`.

- Un botón sin texto visible se nombra **solo** con `aria-label` (patrón en `ui/Button.tsx`).
- Las tablas de administración se apilan como tarjetas etiquetadas bajo 40 rem usando
  `data-label` (`components.css`, bloque `@media (max-width: 40rem)`).
- Verifica rutas nuevas a 390 px: `scrollWidth` debe igualar el ancho del viewport.

## Fotografías

No hay imágenes de fondo: las ilustraciones son placas botánicas SVG generadas por
`BotanicalPlate.tsx`. `src/assets/photos.ts` resuelve archivos propios; si no existen, la UI
muestra la placa y el aviso «Fotografía pendiente», nunca una imagen ajena.

Rutas esperadas: `src/assets/images/recipes/<slug>.jpg` y
`src/assets/images/sections/{hero,botanicals,tools}.jpg`. **Hoy no hay fotografías**: la
generación de imágenes falló por credenciales, así que el sitio se ve con placas. No marques
los huecos como «completados».

## Notas del entorno

- `base: '/'` en `vite.config.ts` es deliberado: con `base: './'` las rutas profundas de la SPA
  piden `/recetas/assets/…`, reciben 404 y la página queda en blanco. Si publicas en
  subcarpeta, cambia `base` y el `basename` del router a la vez.
- Shell PowerShell: usa `Select-Object -First N` / `-Skip N -First N`, no `head`/`tail`.
- Herramienta de navegador: `npx --yes --package @playwright/cli playwright-cli ...`
  (`goto`, `eval`, `resize`, `set-media print`, `pdf`, `console`).
- La carpeta **no es un repositorio git** y los cambios están sin confirmar; no asumas que
  puedes hacer `git diff` para recuperar trabajo.
- Evidencia de verificación (capturas, PDF de impresión) en
  `C:\Users\Administrator\AppData\Local\Temp\opencode\jabones2-evidencia\`.

## Estado actual

App completa y verificada: typecheck limpio, 56 pruebas verdes, build correcto, smoke test de
producción en `:4173` sin mensajes de consola, impresión y móvil comprobados, LocalStorage
restablecido al seed (6 recetas, 27 ingredientes, 6 productos, 0 favoritos, 0 casillas).
Los 7 puntos de verificación de `Prompt.md` están cumplidos salvo las fotografías, pendientes
de material propio.
