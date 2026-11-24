# Del archivo a la aplicación

Cómo se tradujo cada línea de `recetas.txt` y qué añadió el sitio. La copia literal del
archivo está en [`recetas.txt`](recetas.txt).

## Etiquetas de origen

Cada campo del modelo lleva un origen explícito (`src/domain/types.ts`):

| Etiqueta | Significado | Cómo se ve |
| --- | --- | --- |
| `documentado` | La información está en `recetas.txt`. | Etiqueta «Documentado en recetas.txt». |
| `editorial` | La añadió este sitio para ordenar el catálogo. | Etiqueta «Clasificación del sitio». |
| `pendiente` | El archivo no lo describe. | «Información pendiente de completar». |

Ninguna pantalla presenta un dato `editorial` como si el archivo lo dijera.

## Útiles

El archivo lista cuatro útiles bajo «Herramientas básicas (rápido)» y menciona el
**alcohol en spray** en la lista de compra y en el paso «Rociar alcohol (quita burbujas)».
La app muestra cinco útiles: los cuatro del archivo más el alcohol en spray, con la nota de
que el archivo lo nombra en la compra y en los pasos, no en el bloque de útiles.

## Lista de compra

Se transcriben los seis productos con la cantidad del archivo:

| Producto | Cantidad del archivo |
| --- | --- |
| Base de glicerina | 500 g – 1 kg |
| Fragancias o aceites esenciales | 1–2 |
| Colorantes | 1–2 |
| Molde de silicona | 1 |
| Alcohol en spray | 1 |
| Espátula o cuchara | 1 |

## Ingredientes (27 fichas)

- **Bases (6)**: base de glicerina y sus variantes transparente y blanca/opaca, más las
  bases con aloe vera, leche de cabra y carbón activado. El archivo solo dice que existen:
  esas cuatro fichas marcan la propiedad como pendiente.
- **Aceites y mantecas (5)**: coco (espuma y limpieza), oliva (hidratación), almendras
  (suavidad), karité (nutrición profunda), cacao (dureza y aroma).
- **Aromas (5)**: lavanda (relajante), eucalipto (refrescante), naranja y limón
  (energizante), fragancias cosméticas (más variedad de aromas). La frase del archivo
  «beneficios terapéuticos» no se convierte en indicación médica: las fichas repiten la
  palabra del archivo y el panel de seguridad recuerda que son notas de cosmética.
- **Complementos (7)**: avena (exfoliante suave), semillas de amapola y de chía
  (exfoliación), pétalos secos (decoración), arcillas (limpieza profunda), miel
  (hidratante), colorantes (el archivo no describe propiedades).
- **Específicos de recetas (4)**: manzanilla deshidratada, cúrcuma en polvo, café molido y
  arroz en polvo. El archivo los usa con cantidades pero no describe propiedades: figuran
  con la propiedad pendiente.

## Recetas

| Receta | Lo que aporta el archivo | Lo que añadió el sitio |
| --- | --- | --- |
| Jabón básico para empezar | 3 ingredientes con cantidad, 6 pasos, tiempo «1–2 horas», nota final | Categoría, nivel y propiedad «limpieza» |
| Jabón exfoliante | 3 ingredientes (sin cantidad de base ni de esencia), «agregás la avena justo antes de verter», «no mucho (1–2 cucharadas)» | Categoría, nivel, propiedad «exfoliante» |
| Jabón hidratante | 3 ingredientes (base blanca, 1 cucharada de aceite de almendras o coco, esencia suave) | Categoría, nivel, propiedad «hidratación» |
| Jabón de manzanilla y cúrcuma | 120 g de base blanca, 0,5 g de manzanilla deshidratada o ½ cucharadita, 1,5 g de cúrcuma | Categoría, nivel |
| Jabón de café exfoliante | 120 g de base blanca, 6,5 g de café molido, 4 g de aceite esencial de naranja (50–60 gotas) | Categoría, nivel, propiedad «exfoliante» |
| Jabón de arroz absorbente | 180 g de base blanca, 2,5 g de arroz en polvo o 2 cucharaditas | Categoría, nivel, propiedad «absorción» |

Los pasos y los utensilios de las recetas 2 a 6 **no existen** en el archivo: esas secciones
aparecen marcadas como pendientes. El texto «El archivo documenta la receta al detalle; no
se han añadido pasos ni utensilios que no aparezcan en él» es exactamente lo que hace la app.

## Vocabulario de filtros

Las propiedades que se pueden filtrar son solo las que el archivo documenta en alguna
receta: limpieza, exfoliante, hidratación, absorción. Un filtro sin resultados sería una
promesa vacía, así que «limpieza profunda» y «aromático» no están en la lista de filtros
aunque el archivo los use al describir ingredientes.

## Consejos y advertencias

- El consejo de la receta exfoliante («agregás la avena justo antes de verter») es texto del
  archivo.
- El consejo de la receta básica («rociar alcohol al final elimina las burbujas») sale del
  paso 5 del archivo.
- Las advertencias de la sección «Sobre el uso cosmético» son recomendaciones del sitio,
  presentadas como tales y separadas del contenido del archivo.
