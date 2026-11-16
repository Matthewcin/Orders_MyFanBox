# MyFanBox Gestión v2

Aplicación React + Vite con API Node/Express y PostgreSQL en NeonDB. La base de datos ya no está en el navegador: **toda la información de negocio se lee y escribe en PostgreSQL desde el servidor**. La conexión `DATABASE_URL` nunca se expone al frontend.

## Qué se corrigió

- Eliminada la generación automática de 124 pedidos ficticios y la persistencia de pedidos/inventario/catálogo en `localStorage`.
- Pedidos, catálogo, avance de inventario y parámetros de tienda se guardan en NeonDB dentro de una transacción PostgreSQL.
- En incógnito u otro equipo, al iniciar sesión se descargan los mismos datos del servidor.
- Indicador de estado conectado/error consultando `/api/health`; no se disfraza una desconexión como "modo local".
- El backend crea y actualiza las tablas al arrancar.
- Las credenciales de administrador se guardan con `scrypt`; sesiones firmadas en el servidor y protegidas por expiración.
- Compatibilidad de inicio de sesión con hashes SHA-256 heredados que ya existieran en la tabla `mfb_admin_config`; al iniciar sesión correctamente se migran a `scrypt`.
- Consola SQL limitada a consultas de lectura.
- Nuevo apartado **Set Config** para marca, colección, centro de despacho, transportadora, descuento de combo y Google Maps API Key.
- 12 temas de apariencia; el tema elegido y las opciones operativas se comparten en NeonDB entre dispositivos.
- Rehechos los paneles de mapa y seguimiento/consulta de pedido que tenían JSX incompleto.
- Corregido el guardado de credenciales de administrador y validación para no crear pedidos sin un producto válido.

## Requisitos

- Node.js 20 o superior.
- GitHub Pages para alojar el frontend estático.
- Un servicio Node/Express independiente (por ejemplo Render Web Service) para la API.
- Una base PostgreSQL de Neon.

**Arquitectura:** GitHub Pages publica React; Render ejecuta la API y conserva las claves privadas; NeonDB almacena los datos. GitHub Pages no puede ejecutar Node.js ni conectarse directamente a PostgreSQL.

## Configuración local

1. Descomprime el proyecto y abre una terminal en la carpeta `myfanbox_v2`.
2. Ejecuta `npm install`.
3. Copia `.env.example` como `.env`.
4. Completa estas variables en `.env`:

   - `DATABASE_URL`: connection string PostgreSQL de Neon, con `sslmode=require`.
   - `MFB_ADMIN_USERNAME`: usuario inicial del panel.
   - `MFB_ADMIN_PASSWORD`: contraseña inicial, mínimo 10 caracteres.
   - `MFB_SESSION_SECRET`: secreto aleatorio de al menos 32 caracteres.

5. Abre dos terminales:

   Terminal 1 (API y conexión a Neon):

   ```bash
   npm run dev:server
   ```

   Terminal 2 (frontend):

   ```bash
   npm run dev
   ```

6. Abre la URL que muestra Vite (normalmente `http://localhost:5173`). El proxy reenvía `/api` a `http://localhost:3001`.
7. Entra en `#/1620` e inicia sesión con el usuario y contraseña definidos en `.env`.

El servidor crea automáticamente las tablas y el administrador inicial la primera vez que se inicia.

## Publicar con GitHub Pages + Render + NeonDB

Se conserva GitHub Pages para la página. Solo el backend se despliega en Render, porque GitHub Pages no ejecuta Node/Express y no debe recibir secretos de PostgreSQL.

### 1. Desplegar la API en Render

1. Sube el proyecto completo a un repositorio GitHub.
2. En Render crea un **Web Service** conectado a ese repositorio. Si `myfanbox_v2` es la raíz del repositorio, deja Root Directory vacío. Si está dentro de una subcarpeta, configura esa carpeta como Root Directory.
3. Build command: `npm install && npm run build`.
4. Start command: `npm start`.
5. Configura estas Environment Variables privadas:

   - `DATABASE_URL`: connection string PostgreSQL de Neon, con SSL requerido.
   - `MFB_ADMIN_USERNAME`: usuario inicial del panel.
   - `MFB_ADMIN_PASSWORD`: contraseña inicial, mínimo 10 caracteres.
   - `MFB_SESSION_SECRET`: secreto aleatorio de 32 caracteres o más.
   - `MFB_ALLOWED_ORIGINS`: origen exacto de GitHub Pages, por ejemplo `https://TU-USUARIO.github.io`. No agregues la ruta `/nombre-repositorio/`. Si usas dominio personalizado, agrega también su origen, separado por coma.

