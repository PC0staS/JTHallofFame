import type { APIRoute } from 'astro';

export const get: APIRoute = async ({ request }) => {
  try {
    // Obtener la URL de la imagen desde el query parameter
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response('URL parameter is required', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    
    // Validar que la URL sea de nuestro bucket R2
    const r2PublicUrl = process.env.CLOUDFLARE_PUBLIC_URL;
    if (!imageUrl.startsWith(r2PublicUrl || '')) {
      return new Response('Invalid URL, must be from our R2 bucket', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    
    // Hacer la solicitud a R2
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return new Response(`Error fetching image: ${response.status} ${response.statusText}`, { 
        status: response.status,
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    
    // Obtener el tipo de contenido y el buffer
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    
    // Devolver la imagen con los encabezados adecuados
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
        'Access-Control-Allow-Origin': '*' // Permitir cualquier origen (puedes restringir a dominios específicos)
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
