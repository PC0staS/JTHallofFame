// API endpoint para obtener comentarios de una foto
// /api/comments.ts

import type { APIRoute } from 'astro';
import { getComments } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const photoId = url.searchParams.get('photoId');
    
    if (!photoId) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere el ID de la foto' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const comments = await getComments(photoId);

    return new Response(JSON.stringify({ 
      success: true,
      comments
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al obtener comentarios' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