6. Cuando Render esté activo, abre `https://TU-SERVICIO.onrender.com/api/health`. Debe responder `{"ok":true,"database":"connected","result":1}`.

### 2. Configurar GitHub Pages

1. En el repositorio GitHub abre **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. En **Settings → Secrets and variables → Actions → Variables**, crea una variable de repositorio:

   - Nombre: `MFB_API_BASE_URL`
   - Valor: URL pública de Render, por ejemplo `https://TU-SERVICIO.onrender.com` (sin `/` al final y sin `/api`).

   Esta URL no es una contraseña; es el destino público de la API. No pongas `DATABASE_URL` ni ninguna clave privada aquí.

4. Confirma que el workflow `.github/workflows/deploy-pages.yml` esté en el repositorio.
5. Haz `git push` a `main` o `master`. GitHub Actions construye `dist/` y lo publica automáticamente en Pages.

El proyecto usa `base: './'`, por lo que los assets funcionan tanto en un dominio raíz como en una URL de proyecto de GitHub Pages (`https://TU-USUARIO.github.io/TU-REPOSITORIO/`).

### 3. Verificar la conexión y el acceso desde incógnito

1. Comprueba primero `https://TU-SERVICIO.onrender.com/api/health`. Tiene que decir `database: connected`.
2. Abre tu sitio de GitHub Pages e inicia sesión con el usuario/contraseña definidos en Render.
3. Crea un pedido de prueba y confirma que se guarda.
4. Abre la misma URL de GitHub Pages en incógnito, inicia sesión y comprueba que aparece el mismo pedido.

Si falla desde Pages pero `/api/health` funciona al abrirlo directamente, revisa `MFB_ALLOWED_ORIGINS` en Render y que `MFB_API_BASE_URL` en GitHub tenga la URL correcta. Después de cambiar una variable de GitHub Actions, vuelve a ejecutar el workflow para reconstruir el frontend. Después de cambiar CORS en Render, espera al nuevo deploy del backend.

### Desarrollo local

Para trabajar localmente, usa `npm run dev:server` y `npm run dev`. Vite reenvía `/api` al servidor local. Si defines `VITE_API_BASE_URL` en el build, la aplicación llamará a esa API externa.

## Datos antiguos del navegador

Esta versión ya no lee el antiguo `localStorage` como base de datos y no vuelve a generar pedidos de demostración. Por seguridad no copia automáticamente el contenido del navegador anterior, porque podía contener los 124 pedidos ficticios del prototipo mezclados con datos reales. Si tenías pedidos reales guardados solo en un navegador, conserva una copia/exportación de esa versión antes de reemplazarla: esos datos locales no aparecen mágicamente en NeonDB. La base nueva arranca con el catálogo base, pero sin pedidos ficticios.

## Prueba de persistencia entre navegadores

1. Inicia sesión como administrador en el navegador normal.
2. Crea un pedido y espera a que aparezca “Guardado” / actualice la hora de sincronización.
3. Abre `https://TU-SERVICIO.onrender.com/api/health`: `database` debe ser `connected`.
4. Abre la app en incógnito, entra a `#/1620`, inicia sesión con las mismas credenciales y comprueba el pedido.

La sesión es independiente por navegador, pero los datos se comparten porque se leen desde la misma base NeonDB.

## Estructura

```text
myfanbox_v2/
├── server/index.mjs       # API, autenticación y conexión PostgreSQL
├── src/App.tsx            # Aplicación de gestión
├── src/main.tsx           # Punto de entrada React
├── src/index.css          # Tailwind base
├── schema.sql             # Esquema PostgreSQL legible
├── vite.config.js         # Proxy /api en desarrollo
├── render.yaml            # Configuración base de Render
├── .github/workflows/     # Deploy automático a GitHub Pages
├── server/initial-catalog.json # Catálogo inicial que se siembra una sola vez en Neon
├── .env.example           # Variables de ejemplo (sin secretos reales)
└── package.json
```

## Nota sobre la conexión real

El proyecto queda preparado para conectarse realmente a NeonDB a través del backend. No se puede declarar que tu instancia ya quedó conectada desde aquí porque no se proporcionó tu `DATABASE_URL` ni acceso a tu servicio Render. La conexión quedará activa al configurar esos secretos y desplegar el backend; si no están, `/api/health` lo informará y la aplicación no fingirá que está guardando localmente.
