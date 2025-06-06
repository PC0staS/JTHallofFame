import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('PUBLIC_SUPABASE_ANON_KEY environment variable is not set');
}
export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Photo {
  id: string;
  title: string;
  image_data: string; // Base64 encoded image
  image_name: string;
  uploaded_by: string;
  uploaded_at: string;
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      // Si la tabla no existe, devolver array vacío sin error
      if (error.message.includes('does not exist')) {
        return [];
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getPhotos:', error);
    return [];
  }
}

export async function uploadPhoto(
  file: File,
  title: string,
  userId: string,
  userName?: string
): Promise<Photo | null> {
  try {
    const base64 = await fileToBase64(file);

    // Usa SIEMPRE el userName recibido, y solo si no existe, usa el fallback
    const displayName = userName || `user-${userId.slice(-8)}`;

    const { data, error } = await supabase
      .from('photos')
      .insert([
        {
          title,
          image_data: base64,
          image_name: file.name,
          uploaded_by: displayName, // Aquí va el username real
          user_id: userId,
          uploaded_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting photo record:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in uploadPhoto:', error);
    return null;
  }
}

// Función helper para convertir File a Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function initializeDatabase(): Promise<boolean> {
  try {
    // Intentar crear la tabla si no existe
    const { error } = await supabase.rpc('create_photos_table_if_not_exists');
    
    if (error) {
      console.log('Intentando crear tabla mediante SQL directo...');
      
      // Si el RPC no funciona, intentar crear directamente
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS photos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          image_data TEXT NOT NULL,
          image_name TEXT NOT NULL,
          uploaded_by TEXT NOT NULL,
          uploaded_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error creating table:', createError);
        return false;
      }
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

export async function checkDatabaseConnection(): Promise<{
[x: string]: any; connected: boolean; tableExists: boolean; message: string 
}> {
  try {
    // Intentar hacer una consulta simple para verificar la conexión
    const { data, error } = await supabase
      .from('photos')
      .select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "photos" does not exist')) {
        return {
          connected: true,
          tableExists: false,
          message: 'Conectado a Supabase, pero la tabla "photos" no existe. Ejecuta el script SQL.'
        };
      }
      return {
        connected: false,
        tableExists: false,
        message: `Error de conexión: ${error.message}`
      };
    }

    return {
      connected: true,
      tableExists: true,
      message: 'Base de datos conectada y tabla existe correctamente'
    };
  } catch (error) {
    return {
      connected: false,
      tableExists: false,
      message: `Error de conexión: ${error}`
    };
  }
}

export async function createSampleData(): Promise<boolean> {
  try {
    // Datos de ejemplo con imágenes base64 pequeñas (1x1 pixel)
    const samplePhotos = [
      {
        title: "Mi primer meme",
        image_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        image_name: "sample1.png",
        uploaded_by: "demo-user",
        uploaded_at: new Date().toISOString()
      },
      {
        title: "Meme de prueba",
        image_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        image_name: "sample2.png", 
        uploaded_by: "demo-user",
        uploaded_at: new Date().toISOString()
      }
    ];

    const { data, error } = await supabase
      .from('photos')
      .insert(samplePhotos)
      .select();

    if (error) {
      console.error('Error creating sample data:', error);
      return false;
    }

    console.log('Sample data created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in createSampleData:', error);
    return false;
  }
}

export async function createTableIfNotExists(): Promise<boolean> {
  try {
    // SQL para crear la tabla si no existe
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS photos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        image_data TEXT NOT NULL,
        image_name TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ejecutar el SQL usando Supabase
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (error) {
      console.error('Error creating table with RPC:', error);
      
      // Método alternativo: intentar crear usando el cliente directo
      try {
        await supabase.from('photos').select('id').limit(1);
        console.log('Table already exists');
        return true;
      } catch (selectError) {
        console.error('Table does not exist and could not be created:', selectError);
        return false;
      }
    }

    console.log('Table created successfully or already exists');
    return true;
  } catch (error) {
    console.error('Error in createTableIfNotExists:', error);
    return false;
  }
}

export async function testTableAccess(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    // Intentar hacer una consulta SELECT simple
    const { data, error, count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        success: false,
        message: `Error al acceder a la tabla: ${error.message}`
      };
    }

    return {
      success: true,
      message: `Tabla accesible. Registros: ${count || 0}`,
      count: count || 0
    };
  } catch (error) {
    return {
      success: false,
      message: `Excepción al acceder a la tabla: ${error}`
    };
  }
}

export async function deletePhoto(photoId: string): Promise<boolean> {
  try {
    // Eliminar la foto sin comprobar propietario
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) {
      console.error('Error deleting photo:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    return false;
  }
}