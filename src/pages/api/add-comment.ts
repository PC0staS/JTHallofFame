// API endpoint para añadir un comentario
// /api/add-comment.ts

import type { APIRoute } from 'astro';
import { addComment } from '../../lib/supabase';
import { clerkClient } from '@clerk/astro/server';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const { request, locals } = context;
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
    const { photoId, commentText } = body;

    if (!photoId || !commentText?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Se requieren photoId y commentText' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Obtener el nombre real del usuario desde Clerk
    let displayName = `user-${auth.userId.slice(-8)}`;
    try {
      const user = await clerkClient(context).users.getUser(auth.userId);
      displayName = user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || displayName;
    } catch (userError) {
      console.warn('Could not fetch user data for comment:', userError);
      // Usar el fallback si falla
    }

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
