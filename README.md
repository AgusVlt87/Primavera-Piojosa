# La Primavera Piojosa

Dashboard estático sobre la vuelta de Los Piojos (dic 2024 – jun 2025 · 17 shows).

## Archivos

```
index.html        ← toda la app (HTML + CSS + JS inline)
shows.json        ← datos de los 17 shows
albumes.json      ← catálogo de álbumes con colores
assets/logos/     ← PNGs de cada álbum (Chac Tu Chac.png, etc.)
```

## Deploy en GitHub Pages

1. Crear un repo en GitHub y subir todos los archivos (mantener la estructura de carpetas).
2. Ir a **Settings → Pages → Source → Deploy from a branch → main / (root)**.
3. El sitio queda disponible en `https://<usuario>.github.io/<repo>/`.

## Deploy en Netlify

1. Arrastrar la carpeta del proyecto al dashboard de [Netlify Drop](https://app.netlify.com/drop).  
   O conectar el repo de GitHub y configurar: Build command vacío, Publish directory `/`.
2. Netlify asigna una URL automáticamente.

## Dev local

Abrir con cualquier servidor HTTP estático. Ejemplo rápido con Python:

```bash
python -m http.server 8080
```

Luego abrir `http://localhost:8080`.

> **Nota:** Si abrís `index.html` directamente como `file://`, los `fetch()` fallarán pero la app igualmente funciona porque los datos están inlineados como fallback en el JS.
