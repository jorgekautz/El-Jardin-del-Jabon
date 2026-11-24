# Backend de El Jardín del Jabón

**Estado: plan cerrado, nada implementado.** Este documento describe la arquitectura elegida y el
orden de trabajo. El código sigue funcionando como hoy: contenido de `src/data/seed.ts`
persistido en LocalStorage, panel de administración sin autenticación y fotografías locales.

Decisiones de partida (acordadas): una sola editora, PocketBase autoalojado, SEO importante pero
secundario, presupuesto de 0 € en fase de prueba, y una única máquina que sirva API y sitio.

---

## 1. Por qué hace falta un backend

Hoy la persistencia es LocalStorage (`src/store/storage.ts`), es decir: lo que se edita en un
navegador no existe para nadie más. El panel de administración no tiene autenticación y el
proyecto **no la finge**, como explica `src/pages/admin/AdminLayout.tsx`.

| Necesidad | Situación actual |
| --- | --- |
| Autenticación real de la editora | Inexistente, y correctamente no simulada |
| Contenido compartido entre navegadores | Local: solo existe en la máquina que edita |
| Publicar fotografías sin recompilar | Imposible: `src/assets/photos.ts` resuelve archivos compilados |
| Integridad del dato garantizada | Solo validación de formulario; un `curl` escribe lo que quiera |
| Trazabilidad de cambios | No existe |
| «Destacar» y «restablecer el archivo» como acciones reales | Locales, no afectan a nadie |

### Lo que NO va al backend

Favoritos, casillas de la lista de compras y productos propios de la visita **siguen en
LocalStorage**. Son datos de quien navega; subirlos obligaría a dar cuentas a quien no tiene
cuenta y a gestionar datos personales sin necesidad. El dataset publicado es minúsculo: 6
recetas, 27 ingredientes, 5 utensilios, 6 productos de compra.

---

## 2. Elección: PocketBase autoalojado

PocketBase es un único binario (Go) con SQLite embebido, panel de administración, autenticación
con MFA, almacenamiento de archivos, reglas de seguridad por colección, realtime y hooks en JS.
Licencia MIT: sin registro, sin clave de API, sin coste.

Opciones descartadas y por qué:

| Opción | Motivo del descarte |
| --- | --- |
| Supabase / Firebase | Servicio gestionado: 0 € inicial con proyecto que se duerme por inactividad y dependencia de proveedor |
| Sanity / Strapi | Aportan su propio panel de administración, que no sabe expresar las reglas de procedencia del dato |
| Next.js full-stack | El mejor SEO, pero exige reescribir enlazado, rutas y datos |
| Express + Postgres desde cero | Más trabajo que valor para 6 recetas |
| Render / Railway / Koyeb (planes gratuitos) | Disco efímero: SQLite y las fotos se pierden |
| Vercel / Netlify / Cloudflare Pages | Sirven para el front estático, no para PocketBase |

**La cuenta de PocketBase no existe como servicio.** La única cuenta es la de administradora que
se crea en el primer arranque y que vive en el SQLite propio:

```bash
.\pocketbase.exe admin create admin@tudominio.es "contraseña-mínimo-10-caracteres"
```

Nadie más necesita cuenta: el catálogo se lee de forma anónima.

---

## 3. Arquitectura: una sola máquina

```
tudominio.es          → Caddy → PocketBase
                        · pb_public/  = dist/ de la SPA
                        · /api/...    = API REST
                        · /_/         = panel interno de PocketBase (mantenimiento)
                        · TLS automático (Let's Encrypt)
```

Front y API comparten origen: **cero configuración de CORS** en todo el plan. Un solo despliegue
(`npm run build` → copiar `dist/` a `pb_public/`) y un solo certificado.

### Estructura de la carpeta backend

```
backend/
  pocketbase.exe          # binario descargado (gitignored)
  pb_data/                # SQLite + fotos subidas  ← LOS DATOS (gitignored)
  pb_migrations/          # esquema versionado: entra en git
  pb_hooks/main.pb.js     # reglas de integridad del servidor
  pb_public/              # copia del dist/ (gitignored)
  Caddyfile               # TLS + proxy + protección del panel (fase de despliegue)
scripts/seed.mjs          # carga recetas.txt en la base de datos
```

`pb_migrations/` es código: el esquema se revisa, se despliega y se revierte como el resto del
proyecto. `pb_data/` es lo único que no entra en git.

---

## 4. Modelo de datos

El objeto `Recipe` es un documento anidado (líneas de ingredientes, pasos, arrays). Se guarda
**sin transformar**: el contrato sigue siendo `src/domain/types.ts`. Las columnas sueltas son
solo las que se filtran o indexan.

```
recipes        slug (unique, indexado), name, featured (bool), published (bool),
               data (json: el Recipe completo), image (file),
               updated_by (relation), updated (autodate)
ingredients    slug (unique), name, category (select), data (json), image (file)
shopping_base  label, detail, quantity, sort
tools          name, data (json)
content_events entity, entity_id, action, actor, before (json), after (json)
```

### Reglas de acceso (por colección, en PocketBase)

