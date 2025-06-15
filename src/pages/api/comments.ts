// API endpoint para obtener comentarios de una foto
// /api/comments.ts

import type { APIRoute } from 'astro';
import { getComments } from '../../lib/supabase';
import { clerkClient } from '@clerk/astro/server';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const { url, locals } = context;
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

    // Obtener las imágenes de perfil de los usuarios únicos
    const uniqueUserIds = [...new Set(comments.map(comment => comment.user_id))];
    const userImages: Record<string, string> = {};

    try {
      // Obtener información de usuarios de Clerk
      for (const userId of uniqueUserIds) {
        try {
          const user = await clerkClient(context).users.getUser(userId);
          if (user.imageUrl) {
            userImages[userId] = user.imageUrl;
          }
        } catch (userError) {
          console.warn(`Could not fetch user ${userId}:`, userError);
          // Continuar con el siguiente usuario si falla
        }
      }
    } catch (clerkError) {
      console.warn('Error fetching user images from Clerk:', clerkError);
      // Continuar sin imágenes si falla Clerk
    }

    // Añadir las imágenes de perfil a los comentarios
    const commentsWithImages = comments.map(comment => ({
      ...comment,
      user_image_url: userImages[comment.user_id] || undefined
    }));

    return new Response(JSON.stringify({ 
      success: true,
      comments: commentsWithImages
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
