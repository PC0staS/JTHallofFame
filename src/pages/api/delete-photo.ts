// API endpoint para eliminar fotos
// /api/delete-photo.ts

import type { APIRoute } from 'astro';
import { deletePhoto } from '../../lib/supabase';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const photoId = url.searchParams.get('id');

    if (!photoId) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere el ID de la foto' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Eliminar la foto de la base de datos
    const success = await deletePhoto(photoId);

    if (!success) {
      return new Response(JSON.stringify({ 
        error: 'Error al eliminar la foto' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Foto eliminada exitosamente'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error en la eliminación de foto:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al procesar la solicitud' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
