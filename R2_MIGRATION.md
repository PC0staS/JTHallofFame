# Migración de Supabase a Cloudflare R2

Este documento explica cómo se ha migrado el almacenamiento de imágenes de Supabase a Cloudflare R2 para obtener más espacio de almacenamiento.

## ¿Por qué migramos?

Cloudflare R2 ofrece:
- Más espacio de almacenamiento
- Mejor rendimiento global
- Menores costos para volúmenes grandes
- Sin cargos por egreso de datos

## Configuración de Cloudflare R2

### 1. Crea una cuenta en Cloudflare

Si aún no la tienes, regístrate en [Cloudflare](https://dash.cloudflare.com/sign-up).

### 2. Activa R2 Storage

1. En el dashboard de Cloudflare, ve a "R2" en la barra lateral
2. Sigue las instrucciones para activar R2

### 3. Crea un bucket

1. Una vez activado R2, crea un nuevo bucket (en este caso, "memes")
2. Configura el bucket como "público" para que los archivos sean accesibles desde la web:
   - En la sección "Public Development URL" haz clic en el botón **Enable**
   - O bien, configura un Custom Domain para acceso en producción

### 4. Genera claves de API

1. En R2, haz clic en "**Manage R2 API Tokens**" (normalmente en la esquina superior derecha)
2. Haz clic en "**Create API Token**"
3. Selecciona "**Create S3 Auth Token**"
4. Dale un nombre descriptivo (ej: "JTHallofFame Integration")
5. Selecciona permisos de lectura y escritura para tu bucket "memes"
6. Haz clic en "**Create API Token**"
7. **¡IMPORTANTE!** Guarda el Access Key ID y Secret Access Key que te muestra, ya que la clave secreta solo se muestra una vez

### 5. Actualiza las variables de entorno

Para el bucket de "memes" creado en la región WEUR, tu archivo `.env` debe contener:

```
CLOUDFLARE_ACCOUNT_ID=4bf7745774e5b638a5a1acd2a33c00ac
CLOUDFLARE_ACCESS_KEY_ID=TU_ACCESS_KEY_ID
CLOUDFLARE_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY
CLOUDFLARE_BUCKET_NAME=memes
CLOUDFLARE_PUBLIC_URL=https://pub-4bf7745774e5b638a5a1acd2a33c00ac.r2.dev
```

El Account ID lo puedes obtener de la URL de la API S3 que se muestra en la configuración del bucket.

## Ejecutar la migración

Para migrar los datos existentes de Supabase a R2:

```bash
node migrate-to-r2.js
```

Este script:
1. Obtiene todas las imágenes de Supabase
2. Las convierte de base64 a archivos binarios
3. Las sube a tu bucket de R2
4. Actualiza los registros en Supabase para usar las nuevas URLs de R2

## Cambios en el código

El proyecto ha sido actualizado para usar R2 en lugar de Supabase Storage:

1. Nuevo módulo: `src/lib/cloudflare-r2.ts` - Proporciona funciones para interactuar con R2
2. Nuevo módulo: `src/lib/r2-storage.ts` - Adapta las operaciones de archivo para usar R2
3. Endpoint de API: `/api/upload-to-r2.ts` - Maneja subidas directas a R2
4. Componentes actualizados para usar URLs en lugar de base64

## Uso en producción

Para implementar en producción:

1. Asegúrate de que las variables de entorno estén configuradas en tu plataforma de hosting
2. Ejecuta la migración una vez
3. Verifica que las imágenes se muestren correctamente
4. Cuando todo funcione, puedes eliminar los datos base64 de Supabase para ahorrar espacio

## Rollback

Si necesitas volver a Supabase Storage:

1. Los datos originales permanecen en Supabase hasta que los elimines manualmente
2. Solo necesitas revertir los cambios de código para volver a usar Supabase

## Más información

- [Documentación de Cloudflare R2](https://developers.cloudflare.com/r2/)
- [API de S3 para R2](https://developers.cloudflare.com/r2/api/s3/)
