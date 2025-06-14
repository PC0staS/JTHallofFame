#!/usr/bin/env node

/**
 * Script para actualizar las URLs de image_data en la base de datos
 * Cambia todas las URLs de R2 (.r2.dev y memes.jonastown.es) por img.jonastown.es
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Las variables de entorno PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Convierte una URL de R2 a la nueva URL con img.jonastown.es
 */
function convertToNewDomain(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Patrones de URLs que queremos cambiar
  const patterns = [
    // URLs de desarrollo .r2.dev
    /https:\/\/[^\/]+\.r2\.dev\/([^?]+)/,
    // URLs anteriores con memes.jonastown.es
    /https:\/\/memes\.jonastown\.es\/([^?]+)/,
    // URLs que ya podrían estar con img.jonastown.es (no cambiar)
    /https:\/\/img\.jonastown\.es\/([^?]+)/
  ];

  // Si ya tiene img.jonastown.es, no cambiar
  if (url.includes('img.jonastown.es')) {
    return url;
  }

  // Intentar convertir con cada patrón
  for (const pattern of patterns.slice(0, 2)) { // Solo los primeros 2 patrones (excluir img.jonastown.es)
    const match = url.match(pattern);
    if (match) {
      const path = match[1];
      const newUrl = `https://img.jonastown.es/${path}`;
      console.log(`🔄 Convirtiendo: ${url} → ${newUrl}`);
      return newUrl;
    }
  }

  // Si no coincide con ningún patrón, devolver la URL original
  console.log(`⚠️  URL no reconocida: ${url}`);
  return url;
}

/**
 * Obtiene todas las fotos de la base de datos
 */
async function getAllPhotos() {
  console.log('📋 Obteniendo todas las fotos de la base de datos...');
  
  const { data, error } = await supabase
    .from('photos')
    .select('id, image_data, title, uploaded_by')
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener fotos: ${error.message}`);
  }

  console.log(`✅ Se encontraron ${data.length} fotos`);
  return data;
}

/**
 * Actualiza una foto con la nueva URL
 */
async function updatePhotoUrl(photoId, newUrl) {
  const { error } = await supabase
    .from('photos')
    .update({ image_data: newUrl })
    .eq('id', photoId);

  if (error) {
    throw new Error(`Error al actualizar foto ${photoId}: ${error.message}`);
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando actualización de URLs de imágenes...\n');

    // Obtener todas las fotos
    const photos = await getAllPhotos();

    if (photos.length === 0) {
      console.log('ℹ️  No hay fotos para procesar');
      return;
    }

    // Analizar qué fotos necesitan actualización
    const photosToUpdate = [];
    const photosAlreadyUpdated = [];
    const photosUnrecognized = [];

    for (const photo of photos) {
      const currentUrl = photo.image_data;
      const newUrl = convertToNewDomain(currentUrl);

      if (currentUrl === newUrl) {
        if (currentUrl.includes('img.jonastown.es')) {
          photosAlreadyUpdated.push(photo);
        } else {
          photosUnrecognized.push(photo);
        }
      } else {
        photosToUpdate.push({
          ...photo,
          currentUrl,
          newUrl
        });
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Fotos a actualizar: ${photosToUpdate.length}`);
    console.log(`   - Fotos ya actualizadas: ${photosAlreadyUpdated.length}`);
    console.log(`   - URLs no reconocidas: ${photosUnrecognized.length}`);

    if (photosUnrecognized.length > 0) {
      console.log(`\n⚠️  URLs no reconocidas:`);
      photosUnrecognized.forEach(photo => {
        console.log(`   - ${photo.title}: ${photo.image_data}`);
      });
    }

    if (photosToUpdate.length === 0) {
      console.log('\n✅ No hay fotos que necesiten actualización');
      return;
    }

    console.log(`\n🔄 Actualizando ${photosToUpdate.length} fotos...`);

    // Actualizar fotos
    let successCount = 0;
    let errorCount = 0;

    for (const photo of photosToUpdate) {
      try {
        await updatePhotoUrl(photo.id, photo.newUrl);
        console.log(`✅ Actualizada: ${photo.title} (${photo.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${photo.title} (${photo.id}): ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   - Fotos actualizadas exitosamente: ${successCount}`);
    console.log(`   - Errores: ${errorCount}`);

    if (successCount > 0) {
      console.log('\n✨ Las URLs han sido actualizadas exitosamente. Las imágenes ahora usan img.jonastown.es');
    }

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
main();
