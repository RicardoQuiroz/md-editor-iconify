# Iconify MD Editor

Editor de Markdown con previsualización WYSIWYG a pantalla completa, auto-inserción
de iconos por contexto y estilización visual sin escribir código.

Para aprender a usarlo, consulta el **[Manual de Usuario](MANUAL_DE_USUARIO.md)**.
Lo de abajo es solo para instalarlo y publicarlo.

---

## Desarrollo

```bash
npm install      # instalar dependencias (una sola vez)
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # compilar a dist/
npm run preview  # ver dist/ compilado como si estuviera publicado
npm run icons    # regenerar el registro de iconos (ver más abajo)
```

---

## Publicar en GitHub Pages, paso a paso

El repositorio ya trae todo preparado: `vite.config.js` genera rutas relativas
y `.github/workflows/deploy.yml` compila y publica solo. Solo hay que enlazarlo
con GitHub una primera vez.

### 1. Crear el repositorio en GitHub

Entra en <https://github.com/new>, ponle un nombre (por ejemplo
`iconify-md-editor`), déjalo **público** y **no marques** ninguna casilla de
«Add a README», «.gitignore» ni «license». Pulsa *Create repository*.

GitHub te mostrará una página con instrucciones. No la cierres: necesitas la URL
que aparece ahí, del estilo `https://github.com/TU-USUARIO/iconify-md-editor.git`.

### 2. Subir el código

Desde una terminal, en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/iconify-md-editor.git
git push -u origin main
```

Sustituye `TU-USUARIO` y el nombre del repositorio por los tuyos.

### 3. Activar Pages (solo la primera vez)

En tu repositorio de GitHub:

1. Pestaña **Settings** (arriba a la derecha).
2. Menú lateral izquierdo → **Pages**.
3. En **Build and deployment** → **Source**, despliega y elige
   **GitHub Actions**.

No hay que pulsar guardar: se aplica al elegirlo. Este es el único paso que se
hace desde la web; sin él GitHub no sabe que debe publicar lo que produce el
flujo de trabajo.

### 4. Ver el despliegue

Ve a la pestaña **Actions** de tu repositorio. Verás un flujo llamado
*Desplegar en GitHub Pages* ejecutándose. Tarda un par de minutos.

- **Punto amarillo** → está trabajando.
- **Tic verde** → publicado. La URL aparece dentro del trabajo `desplegar`, y
  también en Settings → Pages.
- **Aspa roja** → algo falló. Pincha en el trabajo para ver en qué paso y qué
  dijo. Los fallos habituales son que falte el paso 3, o que `npm ci` se queje
  porque `package-lock.json` no está subido.

Tu editor quedará en `https://TU-USUARIO.github.io/iconify-md-editor/`.

### 5. Actualizaciones posteriores

A partir de aquí no hay que volver a tocar nada:

```bash
git add .
git commit -m "Describe aquí el cambio"
git push
```

Cada `push` a `main` vuelve a compilar y publicar automáticamente. También
puedes lanzarlo a mano desde Actions → *Desplegar en GitHub Pages* → *Run
workflow*.

> `dist/` está en `.gitignore` a propósito: lo genera el flujo de trabajo en
> cada despliegue, así que nunca se sube al repositorio y el historial queda
> limpio.

---

## Notas técnicas

### Rutas relativas

`vite.config.js` usa `base: './'`. Con rutas absolutas, un repositorio de
proyecto servido desde `usuario.github.io/mi-repo/` pediría `/assets/index.js`
y daría 404. Con rutas relativas el mismo `dist/` funciona en una subcarpeta,
en una página de usuario, en un dominio propio y abriendo `dist/index.html`
directamente desde el disco.

### Registro de iconos

`src/utils/iconRegistry.js` **es un archivo generado, no lo edites a mano.**

Importa por nombre cada uno de los iconos del catálogo. Es lo que permite al
empaquetador dejar fuera los ~1000 iconos de Lucide que no se usan: con
`import * as Icons` entraban todos y el paquete pesaba 130 KB comprimidos más.

Si añades o quitas iconos en `src/utils/iconCatalog.js`, regenera el registro:

```bash
npm run icons
```

Un atajo `:NombreDeIcono:` que no esté en el catálogo se dibuja con el icono de
reserva (`Sparkles`).

### Serialización de iconos

`src/utils/iconSvg.js` convierte un icono de Lucide en una cadena de SVG a
partir de sus trazos crudos. Sustituye a `renderToStaticMarkup` de
`react-dom/server`, que pesaba 57 KB comprimidos y estaba en el paquete solo
para esta tarea. El marcado resultante es idéntico.

### Peso del paquete

| | Antes | Ahora |
|:--|--:|--:|
| JavaScript | 1.155 KB | 474 KB |
| JavaScript comprimido | 320 KB | 148 KB |
| CSS comprimido | 4,8 KB | 4,8 KB |
