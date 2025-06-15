// API endpoint para añadir un comentario
// /api/add-comment.ts

import type { APIRoute } from 'astro';
import { addComment } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth();
    
    if (!auth.userId) {
      return new Response(JSON.stringify({ 
        error: 'Usuario no autenticado' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const body = await request.json();
    const { photoId, commentText, userName } = body;

    if (!photoId || !commentText?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Se requieren photoId y commentText' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Usar el userName proporcionado o crear un fallback
    const displayName = userName || `user-${auth.userId.slice(-8)}`;

    const comment = await addComment(photoId, auth.userId, displayName, commentText);

    if (!comment) {
      return new Response(JSON.stringify({ 
        error: 'Error al añadir el comentario' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      comment
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al procesar la solicitud' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
