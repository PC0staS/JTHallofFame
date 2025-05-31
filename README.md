# 🎭 Galería de Memes - MakeItMeme Hall of Fame

Una aplicación web moderna para compartir y disfrutar memes, construida con Astro, React, Clerk (autenticación), Bootstrap y Supabase.

## ✨ Características

- 🔐 **Autenticación segura** con Clerk
- 📱 **Diseño responsive** con Bootstrap
- 🖼️ **Galería de imágenes** con vista modal
- ☁️ **Almacenamiento en la nube** con Supabase
- 🎨 **Interfaz moderna** y amigable
- 📤 **Carga de imágenes** con preview
- 🎯 **Optimizado** para rendimiento

## 🚀 Instalación

### Prerequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Clerk](https://clerk.com/)
- Cuenta en [Supabase](https://supabase.com/)

### 1. Clonar y configurar

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 2. Configurar Clerk

1. Crea una aplicación en [Clerk Dashboard](https://dashboard.clerk.com/)
2. Obtén tu `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`
3. Agrega a tu `.env`:

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a Settings > API para obtener las keys
3. Agrega a tu `.env`:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Configurar Base de Datos

1. Ve a tu proyecto Supabase > SQL Editor
2. Ejecuta el contenido de `supabase-setup.sql`:

```sql
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_data TEXT NOT NULL,
  image_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Ejecutar la aplicación

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Preview
npm run preview
```

La aplicación estará disponible en `http://localhost:4323`

## 🔍 Testing & Verificación

### Páginas de Prueba
- `/setup` - Verificación de configuración
- `/test-db` - Prueba de base de datos y creación de datos de ejemplo
- `/dashboard` - Galería principal
- `/upload` - Subida de imágenes

### Estado Actual ✅
- ✅ Servidor ejecutándose en puerto 4323
- ✅ Autenticación con Clerk configurada
- ✅ Conexión a Supabase establecida
- ✅ Tabla de fotos creada
- ✅ Componentes React funcionando
- ✅ Bootstrap styling aplicado
- ⚠️ **Pendiente**: Configurar RLS policies (ejecutar `supabase-policies.sql`)

### Próximos Pasos
1. Ejecutar las políticas RLS en Supabase SQL Editor
2. Probar el flujo completo de subida de imágenes
3. Verificar la galería con datos reales

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── dashboard.astro     # Dashboard principal
│   ├── Gallery.tsx         # Galería de fotos
│   ├── navbar.astro        # Barra de navegación
│   ├── SignIn.astro        # Componente de login
│   └── Upload.tsx          # Formulario de subida
├── layouts/
│   └── Layout.astro        # Layout base
├── lib/
│   └── supabase.ts         # Cliente y funciones de DB
├── pages/
│   ├── index.astro         # Página principal
│   ├── dashboard.astro     # Dashboard
│   ├── upload.astro        # Página de subida
│   └── setup.astro         # Verificación de configuración
└── middleware.ts           # Middleware de Clerk
```

## 🛠️ Tecnologías Utilizadas

- **[Astro](https://astro.build/)** - Framework web moderno
- **[React](https://reactjs.org/)** - Componentes interactivos
- **[Clerk](https://clerk.com/)** - Autenticación y gestión de usuarios
- **[Supabase](https://supabase.com/)** - Base de datos PostgreSQL
- **[Bootstrap 5](https://getbootstrap.com/)** - Framework CSS
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático

## 🔧 Verificación del Setup

Visita estas páginas para verificar tu configuración:
- **`/setup`** - Verificación de conexión a Supabase y tabla
- **`/test-db`** - Prueba de operaciones de base de datos y creación de datos de ejemplo
- **`/dashboard`** - Vista de la galería principal
- **`/create-table`** - Creación automática de tablas (si es necesario)

### Checklist de Verificación:
- ✅ Conexión a Supabase
- ✅ Existencia de la tabla `photos`
- ⚠️ Políticas RLS configuradas (ejecutar `supabase-policies.sql`)
- ✅ Datos de ejemplo creados

## 📱 Uso

1. **Registrarse/Iniciar sesión** con Clerk
2. **Ver galería** de memes en el dashboard
3. **Subir nuevos memes** con el botón Upload
4. **Ver imágenes** en tamaño completo haciendo clic
5. **Navegar** entre las páginas

## 🎨 Personalización

### Estilos
- Los estilos están en `src/layouts/Layout.astro`
- Bootstrap se carga desde CDN
- Estilos custom en componentes individuales

### Base de Datos
- Las imágenes se almacenan como base64 en la base de datos
- Máximo 5MB por imagen
- Formatos soportados: JPG, PNG, GIF, WebP

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica las variables de entorno
- Asegúrate de que las URLs no tengan espacios o caracteres especiales

### Tabla no existe
- Ejecuta el script SQL en Supabase Dashboard
- Visita `/setup` para verificar el estado

### Error de autenticación
- Verifica las keys de Clerk
- Asegúrate de que el dominio esté configurado en Clerk

## 📄 Licencia

MIT License - puedes usar este código libremente para proyectos personales y comerciales.

---

¡Disfruta creando tu galería de memes! 🎭✨
