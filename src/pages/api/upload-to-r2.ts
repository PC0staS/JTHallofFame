// API endpoint para subir archivos a Cloudflare R2
// /api/upload-to-r2.ts

import type { APIRoute } from 'astro';
import { uploadToR2 } from '../../lib/cloudflare-r2';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar si es una solicitud multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere un formulario multipart/form-data' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Parsear el formulario
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const userId = formData.get('userId') as string;
    const userName = formData.get('userName') as string;

    // Validar datos
    if (!file || !title || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Se requieren todos los campos: file, title, y userId' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Generar nombre único para el archivo
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Cloudflare R2
    const imageUrl = await uploadToR2(uniqueFileName, buffer, file.type);    // Normalizar el username para consistencia
    let normalizedUserName = userName;
    if (!normalizedUserName || normalizedUserName.trim() === '') {
      normalizedUserName = `user-${userId.slice(-8)}`;
    } else {
      // Si es un email, extraer la parte antes del @
      if (normalizedUserName.includes('@')) {
        normalizedUserName = normalizedUserName.split('@')[0];
      }
      // Si empieza con "user_" (formato de Clerk), convertir a nuestro formato
      if (normalizedUserName.startsWith('user_')) {
        const userIdPart = normalizedUserName.substring(5);
        normalizedUserName = `user-${userIdPart.slice(-8)}`;
      }
    }

    // También guardar referencia en Supabase para mantener compatibilidad durante migración
    const { data, error } = await supabase
      .from('photos')
      .insert([
        {
          title,
          image_data: imageUrl, // Almacenar URL de R2 en image_data
          image_name: file.name,
          uploaded_by: normalizedUserName,
          user_id: userId,
          uploaded_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al guardar en Supabase:', error);
      // Continuar aunque falle Supabase, ya tenemos el archivo en R2
    }

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl,
      id: data?.id || timestamp.toString(),
      message: 'Archivo subido exitosamente a Cloudflare R2'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error en la carga de archivo:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al procesar la solicitud' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
