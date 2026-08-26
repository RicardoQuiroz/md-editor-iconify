# 📘 Manual de Usuario: Iconify MD Editor v5.0

> **Editor de Markdown Inteligente con Previsualización WYSIWYG a Pantalla Completa, Auto-Iconos NLP y Estilización Visual Integrada**

---

## 📋 Tabla de Contenidos

1. [Introducción & Visión General](#1-introducción--visión-general)
2. [Modos de Vista & Atajo `Ctrl+Q`](#2-modos-de-vista--atajo-ctrlq)
3. [Navegación por Teclado y Selección de Objetos](#3-navegación-por-teclado-y-selección-de-objetos)
4. [Motor Inteligente de Auto-Inserción de Iconos](#4-motor-inteligente-de-auto-inserción-de-iconos)
5. [Ventanas Modales de Edición Visual](#5-ventanas-modales-de-edición-visual)
   - [Explorador de Iconos](#51-explorador-de-iconos-iconpickermodal)
   - [Editor Visual de Iconos](#52-editor-visual-de-iconos-iconstylemodal)
   - [Editor Visual de Estilos de Texto](#53-editor-visual-de-estilos-de-texto-textstylemodal)
   - [Configuración de Imágenes & Disco Local](#54-configuración-de-imágenes--disco-local-imagesettingsmodal)
   - [Insertar Enlaces](#55-insertar-enlaces-linkmodal)
   - [Audio y Vídeo Incrustado](#56-audio-y-vídeo-incrustado-mediaembedmodal)
6. [Edición Interactiva de Imágenes en WYSIWYG](#6-edición-interactiva-de-imágenes-en-wysiwyg)
7. [Gestión Multi-Archivo & Panel Lateral](#7-gestión-multi-archivo--panel-lateral)
   - [Pestaña Archivos](#71-pestaña-archivos)
   - [Pestaña Índice (Tabla de Contenidos)](#72-pestaña-índice-tabla-de-contenidos)
   - [Indicador de Cambios sin Guardar](#73-indicador-de-cambios-sin-guardar)
8. [Barra Superior (Navbar de Solo Iconos)](#8-barra-superior-navbar-de-solo-iconos)
9. [Guía de Atajos de Teclado](#9-guía-de-atajos-de-teclado)

---

## 1. Introducción & Visión General

**Iconify MD Editor v5.0** es una herramienta de edición avanzada basada en tecnologías web modernas (HTML5, Vanilla CSS3 y React). Fue diseñada para resolver las limitaciones tradicionales de los editores Markdown estándar mediante:

- **Inserción automática de referencias visuales** (iconos Lucide) según el contexto del texto.
- **Formateo intuitivo de bloques y párrafos** mediante controles visuales GUI sin necesidad de escribir código.
- **Distribución de texto alrededor de imágenes** (*Text-Wrap*) al estilo de procesadores de texto como Microsoft Word.
- **Edición a Pantalla Completa** con conmutación bidireccional entre la previsualización WYSIWYG y el código fuente Markdown.

---

## 2. Modos de Vista & Atajo `Ctrl+Q`

La aplicación opera a pantalla completa eliminando distracciones y maximizando el espacio de trabajo:

1. **Modo WYSIWYG (Pantalla Completa por Defecto)**:
   - Muestra el documento renderizado con estilos ricos, tipografías personalizadas e iconos interactivos.
   - Permite la selección directa a través de teclado o mouse de cualquier objeto, redimensionamiento de imágenes y navegación por teclado.
   - Permite escribir y editar directamente la sintaxis de marcado tradicional.
2. **Modo Editor Markdown Fuente (Pantalla Completa)**:
   - Permite escribir y editar directamente la sintaxis de marcado tradicional.

### 🔄 Atajo `Ctrl+Q` y Selección Bidireccional

- Al presionar **`Ctrl+Q`** o hacer clic en el botón conmutador de la barra superior, la vista cambia instantáneamente entre el editor WYSIWYG y el código fuente Markdown.
- **Sincronización Bidireccional**: Al seleccionar un bloque o párrafo en el panel WYSIWYG y presionar `Ctrl+Q`, el editor Markdown se abre posicionando y seleccionando automáticamente la línea exacta de código fuente. De igual manera, al colocar el cursor en una línea del código Markdown y conmutar a WYSIWYG, dicho bloque aparecerá enfocado y resaltado.
- **Misma Altura en Pantalla**: El objeto sincronizado queda **centrado verticalmente** en los dos paneles, de modo que aparece en la misma fila al alternar entre vistas y no hay saltos inesperados. Esto vale también para los saltos desde el índice y desde la búsqueda. En cambio, al recorrer el documento con las **flechas** el desplazamiento es el mínimo necesario, para que navegar no dé tirones.

---

## 3. Navegación por Teclado y Selección de Objetos

En el modo de vista WYSIWYG:

- **Desplazamiento por Teclado**: Utiliza las teclas **`Flecha Arriba`**, **`Flecha Abajo`**,**`Flecha Derecha`**, **`Flecha Izquierda`** o **`Tab`** para desplazarte secuencialmente entre los objetos del documento.
- **Rectángulo Azul de Borde Punteado**: Absolutamente **todos los objetos** (párrafos simples, títulos H1/H2/H3, imágenes, iconos y cajas de notas) muestran un marco azul punteado (`2px dashed #38BDF8`) cuando están enfocados o seleccionados.
- **Apertura de Modales (`Ctrl+Enter`)**: Al visualizar el rectángulo azul punteado sobre cualquier objeto, presionar **`Ctrl+Enter`** abre la ventana modal de edición asociada a dicho objeto.

---

## 4. Motor Inteligente de Auto-Inserción de Iconos

El editor cuenta con un motor NLP (*Natural Language Processing*) integrado que analiza las palabras clave en tu documento (en español e inglés) e inserta iconos dinámicos acordes al significado del texto.

- **Activación**: Haz clic en el botón con icono de chispas de brillo (`Sparkles`) en la barra superior.
- **Ejemplos de detección automática**:
  - `cohete`, `lanzamiento`, `rocket` ➔ Inserción de icono `:Rocket:`
  - `seguridad`, `escudo`, `shield` ➔ Inserción de icono `:Shield:`
  - `configuración`, `settings` ➔ Inserción de icono `:Settings:`
  - `advertencia`, `warning` ➔ Inserción de icono `:AlertTriangle:`
- **Inserción en la Posición del Cursor**: Todos los iconos se insertan exactamente donde se encuentre ubicado el cursor dentro del texto.

---

## 5. Ventanas Modales de Edición Visual

### 5.1. Explorador de Iconos (`IconPickerModal`)

- **Apertura**: Haz clic en el icono de carita sonriente (`Smile`) en la barra superior.
- **Catálogo**: **552 iconos** organizados en **46 categorías** (*Seguridad, Alertas, Estado, Progreso, Tecnología, Desarrollo, Datos, Nube y Red, Dispositivos, Interfaz, Navegación, Archivos, Carpetas, Texto, Edición, Formato, Multimedia, Imagen, Audio, Comunicación, Símbolos, Usuarios, Negocios, Finanzas, Comercio, Gráficos, Tiempo, Ubicación, Transporte, Clima, Naturaleza, Animales, Comida, Salud, Deporte, Educación, Herramientas, Hogar, Diseño, Formas, Caras, Juegos, Viajes, Energía, Accesibilidad y Marcadores*).
- **Columna de Categorías con Scroll Propio**: Las categorías ocupan una columna estrecha a la izquierda del modal, cada una con su punto de color y el número de iconos que contiene. La ventana **mantiene siempre el mismo alto** por muchas categorías que haya, y la categoría activa queda resaltada.
- **Búsqueda en Tiempo Real**: Busca simultáneamente por nombre del icono, por categoría y por palabras clave **en español** (`contraseña`, `nube`, `advertencia`, `factura`, `bicicleta`…).
- **Recientes**: Los últimos 12 iconos utilizados aparecen en su propia entrada al principio de la columna y se conservan entre sesiones.
- **Conmutador Multicolor / Línea**: El botón `Palette` de la barra de búsqueda alterna entre ver e insertar los iconos en **duotono multicolor** (cada categoría con su paleta) o en **trazo simple**. La cuadrícula refleja al instante el modo elegido.
- **Navegación**: **`Flechas`** para desplazarte (izquierda/derecha por icono, arriba/abajo por fila), **`Inicio`/`Fin`** para saltar a los extremos, **`ENTER`** para seleccionar e insertar y **`ESC`** para cerrar. El pie del modal indica cuántos resultados hay y cuál está seleccionado.

---

### 5.2. Editor Visual de Iconos (`IconStyleModal`)

Permite aplicar todas las propiedades visuales y efectos CSS posibles a un icono sin escribir código:

- **Apertura**: Haz clic sobre cualquier icono en la vista previa o presiona `Ctrl+Enter` sobre él.
- **Propiedades Ajustables**:
  - **Relleno del Icono (Multicolor)**: Tres modos seleccionables.
    - `Línea`: trazo de un solo color, el estilo clásico.
    - `Multicolor auto`: aplica la paleta duotono asignada a la categoría del icono. Los iconos de *Clima* salen en cian, los de *Finanzas* en esmeralda, los de *Alertas* en ámbar… sin configurar nada. Genera el atributo `duo=auto`.
    - `Duotono a medida`: eliges el color de **relleno** y el de **trazo** por separado, con 14 paletas predefinidas de acceso rápido (*Cielo, Índigo, Violeta, Rosa, Coral, Rojo, Naranja, Ámbar, Lima, Esmeralda, Turquesa, Cian, Grafito y Tierra*).
    - En los dos modos de color, un deslizador ajusta la **intensidad del relleno** (5% a 100%).
  - **Dimensiones & Espaciado**: Slider de tamaño (12px a 128px) y padding interno.
  - **Color & Fondo**: Color principal (solo en modo `Línea`), paleta de acceso rápido, color de fondo sólido o degradado (*Gradients*).
  - **Bordes & Radio**: Ancho de borde, estilos (*sólido, punteado, puntos, doble*) y radio (*cuadrado, redondeado, píldora o círculo 50%*).
  - **Sombras & Brillos (*Glow*)**: Color de brillo con difuminado dinámico.
  - **Opacidad & Filtros CSS**: Opacidad (0% a 100%), escala de grises, sepia, inversión y matiz (*Hue Rotate*).
  - **Transformaciones Geométricas**: Rotación estática (0° a 360°), espejo horizontal (*Flip X*) y vertical (*Flip Y*).
  - **Animaciones CSS en Tiempo Real**: `Spin` (rotación continua), `Pulse` (palpitación), `Bounce` (rebote) y `Float` (flotación vertical).
- **Sincronización Bidireccional de Código**: Muestra la sintaxis generada `:Nombre{color="..." bg="..." pulse=true}:` editable en tiempo real. Los modos de color añaden `duo=auto` o `duo="#relleno,#trazo"`, y opcionalmente `duoopacity="0.5"`.
- **Atajos de Teclado**: Presiona **`ENTER`** para guardar los estilos o **`ESC`** para cancelar.

---

### 5.3. Editor Visual de Estilos de Texto (`TextStyleModal`)

Permite formatear títulos, párrafos y cajas de llamadas sin código manual:

- **Apertura**: Presiona `Ctrl+Enter` sobre cualquier texto resaltado con el marco azul.
- **Presets de Bloque**:
  - `Título H1`, `Título H2`, `Título H3`, `Párrafo Normal`.
  - `Info Callout` (caja azul informativa).
  - `Advertencia` (caja amarilla de alerta).
  - `Éxito` (caja verde de confirmación).
  - `Tarjeta Elevada` (bloque contenedor con borde).
  - `Cita Serif` (bloque tipográfico elegante).
  - `Consola / Terminal` (estilo desarrollador con fuente monoespaciada).
- **Tipografía y Color**: Selección de fuentes (*Inter Sans*, *JetBrains Mono*, *Playfair Serif*), tamaño, grosor, alineación (*Izquierda, Centro, Derecha, Justificado*) y color de texto.

---

### 5.4. Configuración de Imágenes & Disco Local (`ImageSettingsModal`)

Proporciona control total sobre la inserción y distribución de texto en imágenes:

- **Explorador de Disco Local**: Botón **"Explorar Disco"** para elegir cualquier imagen de tu equipo (`.png`, `.jpg`, `.svg`, `.webp`).

  Se inserta su **ruta relativa** (`./diagrama.png`), nunca la imagen codificada. Una foto de 300 KB incrustada en base64 añadiría unos **400.000 caracteres en una sola línea**, dejando el documento ilegible e imposible de comparar entre versiones. Con la ruta, el documento crece unos 30 caracteres.

  Mientras dure la sesión verás la imagen en la vista previa aunque el Markdown solo guarde la ruta: el archivo queda cargado en memoria.

  **Si la imagen no está disponible** —porque reabres el documento en otra sesión— en su lugar aparece un **rectángulo de borde azul discontinuo con el nombre del archivo** dentro. Ese rectángulo es un objeto de pleno derecho: se selecciona con las flechas o con un clic, se enmarca en azul, abre su configuración con `Ctrl+Enter` y **se redimensiona arrastrando sus cuatro esquinas**, igual que una imagen visible. El ancho que ajustes se escribe en el Markdown aunque no veas la imagen.
- **Precarga de Propiedades**: Al abrir la ventana sobre una imagen seleccionada en el documento, se cargan automáticamente todos sus valores preexistentes.
- **Distribución de Texto (*Text Wrap* estilo MS Word)**:
  - `Flujo a Derecha (Float Left)`: La imagen se alinea a la izquierda y el texto fluye a su derecha.
  - `Flujo a Izquierda (Float Right)`: La imagen se alinea a la derecha y el texto fluye a su izquierda.
  - `Centrado en Bloque`: La imagen ocupa su propio bloque centrado.
- **Atajos de Teclado**: Presiona **`ENTER`** para guardar la imagen o **`ESC`** para salir.

#### Documentos con imágenes incrustadas

Si abres un documento que ya contiene imágenes en base64 —por ejemplo creado con una versión anterior— aparece un aviso bajo la barra superior indicando **cuántas hay, cuántos caracteres ocupan y qué porcentaje del archivo son**.

El botón **Extraer a archivos** guarda cada imagen como archivo real (te pregunta dónde) y deja en su lugar la ruta relativa. El documento recupera su tamaño normal, la imagen se conserva intacta y sigue viéndose en la vista previa. Detecta tanto `![alt](data:image/…)` como un `data:image/…` suelto sin sintaxis de imagen alrededor.

---

### 5.5. Insertar Enlaces (`LinkModal`)

Permite añadir un enlace **en mitad de un párrafo**, sin salir del texto.

- **Apertura**: **`Ctrl+K`** o el botón `Link2` de la barra superior.
- **Comportamiento según el panel activo**:
  - En el **Editor Markdown Fuente**, sustituye exactamente el texto que tengas seleccionado. Si no hay selección, inserta en la posición del cursor.
  - En la **Vista WYSIWYG**, envuelve el texto que hayas marcado con el ratón dentro del bloque enfocado. Si el texto marcado no aparece tal cual en el código fuente (por ejemplo, porque cruza una negrita), el enlace se añade al final del bloque y un aviso te lo indica.
- **Campos**: texto visible, dirección y título emergente opcional. Debajo se muestra el Markdown exacto que se va a insertar.
- **Detección de medios**: si la dirección apunta a un audio o vídeo, un aviso te recuerda que dentro de un párrafo quedará como enlace normal, y que para verlo como reproductor debe ir solo en su línea.
- **Atajos**: **`ENTER`** inserta, **`ESC`** cancela.

---

### 5.6. Audio y Vídeo Incrustado (`MediaEmbedModal`)

Convierte enlaces de audio y vídeo en reproductores dentro del documento.

- **Apertura**: botón `Clapperboard` de la barra superior, o `Ctrl+Enter` sobre un reproductor ya existente para editarlo.
- **Formatos reconocidos**:
  - **Audio**: `.mp3`, `.ogg`, `.oga`, `.wav`, `.m4a`, `.aac`, `.flac`, `.opus`, `.weba`
  - **Vídeo**: `.mp4`, `.webm`, `.ogv`, `.mov`, `.m4v`
  - **YouTube**: enlaces `watch?v=`, `youtu.be`, `/embed/`, `/shorts/` y `/live/`, respetando el segundo de inicio (`?t=90` o `?t=1m30s`)
  - **Vimeo**: enlaces `vimeo.com/123456789`, incluidos los privados con hash
- **Vista previa en vivo** del reproductor mientras escribes la dirección, y aviso del tipo detectado.
- **Título opcional**: se convierte en la leyenda bajo el reproductor.
- **Explorar disco**: inserta la **ruta relativa** del archivo, no su contenido. Un MP3 de 3 MB incrustado como datos convertiría el `.md` en un archivo de 4 MB de texto. Los reproductores con ruta local se marcan con borde discontinuo ámbar y solo suenan al abrir el documento junto a su archivo.
- **Privacidad**: los vídeos de YouTube se incrustan a través de `youtube-nocookie.com`.
- **Atajos**: **`ENTER`** inserta, **`ESC`** cancela.

#### Cómo se guarda en el Markdown

Esto es lo importante: **no se inventa ninguna sintaxis**. Una línea que contiene solo un enlace a un medio se convierte en reproductor.

```markdown
https://ejemplo.com/podcast.mp3

[Clase 3 — Introducción](https://youtu.be/dQw4w9WgXcQ)
```

Como el Markdown es estándar, el mismo archivo se comporta bien en todas partes:

| Destino                          | Resultado                                          |
|:-------------------------------- |:-------------------------------------------------- |
| Este editor y exportación `.html` | ▶ Reproductor incrustado                           |
| GitHub (`.md` en el repositorio) | Enlace clicable (GitHub elimina audio, vídeo e iframes) |
| Moodle                           | ▶ Reproductor (su filtro *Multimedia* lo convierte solo) |
| Obsidian, VS Code, otros lectores | Enlace clicable                                    |

> No aparece texto residual en ningún destino. El enlace debe estar **solo en su línea**, con una línea en blanco antes y después: dentro de un párrafo sigue siendo un enlace normal, que es justo lo que quieres para una referencia en mitad de una frase.

---

### 5.7. Búsqueda y Reemplazo (`Ctrl+H`)

Se abre como una **barra acoplada bajo la barra superior**, no como ventana modal, para poder ver el documento mientras navegas por las coincidencias.

- **Apertura**: **`Ctrl+H`** o el botón `Replace`. Si tenías texto seleccionado, se usa como búsqueda inicial.
- **Contador en vivo**: muestra `3 de 12` y el número de línea de la coincidencia actual.
- **Navegación**: **`ENTER`** salta a la siguiente, **`Mayús+ENTER`** a la anterior, o los botones `⌃` y `⌄`. Al saltar, la coincidencia queda seleccionada en el editor de código, o su bloque enmarcado en azul en la vista WYSIWYG.
- **Tres opciones conmutables**:
  - `Aa` — **Distinguir mayúsculas y minúsculas**.
  - `ab|` — **Solo palabras completas**. Funciona con acentos y eñes, así que buscar *casa* no encuentra *descasar*.
  - `.*` — **Expresión regular**. El campo de reemplazo admite entonces referencias `$1`, `$2`… a los grupos capturados. Si la expresión no es válida se avisa en lugar de fallar.
- **Reemplazar** cambia solo la coincidencia actual.
- **Reemplazar todo** las cambia todas de una vez; el botón indica cuántas son antes de pulsarlo y un aviso confirma cuántas se cambiaron.
- **`Ctrl+Z`** deshace un reemplazo masivo completo en un solo paso.
- **`ESC`** cierra la barra.

> Fuera del modo de expresión regular, escribir `$&` o `$1` en el reemplazo los inserta **literalmente**, sin interpretarlos.

---

### 5.8. Cambiar Mayúsculas (`Ctrl+L`)

- **Apertura**: **`Ctrl+L`** o el botón `CaseUpper`.
- **Sobre qué actúa**, en este orden:
  1. El **texto seleccionado** en el editor de código.
  2. Si no hay selección, la **línea donde está el cursor**.
  3. En la vista WYSIWYG, el **bloque enmarcado en azul**.

  La ventana indica siempre cuál de los tres está usando.
- **Seis transformaciones**, cada una mostrando el resultado **sobre tu propio texto**, no un ejemplo genérico:

| # | Transformación             | Resultado sobre «la seguridad DE los datos» |
|:-:|:-------------------------- |:-------------------------------------------- |
| 1 | MAYÚSCULAS                 | `LA SEGURIDAD DE LOS DATOS`                  |
| 2 | minúsculas                 | `la seguridad de los datos`                  |
| 3 | Tipo oración               | `La seguridad de los datos`                  |
| 4 | Cada Palabra En Mayúscula  | `La Seguridad De Los Datos`                  |
| 5 | iNVERTIDO                  | `LA SEGURIDAD de LOS DATOS`                  |
| 6 | texto-con-guiones          | `la-seguridad-de-los-datos`                  |

- **Atajos**: pulsa **`1`** a **`6`** para aplicar directamente, o muévete con las **`Flechas`** y confirma con **`ENTER`**. **`ESC`** cancela.

#### Qué NO se transforma

Esto es lo importante: pasar un párrafo a mayúsculas sin más convertiría `:Shield:` en `:SHIELD:` (icono roto) y estropearía las direcciones de los enlaces. La herramienta calcula primero los tramos intocables y solo transforma el texto visible:

| Se respeta                                    | Ejemplo                             |
|:--------------------------------------------- |:----------------------------------- |
| Atajos de icono                               | `:Shield:`, `:Rocket{duo=auto}:`    |
| Direcciones de enlaces e imágenes             | `](https://ejemplo.com/Ruta)`       |
| Código entre comillas invertidas              | `` `código literal` ``              |
| URLs sueltas                                  | `https://Ejemplo.com/x`             |
| Marcadores de bloque                          | `##`, `-`, `>`, `1.`                |
| Etiquetas HTML                                | `<span>`                            |

El **texto** de un enlace sí se transforma; solo se protege su destino. Y `Tipo oración` mantiene la frase abierta al cruzar un trozo de código o un enlace, en lugar de capitalizar la palabra siguiente por error.

---

## 6. Edición Interactiva de Imágenes en WYSIWYG

Al hacer clic o enfocar cualquier imagen en la vista previa WYSIWYG:

- Aparecerán **4 manejadores en las esquinas** (*Resize Handles*).
- Haz clic y arrastra cualquier manejador para ajustar las dimensiones de la imagen con el mouse en tiempo real.
- La etiqueta de código Markdown se actualizará automáticamente con el nuevo valor de ancho.

---

## 7. Gestión Multi-Archivo & Panel Lateral

El panel lateral izquierdo agrupa dos herramientas en **pestañas**, de modo que activar una no resta espacio a la otra ni a la zona de escritura:

| Pestaña      | Se abre con                                    | Contenido                          |
|:------------ |:---------------------------------------------- |:---------------------------------- |
| **Archivos** | Icono de carpeta (`FolderOpen`)                | Documentos abiertos                |
| **Índice**   | Icono de árbol de lista (`ListTree`)           | Tabla de contenidos del documento  |

Ambos botones están en la esquina superior izquierda de la barra superior y abren el panel directamente en su pestaña.

---

### 7.1. Pestaña Archivos

- **Panel Colapsable**: El botón `‹` de la cabecera lo pliega; el icono de carpeta vuelve a abrirlo.
- **Múltiples Archivos**: Trabaja con varios documentos a la vez. La pestaña muestra el número total de archivos abiertos y basta con hacer clic en un nombre para cambiar a él.
- **Renombrar y Crear**: Botón para crear notas nuevas y opción de renombrado inmediato.

#### Abrir documentos (`Ctrl+O`)

**`Ctrl+O`** o el botón `Upload` de la barra abren la **pantalla de apertura**, que ofrece los dos caminos a la vez:

```
        ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
                        ┌──────┐
        │               │  ⬆   │               │
                        └──────┘
        │      ╭───────────────────────╮       │
               │  Buscar en el equipo  │
        │      ╰───────────────────────╯       │
                 o suelta un archivo aquí
        │                                      │
              ＋ Crear un documento en blanco ->
        └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

- **Buscar en el equipo** abre el diálogo de archivos de Windows. También responde a **`ENTER`**.
- **Soltar sobre la zona discontinua**: el recuadro se ilumina y el texto cambia a «Suelta ahora para abrirlo».
- **`ESC`** cierra la pantalla sin abrir nada.

No hace falta pasar por esta pantalla: puedes **soltar un archivo sobre cualquier punto de la ventana** en cualquier momento, estés en la vista WYSIWYG, en el editor de código o sobre la barra lateral.

En ambos casos admite **varios archivos a la vez** o **una carpeta entera**, de la que abre todos los documentos e ignora el resto. Formatos: `.md`, `.markdown`, `.mdx`, `.txt` y `.text`.

#### Un archivo, una sola pestaña

La aplicación **no abre dos veces el mismo documento**. Si intentas abrirlo de nuevo —desde el buscador, soltándolo o desde el historial— salta a la pestaña que ya lo tiene y te lo indica.

La comprobación usa la identidad real del archivo en el sistema, no su nombre: **dos `README.md` en carpetas distintas son dos documentos diferentes** y ambos se abren. Cuando el navegador no ofrece esa comprobación (Firefox, Safari) se compara por nombre.

**Si el archivo cambió en el disco** desde que lo abriste, aparece un aviso ámbar con dos opciones: *Recargar del disco* trae la versión nueva, y *Mantener el mío* conserva lo que tienes en pantalla. Si tienes cambios sin guardar, el aviso te avisa de que recargar los perdería. Tus propios guardados con `Ctrl+S` no disparan el aviso.

#### Historial de documentos

La pantalla de apertura lista los **últimos 30 documentos** que has abierto, con el tiempo transcurrido. Un clic los reabre.

- Los que ya están abiertos se marcan con la etiqueta **abierto** y llevan a su pestaña.
- La **✕** de cada fila quita esa entrada; el icono de papelera vacía el historial entero.
- El icono de descarga **exporta el historial a `.json`**, y el de subida lo importa.

> Las entradas se guardan en la base de datos local del navegador, que es lo único capaz de conservar el acceso a un archivo entre sesiones. Tras reiniciar el navegador, el primer clic en una entrada pide confirmar el permiso de lectura.
>
> El `.json` exportado contiene **solo los nombres y las fechas**, nunca el acceso al archivo: eso no es serializable por diseño. Sirve para consultar la lista o llevártela a otro equipo, donde las entradas importadas aparecen marcadas como **buscar** y al pulsarlas abren el diálogo para que localices el archivo.

#### Memoria de la última carpeta

En **Chrome, Edge y Opera** el buscador recuerda dónde estabas: la siguiente vez se abrirá en la misma carpeta del último documento, incluso después de cerrar el navegador. Así puedes abrir varios archivos de una misma carpeta uno tras otro sin volver a navegar hasta ella. La propia pantalla de apertura te indica cuál es la carpeta recordada.

> **Si aparece el aviso «Modo reducido»** en la pantalla de apertura, significa que este navegador no ofrece acceso directo al sistema de archivos: no se recuerda la carpeta y `Ctrl+S` descarga una copia en lugar de guardar encima del original.
>
> Ocurre en **Firefox y Safari**, que aún no admiten esta capacidad, y también al abrir la aplicación **haciendo doble clic sobre el archivo** (`file://`) en vez de servirla desde `localhost` o `https://`. Para el uso local, `npm run dev` o `npm run preview` la sirven en `localhost` y la activan.
>
> Los navegadores nunca revelan la ruta absoluta de un archivo por motivos de privacidad. La aplicación puede volver a la misma carpeta, pero no puede mostrarla escrita: por eso se identifica por el nombre del último documento abierto.

#### Guardar (`Ctrl+S`)

`Ctrl+S` guarda **encima del archivo original**, sin pasar por la carpeta de descargas:

| Situación                                              | Qué ocurre                                                        |
|:------------------------------------------------------ |:------------------------------------------------------------------ |
| El documento se abrió del disco (o se soltó)           | Se sobrescribe el archivo original                                 |
| Es un documento nuevo, sin archivo asociado            | Se abre **Guardar como** y, a partir de ahí, los guardados son directos |
| El navegador no lo admite, o niegas el permiso         | Se descarga una copia, como antes                                  |

- La primera vez que escribas en un archivo, Chrome pedirá permiso de escritura. Es una sola vez por archivo.
- El botón `Download` conserva su función original: **siempre** descarga una copia, sin tocar el original.
- Con esto, el indicador «sin guardar» de la sección 7.3 pasa a reflejar la realidad del archivo en disco.

---

### 7.2. Pestaña Índice (Tabla de Contenidos)

- **Detección Automática**: Todos los encabezados `#` a `######` del documento aparecen listados en cuanto se escriben. Los `#` que están dentro de un bloque de código cercado (```) **no** se confunden con encabezados.
- **Jerarquía Visual**: Cada nivel se muestra con su sangría correspondiente; los `H1` destacan en negrita y los niveles profundos se atenúan.
- **Salto Navegable**: Al hacer clic en una sección:
  - En **modo WYSIWYG**, el bloque correspondiente se enfoca con el rectángulo azul punteado y se desplaza hasta él.
  - En **modo Markdown Fuente**, el editor selecciona la línea exacta del encabezado y la centra en pantalla.
- **Sección Activa Resaltada**: La sección en la que te encuentras se marca en azul con una barra lateral y el índice se desplaza solo para mantenerla visible, tanto si navegas con las flechas por el WYSIWYG como si mueves el cursor por el código.
- **Plegado de Ramas**: El triángulo a la izquierda de cada encabezado con subsecciones las oculta o las muestra.
- **Filtro Rápido**: El campo superior filtra las secciones por texto, útil en documentos largos.
- **Títulos Limpios**: Los iconos, enlaces y marcas de énfasis se eliminan del texto mostrado en el índice, que presenta solo el título legible.

---

### 7.3. Indicador de Cambios sin Guardar

Un archivo se considera **modificado** cuando su contenido difiere de la última versión guardada en disco. La aplicación lo señala en cuatro sitios a la vez:

| Señal                             | Dónde aparece                                                            |
|:--------------------------------- |:------------------------------------------------------------------------ |
| Píldora ámbar **"Sin guardar"**   | Barra superior, junto al nombre del archivo. Si hay varios, indica cuántos |
| Punto ámbar **`●`**               | Junto al nombre del archivo en la pestaña *Archivos*                      |
| Punto en el botón `Save`          | Esquina del icono de guardar, que además se tiñe de ámbar                 |
| Prefijo **`●`** en el título      | Barra de título de la ventana del navegador                               |

- **Al guardar** (`Ctrl+S` o el botón `Save`), todas las señales desaparecen. El botón `Download` **no** las apaga: descargar una copia no modifica el archivo original.
- **Al cerrar un archivo modificado** (`Ctrl+W` o la `✕` de su fila), se pide confirmación antes de perder los cambios.
- **Al cerrar la ventana** con cambios pendientes en cualquier archivo, el navegador muestra su aviso de confirmación.

> Nota: ni exportar a `.html` con `FileCode` ni descargar una copia con `Download` cuentan como guardar el Markdown, así que el indicador se mantiene hasta que uses `Ctrl+S`.

---

## 8. Barra Superior (Navbar de Solo Iconos)

Los botones de la barra superior están organizados en 5 grupos funcionales con divisores visuales e iconos claros:

| Icono                                                            | Función / Descripción                                        | Atajo de Teclado    |
|:----------------------------------------------------------------:|:------------------------------------------------------------ |:-------------------:|
| `FolderOpen`                                                     | Abrir el panel lateral en la pestaña **Archivos**            | -                   |
| `ListTree`                                                       | Abrir el panel lateral en la pestaña **Índice**              | -                   |
| <code style="color:var(--accent-primary)">Monitor / Code2</code> | Alternar entre Vista Previa WYSIWYG y Editor Markdown Fuente | `Ctrl+Q`            |
| `FilePlus`                                                       | Crear un nuevo archivo de texto                              | -                   |
| `Save`                                                           | Guardar encima del archivo original                          | `Ctrl+S`            |
| `Upload`                                                         | Abrir la pantalla de apertura de documentos                  | `Ctrl+O`            |
| `Undo2` / `Redo2`                                                | Deshacer o Rehacer los últimos pasos de edición              | `Ctrl+Z` / `Ctrl+Y` |
| `Sparkles`                                                       | Auto-detectar e insertar iconos inteligentes NLP             | -                   |
| `Smile`                                                          | Abrir Explorador de Iconos Lucide                            | -                   |
| `Image`                                                          | Abrir Configuración de Imagen (Text-Wrap y Disco Local)      | -                   |
| `Link2`                                                          | Insertar un enlace en mitad del texto                        | `Ctrl+K`            |
| `Clapperboard`                                                   | Insertar audio o vídeo incrustado (MP3, MP4, YouTube, Vimeo) | -                   |
| `Copy`                                                           | Copiar la selección actual de código Markdown                | `Ctrl+C`            |
| `ClipboardPaste`                                                 | Pegar texto del portapapeles en la posición del cursor       | `Ctrl+V`            |
| `Download`                                                       | Descargar una **copia** `.md` sin tocar el original          | -                   |
| `FileCode`                                                       | Descargar documento exportado como archivo `.html`           | -                   |
| `RotateCcw`                                                      | Reajustar documento al contenido por defecto                 | -                   |
| `Sun` / `Moon`                                                   | Alternar entre Tema Oscuro y Tema Claro                      | -                   |

---

## 9. Guía de Atajos de Teclado

| Atajo                                             | Acción Realizada                                                           |
|:------------------------------------------------- |:-------------------------------------------------------------------------- |
| **`Ctrl + Q`**                                    | Alternar a pantalla completa entre Vista WYSIWYG y Editor Markdown.        |
| **`Ctrl + O`**                                    | Abrir la pantalla de apertura (buscar en el equipo o soltar un archivo).   |
| **`Ctrl + S`**                                    | Guardar encima del archivo original (o «Guardar como» si es nuevo).        |
| **`Alt + W`**                                     | Cerrar el archivo activo (pide confirmación si tiene cambios sin guardar). |
| **`Ctrl + C`**                                    | Copiar el texto o bloque Markdown seleccionado.                            |
| **`Ctrl + V`**                                    | Pegar el contenido del portapapeles en el cursor.                          |
| **`Ctrl + Z`**                                    | Deshacer la última modificación.                                           |
| **`Ctrl + Y`**                                    | Rehacer la modificación deshecha.                                          |
| **`Ctrl + K`**                                    | Insertar un enlace sobre el texto seleccionado.                            |
| **`Ctrl + H`**                                    | Abrir la barra de búsqueda y reemplazo.                                    |
| **`Ctrl + L`**                                    | Cambiar mayúsculas del texto seleccionado o del bloque enfocado.           |
| **`Alt + Flecha Derecha`**                        | Cambiar a la siguiente pestaña de archivo abierto.                         |
| **`Alt + Flecha Izquierda`**                      | Cambiar a la pestaña de archivo anterior.                                  |
| **`Flechas` (las 4) / `Tab`**                     | Navegar entre objetos en el panel WYSIWYG.                                 |
| **`Inicio` / `Fin`**                              | Saltar al primer o al último objeto del documento.                         |
| **`Ctrl + Enter`**                                | Abrir la ventana modal de edición sobre el objeto enfocado con borde azul. |
| **`ESC`**                                         | Cancelar y cerrar cualquier ventana modal abierta.                         |

### ⚠️ Atajos que el navegador se queda

Algunas combinaciones pertenecen al navegador y **no llegan a la página**: Chrome ni siquiera envía el evento, así que ninguna aplicación web puede usarlas.

| Combinación                    | La usa el navegador para  | Alternativa en este editor |
|:------------------------------ |:------------------------- |:-------------------------- |
| `Ctrl + W`                     | Cerrar la pestaña         | **`Alt + W`**              |
| `Ctrl + AvPág` / `Ctrl + RePág` | Cambiar de pestaña        | **`Alt + Flecha`**         |
| `Ctrl + T`, `Ctrl + N`         | Pestaña / ventana nueva   | Botón `FilePlus`           |

`Ctrl+H` y `Ctrl+L`, en cambio, sí llegan a la página y el editor los intercepta correctamente. Si en algún navegador se te abriera el historial o la barra de direcciones, los botones `Replace` y `CaseUpper` de la barra superior hacen exactamente lo mismo.

---

*Manual de Usuario de Iconify MD Editor v5.0 — Creado y mantenido por el equipo de desarrollo.*
