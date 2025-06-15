// API endpoint para eliminar un comentario
// /api/delete-comment.ts

import type { APIRoute } from 'astro';
import { deleteComment } from '../../lib/supabase';

export const prerender = false;

export const DELETE: APIRoute = async ({ url, locals }) => {
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

    const commentId = url.searchParams.get('id');
    
    if (!commentId) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere el ID del comentario' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const success = await deleteComment(commentId, auth.userId);

    if (!success) {
      return new Response(JSON.stringify({ 
        error: 'Error al eliminar el comentario o no tienes permisos' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Comentario eliminado exitosamente'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al procesar la solicitud' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
