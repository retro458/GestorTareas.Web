# TaskFlow — Paquete de logos

## Archivos incluidos

### Favicon (pestaña del navegador)
- `favicon.svg` — versión vectorial, ideal para navegadores modernos
- `favicon.ico` — multi-resolución (16, 32, 48px), compatibilidad universal
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180) — para iOS "Agregar a inicio"
- `android-chrome-192x192.png` — Android PWA
- `android-chrome-512x512.png` — Android PWA splash

### Logo para login
- `logo.svg` — versión vectorial (recomendada, escala infinita)
- `logo-128.png` — versión small
- `logo-256.png` — versión medium (recomendada para login)
- `logo-512.png` — versión large / retina

---

## Cómo integrarlo en el proyecto

### 1. Pegar los archivos del favicon

Copiar TODOS los archivos de favicon (`favicon.*`, `apple-touch-icon.png`, `android-chrome-*.png`) en la carpeta `public/` de tu proyecto Vue+Vite. Vite los sirve directamente en la raíz.

### 2. Actualizar el <head> en `index.html`

Reemplazar el bloque de favicon actual por:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="shortcut icon" href="/favicon.ico" />
<meta name="theme-color" content="#3B82F6" />
<title>TaskFlow</title>
```

También borrar el `<link rel="icon" href="/vite.svg" />` si sigue ahí (el genérico de Vue/Vite).

### 3. Usar el logo en el login

Pegar `logo.svg` (o los PNG) en `src/assets/` y en tu componente `Login.vue`:

```vue
<script setup>
import logoUrl from '@/assets/logo.svg'
</script>

<template>
  <img :src="logoUrl" alt="TaskFlow" class="w-24 h-24 mx-auto mb-4" />
  <h1 class="text-2xl font-bold">TaskFlow</h1>
  <!-- ... resto del form ... -->
</template>
```

### 4. (Opcional) Manifest para PWA

Si en algún momento activas PWA, crear `public/site.webmanifest`:

```json
{
  "name": "TaskFlow",
  "short_name": "TaskFlow",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#3B82F6",
  "background_color": "#1e1e23",
  "display": "standalone"
}
```

Y añadir en el `<head>`:
```html
<link rel="manifest" href="/site.webmanifest" />
```

---

## Colores usados (por si necesitas hacer variantes)

- **Azul principal**: `#3B82F6` (favicon top gradient)
- **Azul profundo**: `#1D4ED8` (favicon bottom gradient)
- **Azul cielo**: `#0EA5E9` (logo top gradient)
- **Azul índigo**: `#2563EB` (logo bottom gradient)

Coinciden con la paleta de Tailwind (`blue-500`, `blue-700`, `sky-500`, `blue-600`).
