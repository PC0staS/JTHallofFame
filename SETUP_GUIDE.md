# 🚀 Guía Rápida: Crear Tabla en Supabase

## Opción 1: Creación Manual (Recomendado)

### Paso 1: Accede a Supabase
1. Ve a https://supabase.com/dashboard
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto

### Paso 2: Abrir SQL Editor
1. En el menú lateral, busca "SQL Editor"
2. Haz clic en "SQL Editor"
3. Verás un editor de código SQL

### Paso 3: Ejecutar el Script
1. Copia el siguiente código:

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

2. Pega el código en el editor SQL
3. Haz clic en el botón "Run" (o presiona Ctrl+Enter)
4. Deberías ver un mensaje de éxito

### Paso 4: Verificar
1. Ve a la sección "Table Editor" en Supabase
2. Deberías ver la tabla "photos" listada
3. La tabla debería tener las columnas: id, title, image_data, image_name, uploaded_by, uploaded_at

## Opción 2: Desde la Aplicación

1. Ve a http://localhost:4323/create-table
2. Haz clic en "Crear Automáticamente"
3. Si funciona, verás un mensaje de éxito

## ✅ Verificación Final

Una vez creada la tabla:
1. Ve a http://localhost:4323/setup
2. Deberías ver "✅ Tabla existe"
3. Ve a http://localhost:4323/dashboard para ver la galería

## ❌ Problemas Comunes

### "Table already exists"
- La tabla ya está creada, puedes continuar

### "Permission denied"
- Verifica que tengas permisos de administrador en el proyecto Supabase
- Asegúrate de estar usando la clave correcta

### "Connection failed"
- Verifica las variables de entorno en .env
- Asegúrate de que las URLs y keys sean correctas

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que Supabase esté funcionando
3. Revisa la consola del navegador para errores
4. Ve a /setup para diagnosticar problemas
