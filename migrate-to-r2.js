// Migración de Supabase a Cloudflare R2
// Guardar este archivo como migrate-to-r2.js en la raíz del proyecto

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Supabase credentials
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cloudflare R2 credentials
const r2AccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const r2AccessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const r2BucketName = process.env.CLOUDFLARE_BUCKET_NAME;
const r2PublicUrl = process.env.CLOUDFLARE_PUBLIC_URL;

// Inicializar cliente de R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

// Función para convertir Base64 a Buffer
function base64ToBuffer(base64String) {
  // Eliminar el prefijo "data:image/jpeg;base64," si existe
  let base64 = base64String;
  if (base64.includes(';base64,')) {
    base64 = base64.split(';base64,')[1];
  }
  return Buffer.from(base64, 'base64');
}

// Función para obtener la extensión MIME
function getMimeTypeExtension(base64String) {
  if (!base64String.includes(';base64,')) {
    return 'jpg'; // valor predeterminado si no hay información MIME
  }
  
  const mimeType = base64String.split(';base64,')[0].split(':')[1];
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

// Función para migrar archivos
async function migrateFiles() {
  try {
    console.log('Iniciando migración de Supabase a Cloudflare R2...');

    // Obtener todas las fotos de Supabase
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*');

    if (error) {
      console.error('Error al obtener fotos de Supabase:', error);
      return;
    }

    console.log(`Se encontraron ${photos.length} fotos para migrar.`);

    // Migrar cada foto
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      console.log(`Migrando foto ${i+1}/${photos.length}: ${photo.title}`);

      try {
        // Solo procesar si hay datos de imagen
        if (!photo.image_data) {
          console.log(`La foto ${photo.id} no tiene datos de imagen. Omitiendo...`);
          continue;
        }

        // Obtener la extensión de archivo del MIME type
        const extension = getMimeTypeExtension(photo.image_data);
        
        // Generar un nombre de archivo único
        const userId = photo.user_id || 'unknown';
        const timestamp = new Date(photo.uploaded_at).getTime();
        const uniqueFileName = `${userId}/${timestamp}-${photo.id}.${extension}`;
        
        // Convertir la imagen Base64 a Buffer
        const buffer = base64ToBuffer(photo.image_data);
        
        // Determinar el tipo MIME
        let contentType = 'image/jpeg'; // predeterminado
        if (photo.image_data.includes('data:')) {
          contentType = photo.image_data.split(';')[0].split(':')[1];
        }
        
        // Subir a Cloudflare R2
        await r2Client.send(new PutObjectCommand({
          Bucket: r2BucketName,
          Key: uniqueFileName,
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read',
        }));
        
        // Construir la URL pública
        const imageUrl = `${r2PublicUrl}/${uniqueFileName}`;
        
        // Actualizar el registro en Supabase con la nueva URL de R2
        const { error: updateError } = await supabase
          .from('photos')
          .update({ 
            image_url: imageUrl,
            // No eliminamos image_data todavía como respaldo
          })
          .eq('id', photo.id);
        
        if (updateError) {
          console.error(`Error al actualizar registro de ${photo.id}:`, updateError);
        } else {
          console.log(`✓ Foto ${photo.id} migrada exitosamente a R2.`);
        }
      } catch (photoError) {
        console.error(`Error al migrar la foto ${photo.id}:`, photoError);
      }
    }
    
    console.log('Migración completada!');
    
  } catch (error) {
    console.error('Error general en la migración:', error);
  }
}

// Ejecutar la migración
migrateFiles().catch(console.error);