| Operación | Regla |
| --- | --- |
| `List` / `View` | vacía ⇒ lectura pública, sin token |
| `Create` / `Update` / `Delete` | `@request.auth.id != ''` ⇒ solo sesión autenticada |

La editora es cuenta de administrador, que además salta las reglas: la escritura queda cerrada
para todo lo demás por defecto. El servidor es la autoridad; la protección de
`/administracion/*` en el cliente es comodidad, no seguridad.

---

## 5. Integridad del dato en el servidor

Hoy las reglas de «no inventar» viven en `RecipeEditorPage.tsx`. Para que sean una garantía, el
esquema se define una sola vez en `src/domain/schema.ts` (zod, derivado de `types.ts`) y se usa
desde el formulario **y** desde los hooks de PocketBase (`onRecordCreateRequest`,
`onRecordUpdateRequest`).

1. Un campo con `source: 'documentado'` es **inmutable**: es del archivo, no del editor.
2. `amount` vacío exige `source: 'pendiente'`; nunca `'documentado'` con cantidad vacía.
3. `properties ⊆ ['limpieza', 'exfoliante', 'hidratación', 'absorción']`.
4. `category` y `difficulty` llevan `source: 'editorial'` de forma obligatoria.
5. `slug` único y normalizado (índice único en base de datos + `slugify` de `src/domain/text.ts`).
6. Toda escritura registra `before`/`after` y el actor en `content_events`.
7. Ruta `POST /api/republicar-semilla` (solo administradora) que devuelve el contenido al
   archivo original: sustituye el actual `reset` local.

---

## 6. Autenticación

- Cuenta de administrador única, contraseña fuerte y **MFA TOTP** activado en el perfil.
- El SPA se autentica con `pb.admins.authWithPassword(email, password)`; el token dura 15
  minutos y se renueva con `authRefresh`.
- El token viaja en cabecera `Authorization`, no en cookies: sin CSRF. Se guarda en memoria o
  `sessionStorage`, nunca en `localStorage`.
- Limitador de intentos de login por IP (`rates.auth`) y, expuesto a internet, Caddy o fail2ban.
- **SMTP configurado** para verificación y recuperación de contraseña. Sin SMTP no hay «he
  olvidado mi contraseña»: se restablece por CLI en el servidor.

---

## 7. Cambios en el frontend

El reducer de `src/store/AppStore.tsx` **no se toca**. La migración es quirúrgica porque
`storage.ts` ya es el único módulo que toca la persistencia.

| # | Cambio | Archivo |
| --- | --- | --- |
| 1 | Cliente HTTP: `listRecipes`, `getRecipe`, `saveRecipe`, `deleteRecipe`, `uploadPhoto`, `login`, `logout`, `republicarSemilla` | `src/data/api.ts` |
| 2 | `contentStatus: 'local \| cargando \| listo \| error'`; arranca con la semilla y la reemplaza al recibir datos: si el servidor cae, la web sigue funcionando con el contenido del archivo | `src/store/AppStore.tsx` |
| 3 | `storage.ts` se parte en dos: la persistencia personal queda igual, la de contenido se sustituye por `api.ts` | `src/store/storage.ts` |
| 4 | `recipe.image` pasa a ser una URL de archivo de PocketBase; se mantiene la placa botánica y el aviso «Fotografía pendiente» cuando esté vacío | `src/assets/photos.ts` |
| 5 | El panel muestra sesión real (quién, cuándo, caducidad) y deja de describir un acceso que no existe | `src/pages/admin/AdminLayout.tsx` |
| 6 | Pantalla de acceso con contraseña y código MFA | `/administracion/acceso` |
| 7 | Proxy de Vite `/api` → `http://127.0.0.1:5080` (en desarrollo, mismo origen que en producción) | `vite.config.ts` |

---

## 8. Alojamiento

### Fase de prueba: local, 0 €

PocketBase en la máquina de desarrollo. Un solo proceso, sin exposición a la red (escucha en
`127.0.0.1:5080`).

| URL | Qué es |
| --- | --- |
| `http://127.0.0.1:5173` | SPA en desarrollo (Vite) con proxy a la API |
| `http://127.0.0.1:5080` | PocketBase sirviendo el `dist/`: réplica exacta de la VM futura |
| `http://127.0.0.1:5080/_/` | Panel interno de PocketBase |
| `http://127.0.0.1:5080/api/...` | API REST |

El binario de Windows es un `.exe` suelto de las releases oficiales: no necesita Node, ni
instalador, ni permisos de administrador.

### Fase de publicación

| Servicio | Coste | Disco persistente | Veredicto |
| --- | --- | --- | --- |
| **Oracle Cloud Always Free** (ARM, 4 cores / 24 GB / 200 GB) | 0 € | Sí (200 GB) | Única vía realmente gratis que aguanta producción |
| Hetzner CAX11 / CAX21 (UE) | ~4–7 €/mes | Sí | La opción sensata cuando haya tráfico real |
| Racknerd / Contabo | ~3–5 €/mes | Sí | Barato, soporte mínimo |
| Fly.io | ~2–5 €/mes | Volúmenes de pago | Cómodo, ya no es gratis |
| PikaPods / Elestio (PocketBase gestionado) | ~4–8 €/mes | Sí | Si no se quiere mantener Linux |

