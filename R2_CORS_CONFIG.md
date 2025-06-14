# Configuración CORS para Cloudflare R2

Este documento explica cómo configurar CORS (Cross-Origin Resource Sharing) correctamente en tu bucket de Cloudflare R2 para permitir el acceso desde tu aplicación web.

## Problema
Las solicitudes directas desde un navegador a los recursos almacenados en Cloudflare R2 pueden fallar debido a restricciones CORS. Esto resulta en errores como "Failed to fetch" o "Access to fetch at 'https://pub-xxx.r2.dev/...' has been blocked by CORS policy".

## Soluciones

### 1. Solución a corto plazo: Proxy API
Hemos implementado un endpoint proxy en `/api/r2-proxy` que permite a tu aplicación acceder a las imágenes de R2 evitando las restricciones CORS. Esta solución está actualmente funcionando en la aplicación.

**Ventajas:**
- No requiere cambios en la configuración de Cloudflare R2
- Funciona inmediatamente

**Desventajas:**
- Agrega carga adicional a tu servidor
- Puede aumentar la latencia al cargar imágenes

### 2. Solución recomendada: Configurar CORS en Cloudflare R2

Para configurar CORS en tu bucket de R2, sigue estos pasos:

1. Inicia sesión en el [Dashboard de Cloudflare](https://dash.cloudflare.com)
2. Navega a **R2** desde el menú lateral
3. Selecciona tu bucket "memes"
4. Ve a la pestaña **Configuración**
5. Desplázate hacia abajo hasta la sección **CORS**
6. Agrega las siguientes reglas CORS:

```json
[
  {
    "AllowedOrigins": ["https://jonastown.es", "https://memes.jonastown.es", "https://recopilaciones.jonastown.es", "http://localhost:4322", "http://localhost:4321"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 86400
  }
]
```

7. Guarda la configuración

**Importante:** Asegúrate de incluir todos los dominios desde los que se accederá a las imágenes, incluyendo tu dominio de producción y las URLs de desarrollo local.

## Verificación

Para verificar si la configuración CORS está funcionando correctamente:

1. Abre la herramienta de desarrollo en tu navegador (F12 o Cmd+Option+I en Mac)
2. Navega a la pestaña "Console" o "Red/Network"
3. Accede a una página con imágenes de R2 en tu sitio
4. Verifica que no aparezcan errores CORS en la consola
5. En la pestaña de red, verifica que las solicitudes a las imágenes tengan un estado 200 OK

## Referencias

- [Documentación de Cloudflare R2 CORS](https://developers.cloudflare.com/r2/api/s3/cors/)
- [Guía de MDN sobre CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
