# Explicación del Proyecto: Galería de Memes

Este documento describe la función de cada componente, API, librería y página del proyecto.

---

## Estructura General

- **src/components/**: Componentes de React y Astro para la UI.
- **src/lib/**: Lógica de acceso a datos y utilidades.
- **src/pages/**: Páginas Astro y endpoints API.
- **src/layouts/**: Layouts base para las páginas.

---

## Componentes

### Gallery.tsx
- Muestra la galería de fotos.
- Permite ver, ampliar y eliminar fotos (botón visible para todos).
- Usa props: `photos`, `currentUserId`, `currentUserName`.
- Llama a `deletePhoto` para eliminar.

### Upload.tsx
- Formulario para subir imágenes.
- Usa props: `userId`, `userName`.
- Llama a `uploadPhoto` para guardar la imagen en Supabase.

### dashboard.astro
- Página principal de la galería.
- Carga fotos y usuario autenticado.
- Muestra alertas si hay errores de configuración.

### navbar.astro
- Barra de navegación superior.
- Enlaces a inicio, setup, subir imagen.

---

## Librerías

### supabase.ts
- Conexión y funciones para Supabase.
- Funciones:
  - `getPhotos()`: obtiene todas las fotos.
  - `uploadPhoto()`: sube una foto (guarda userId y username).
  - `deletePhoto()`: elimina una foto (sin restricción de propietario).
  - `testTableAccess()`: verifica acceso a la tabla.

### profile-sync.ts
- Sincroniza perfiles de usuarios con Supabase.
- Garantiza que cada usuario tenga un perfil en la tabla `profiles`.

---

## API

### /api/user.ts
- Devuelve los datos del usuario autenticado desde Clerk.
- Respuesta:
  ```json
  {
    "id": "user_xxx",
    "username": "pc0stas",
    "email": "correo@ejemplo.com",
    "firstName": "Pablo",
    "lastName": "Apellido",
    "displayName": "pc0stas"
  }
  ```

### /api/webhooks/clerk.ts
- Webhook para sincronizar usuarios de Clerk con la tabla `profiles` de Supabase.
- Se configura en el dashboard de Clerk.

---

## Páginas

### upload.astro
- Página para subir nuevas imágenes.
- Obtiene el usuario autenticado y su username.
- Renderiza el formulario de subida.

### dashboard.astro
- Página principal de la galería.
- Carga fotos y muestra la galería.

### create-table.astro
- Permite crear la tabla `photos` en Supabase si no existe.

### setup.astro
- Diagnóstico y ayuda para la configuración de la base de datos.

---

## Seguridad

- Autenticación: Clerk.
- Restricciones: Cualquier usuario autenticado puede borrar cualquier foto.
- Webhooks: Solo accesibles por Clerk.

---

## Flujo de subida

1. El usuario accede a `/upload`.
2. El frontend obtiene el username real desde `/api/user`.
3. Al subir una imagen, se guarda en Supabase con:
   - `user_id`: userId de Clerk.
   - `uploaded_by`: username de Clerk.
4. En la galería, se muestra "subido por {uploaded_by}".
5. Todos los usuarios pueden borrar cualquier foto.

---

## ¿Cómo reportar problemas?

- Para bugs, abre un issue en GitHub.
- Para vulnerabilidades, sigue las instrucciones en [SECURITY.md](SECURITY.md).