Condiciones de Oracle Always Free: tarjeta de crédito para verificar la identidad, capacidad
según región (elegir UE: Frankfurt, París, Madrid), sin SLA ni soporte, y cuentas reclaimables
por inactividad. La VM es tuya: la instalas, la parcheas y la respaldas tú.

Alternativa de dos piezas (front en Cloudflare Pages + backend en `api.dominio`): mejor CDN y
TTFB, ancho de banda ilimitado, a cambio de dos despliegues y CORS restringido al dominio. Con
SEO secundario no hace falta.

### Lo que el alojamiento conlleva

- Dominio propio (~10–15 €/año) con DNS en Cloudflare (gratis). Sin dominio el sitio queda en una
  IP con certificado autofirmado: inviable para público.
- **Backups a 0 €**: `rclone` de `pb_data/` a Cloudflare R2 (10 GB gratis, sin coste de salida).
  Se comprueban restaurando, no copiando.
- Restricción por IP del panel `/_/`, o desactivarlo (`--adminUi=false`) y operar solo por API y
  migraciones.
- Monitorización de disponibilidad (UptimeRobot gratuito).
- Actualizaciones del binario: las corrige y aplica quien mantiene la máquina.

---

## 9. SEO (secundario, sin reescribir a Next)

Prerenderizado en el build: un script lee las recetas e ingredientes publicados y genera HTML
por ruta con `title`, `description`, `canonical`, Open Graph y **JSON-LD de tipo `Recipe`**, más
`sitemap.xml`. Con `base: '/'` y la reescritura a `index.html` ya configuradas, el rastreador ve
contenido sin ejecutar JavaScript. Es un script de build contenido, no una migración.

---

## 10. Fases

| # | Trabajo | Esfuerzo |
| --- | --- | --- |
| 1 | `git init`; `.gitignore` con `backend/pb_data/`, `backend/pb_public/`, `backend/pocketbase.exe`; mover la clave de Context7 de `opencode.json` a variable de entorno | 1 h |
| 2 | Binario + migraciones de las 5 colecciones (`slug` único, `published`, `featured`, campo `file`) | 2–3 h |
| 3 | Reglas de acceso: lectura pública, escritura autenticada | 1 h |
| 4 | `npm run seed`: 6 recetas, 27 ingredientes, 6 compras, 5 utensilios desde `seed.ts`, idempotente por `slug` | 1–2 h |
| 5 | `src/domain/schema.ts` (zod) con las 7 reglas de integridad + pruebas en Vitest | 2 h |
| 6 | Hooks del servidor con las mismas reglas + `content_events` + `POST /api/republicar-semilla` | 3–4 h |
| 7 | Login real de la editora (admin + MFA + limitador) y pantalla de acceso | 2 h |
| 8 | Lecturas: el catálogo público sale de la API, con la semilla como respaldo | 2 h |
| 9 | Escrituras: guardar y borrar recetas e ingredientes; el `reset` pasa a ser «republicar el archivo» | 3 h |
| 10 | Fotos: subida desde el panel, `photos.ts` por URL, límite de tamaño y tipo (**sin SVG**, es vector de XSS) | 2 h |
| 11 | Smoke test de la máquina única: `npm run build` → `pb_public/` → `http://127.0.0.1:5080` con enlaces profundos | 1 h |
| 12 | Prerenderizado + `sitemap.xml` + JSON-LD | 2–3 h |
| 13 | Despliegue: VM + Caddy TLS + backups a R2 + protección del panel + monitorización | 2–3 h |

**No se toca:** el reducer, los estilos, las páginas públicas, y la persistencia de favoritos y
casillas de compras.

---

## 11. Riesgos

- **`pb_data/` es el sitio.** Sin backup probado, la pérdida es total. En local conviene un
  `npm run backup` que copie la carpeta a una carpeta sincronizada.
- **VM gratuita = sin SLA.** Con tráfico real, el VPS de 4–7 €/mes es la recomendación honesta.
- **`/_/` es la llave maestra**: nunca accesible sin restricción en producción.
- **El free tier de desarrollo no es un sitio**: `pocketbase serve` no es accesible desde fuera;
  la fase 13 es la que lo convierte en público.
- **La validación del cliente deja de ser la autoridad.** Si el hook no replica una regla, el
  servidor la acepta: las pruebas de `schema.ts` son la defensa compartida.
- **El backend no mejora el SEO por sí solo**: lo hace la fase 12.

---

## 12. Documentación relacionada

- [`Prompt.md`](Prompt.md) — brief del producto y verificación final.
- [`README.md`](README.md) — ejecutar, construir, publicar; §6 explica la ausencia de autenticación.
- [`AGENTS.md`](AGENTS.md) — reglas para agentes que trabajen en el repositorio.
- [`docs/CONTENIDO.md`](docs/CONTENIDO.md) — cómo se tradujo `recetas.txt` y qué se añadió.
