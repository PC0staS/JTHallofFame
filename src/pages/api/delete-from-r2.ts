// API endpoint para eliminar archivos de Cloudflare R2
// /api/delete-from-r2.ts

import type { APIRoute } from 'astro';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Crear cliente R2 con variables de entorno del servidor
function createR2Client() {
  const accountId = import.meta.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = import.meta.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.CLOUDFLARE_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing Cloudflare R2 configuration');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere el filePath del archivo' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log('Attempting to delete file from R2:', filePath);

    const bucketName = import.meta.env.CLOUDFLARE_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('Missing CLOUDFLARE_BUCKET_NAME');
    }

    // Crear cliente R2 y eliminar archivo
    const r2Client = createR2Client();
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });

    await r2Client.send(command);

    console.log('File deleted successfully from R2:', filePath);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Archivo eliminado de R2 exitosamente',
      filePath
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error eliminando archivo de R2:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al eliminar archivo de R2',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
