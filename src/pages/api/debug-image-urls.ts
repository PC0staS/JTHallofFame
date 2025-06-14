import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { getPublicUrl } from '../../lib/cloudflare-r2';

export const get: APIRoute = async () => {
  try {
    // Obtener URLs de imágenes de la base de datos
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .limit(10);

    if (error) {
      throw error;
    }

    // Comparar las URLs existentes con las que se generarían
    const analysisResults = photos.map(photo => {
      // Intentar extraer la ruta relativa de la URL existente
      let relativePath = '';
      if (photo.image_url) {
        // Si la URL es de R2, extraer la parte después del dominio
        if (photo.image_url.includes('.r2.dev/')) {
          relativePath = photo.image_url.split('.r2.dev/')[1];
        } 
        // Si es una URL de Supabase, usar el nombre de la imagen
        else if (photo.image_name) {
          relativePath = `${photo.user_id}/${photo.id}-${photo.image_name}`;
        }
      }

      // Generar la URL que se usaría ahora
      const currentGeneratedUrl = relativePath ? getPublicUrl(relativePath) : '';

      return {
        id: photo.id,
        stored_url: photo.image_url,
        extracted_path: relativePath,
        regenerated_url: currentGeneratedUrl,
        matches: photo.image_url === currentGeneratedUrl,
        image_name: photo.image_name,
        user_id: photo.user_id
      };
    });

    // Información sobre la configuración de R2
    const configInfo = {
      publicUrl: process.env.CLOUDFLARE_PUBLIC_URL,
      bucketName: process.env.CLOUDFLARE_BUCKET_NAME,
      accountIdFirstChars: process.env.CLOUDFLARE_ACCOUNT_ID?.substring(0, 8) + '...',
    };

    return new Response(JSON.stringify({
      message: "Análisis de URLs de imágenes",
      totalPhotos: photos.length,
      configInfo,
      results: analysisResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error en debug-image-urls:', error);
    return new Response(JSON.stringify({ error: 'Error al analizar URLs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
