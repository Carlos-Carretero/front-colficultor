# Front Colficultor

Frontend web de **Colficultor** construido en HTML/CSS/JavaScript vanilla. Implementa autenticación, catálogo, paneles por rol y flujos de e-commerce consumiendo la API del backend.

## Tabla de contenido

- [Tecnologías detectadas](#tecnologías-detectadas)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Build y producción](#build-y-producción)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Organización funcional](#organización-funcional)
- [Navegación y rutas](#navegación-y-rutas)
- [Gestión de estado](#gestión-de-estado)
- [Consumo de API](#consumo-de-api)
- [Autenticación en frontend](#autenticación-en-frontend)
- [Responsive e identidad visual](#responsive-e-identidad-visual)
- [Convenciones inferidas](#convenciones-inferidas)
- [Problemas comunes](#problemas-comunes)
- [Estado del módulo](#estado-del-módulo)

## Tecnologías detectadas

- HTML5
- CSS3
- JavaScript vanilla
- Google Fonts (`Poppins`)
- Font Awesome (CDN)
- Google reCAPTCHA v3 (script en `index.html`)

## Requisitos previos

- Navegador moderno
- Un servidor HTTP estático para evitar restricciones de CORS/origen
- Backend activo (`back-colficultor`) para funcionalidades dinámicas

## Instalación

El módulo es estático.

```bash
cd front-colficultor
```

## Configuración

No existe archivo `.env` del frontend en el repositorio.

La configuración de API está en `js/config.js`:

- Local (`localhost`/`127.0.0.1`): usa `http://localhost:8000`.
- Producción: usa `https://back-colficultor.onrender.com`.

También se define en `app.js` una clave de sitio reCAPTCHA para acciones de auth:

- `RECAPTCHA_SITE_KEY`.

## Ejecución

Ejemplo con servidor estático en `5500`:

```bash
cd front-colficultor
python -m http.server 5500
```

Abrir: `http://localhost:5500`

> El puerto `5500` está alineado con orígenes CORS permitidos por el backend.

## Build y producción

- **Build**: no implementado (no hay pipeline de build en este módulo).
- **Preview**: equivalente a servir archivos estáticos con cualquier servidor HTTP.
- **Producción**: despliegue estático del contenido de `front-colficultor/`.

## Estructura de carpetas

```text
front-colficultor/
├── index.html
├── reset-password.html
├── css/
│   ├── styles.css
│   └── reset-password.css
├── js/
│   ├── config.js
│   ├── app.js
│   └── reset-password.js
└── img/
    ├── logo.svg
    ├── logo-icono.svg
    └── logo-nombre.svg
```

## Organización funcional

- `index.html`
  - Estructura principal (hero, filtros, catálogo, auth modal, panel de usuario, paneles de rol, notificaciones).
- `js/config.js`
  - Resolución de URL base del backend según entorno.
- `js/app.js`
  - Script principal con lógica de:
    - autenticación local y Google,
    - carga de perfil y menú por rol,
    - catálogo y filtros,
    - carrito,
    - órdenes y pagos,
    - reseñas,
    - PQR (usuario/admin),
    - notificaciones,
    - paneles administrativos.
- `reset-password.html` + `js/reset-password.js`
  - Flujo de validación de token y restablecimiento de contraseña.
- `css/styles.css`
  - Sistema visual principal y componentes.
- `css/reset-password.css`
  - Estilos específicos de recuperación.

## Navegación y rutas

Rutas de frontend detectadas:

- `/index.html` (principal)
- `/reset-password.html?token=...` (restablecimiento)

La navegación interna es por secciones/modales/paneles dinámicos (no router SPA).

## Gestión de estado

No hay librería de estado global.

Estado manejado con:

- Variables JS en memoria (ej. `currentUser`).
- Persistencia de sesión en `localStorage` (`access_token`).
- Renderizado imperativo del DOM para paneles, badges, listas y estados de carga/error.

## Consumo de API

### Endpoints consumidos (agrupados)

- Auth: `/api/auth/*`
- Google OAuth: `/api/auth/google/*`
- Usuarios: `/api/users/*`
- Catálogo/productos: `/api/productos*`, `/api/products/*/images`
- Carrito: `/api/carrito*`
- Órdenes: `/api/ordenes*`
- Pagos: `/api/pagos*`
- Reseñas: `/api/resenas*`, `/api/productos/{id}/resenas`
- PQR: `/api/pqr*`
- Notificaciones: `/api/notificaciones*`
- Reportes: `/api/reportes/*`

## Autenticación en frontend

- Login/registro local contra `/api/auth/login` y `/api/auth/register`.
- JWT guardado en `localStorage`.
- Logout invocando `/api/auth/logout`.
- Recuperación de contraseña:
  - solicitar token: `/api/auth/forgot-password`
  - validar token: `/api/auth/reset-password/validate`
  - cambio de contraseña: `/api/auth/reset-password`
- OAuth Google:
  - inicia redirigiendo a `/api/auth/google/init`
  - completa registro de nuevos usuarios con `/api/auth/google/complete`.
- reCAPTCHA v3 aplicado en login/registro/forgot password mediante header `x-recaptcha-token`.

## Responsive e identidad visual

### Responsive

Implementado con múltiples breakpoints en CSS (`max-width` y `min-width`) para:

- navegación móvil/escritorio,
- layout de catálogo por columnas adaptativas,
- paneles y formularios responsivos.

### Identidad visual

Patrón visual detectado:

- Paleta cálida asociada a café (`--color-primary`, `--color-secondary`, tonos tierra).
- Tipografía principal `Poppins`.
- Variables CSS centralizadas en `:root`.
- Uso de gradientes, sombras y tarjetas para jerarquía visual.
- Iconografía con Font Awesome.

## Convenciones inferidas

- Nomenclatura de IDs y clases descriptiva por módulo (`pqr*`, `catalog*`, `buyer*`, `admin*`).
- Manejo consistente de feedback al usuario con toasts (`showAppToast`) y mensajes de estado.
- Uso de `fetch` y serialización JSON/URLSearchParams según endpoint.
- Renderizado condicional por rol (`comprador`, `caficultor`, `admin`).

## Problemas comunes

- **No carga datos del backend**: validar `API_CONFIG.BASE_URL` y que backend esté activo.
- **Error de CORS**: revisar `BACKEND_CORS_ORIGINS` del backend.
- **Login/registro bloqueado**: confirmar carga de script de reCAPTCHA y configuración backend.
- **Google OAuth no completa**: revisar `FRONTEND_URL`/`GOOGLE_CALLBACK_URL` y credenciales de Google.
- **Errores en pagos mock**: backend requiere `WEBHOOK_SECRET` y en frontend se usa header `x-mock-webhook-token` en entorno dev.
