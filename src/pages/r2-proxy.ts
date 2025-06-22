// Endpoint público para proxy de imágenes R2 - sin protección de Clerk
// Este archivo debe estar fuera de la estructura 'src/pages/api/' para evitar el middleware de Clerk

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Obtener la URL de la imagen desde el query parameter
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');
    
    console.log('R2 Proxy request for URL:', imageUrl);
    
    if (!imageUrl) {
      console.error('No URL parameter provided');
      return new Response('URL parameter is required', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    
    // Validar que la URL sea de nuestro bucket R2 o dominios permitidos
    const r2PublicUrl = process.env.CLOUDFLARE_PUBLIC_URL;
    const isValidR2Url = imageUrl.includes('.r2.dev/') || 
                        imageUrl.includes('memes.jonastown.es/') || 
                        imageUrl.includes('img.jonastown.es/') ||
                        imageUrl.includes('pub-') ||
                        imageUrl.includes('r2.cloudflarestorage.com') ||
                        (r2PublicUrl && imageUrl.startsWith(r2PublicUrl));
    
    if (!isValidR2Url) {
      console.error('Invalid URL, not from R2:', imageUrl);
      return new Response('Invalid URL, must be from our R2 bucket', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    
    console.log('Fetching image from R2:', imageUrl);
    
    // Hacer la solicitud a R2
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`Error fetching image: ${response.status} ${response.statusText}`);
      return new Response(`Error fetching image: ${response.status} ${response.statusText}`, { 
        status: response.status,
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    
    // Obtener el tipo de contenido y el buffer
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    
    console.log('Successfully fetched image, content-type:', contentType, 'size:', buffer.byteLength);
    
    // Devolver la imagen con los encabezados adecuados
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
        'Access-Control-Allow-Origin': '*' // Permitir cualquier origen
      }
    });
  } catch (error) {
    console.error('Error in r2-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Error: ${errorMessage}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' } 
    });
  }
}
