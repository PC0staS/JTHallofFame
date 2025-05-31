import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://muqyrnvuuncmcdkmlgqv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cXlybnZ1dW5jbWNka21sZ3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDc0NjYsImV4cCI6MjA2NDIyMzQ2Nn0.899kSwGTsPYS_anBdKpoBrzyxSTobEcQJkjLrwHsxiw";
const supabase = createClient(supabaseUrl, supabaseKey);
async function getPhotos() {
  try {
    const { data, error } = await supabase.from("photos").select("*").order("uploaded_at", { ascending: false });
    if (error) {
      console.error("Error fetching photos:", error);
      if (error.message.includes("does not exist")) {
        return [];
      }
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Exception in getPhotos:", error);
    return [];
  }
}
async function uploadPhoto(file, title, userId) {
  try {
    const base64 = await fileToBase64(file);
    const { data, error } = await supabase.from("photos").insert([
      {
        title,
        image_data: base64,
        image_name: file.name,
        uploaded_by: userId,
        uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]).select().single();
    if (error) {
      console.error("Error inserting photo record:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in uploadPhoto:", error);
    return null;
  }
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("photos").select("count", { count: "exact", head: true });
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
      message: "Base de datos conectada y tabla existe correctamente"
    };
  } catch (error) {
    return {
      connected: false,
      tableExists: false,
      message: `Error de conexión: ${error}`
    };
  }
}
async function createSampleData() {
  try {
    const samplePhotos = [
      {
        title: "Mi primer meme",
        image_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        image_name: "sample1.png",
        uploaded_by: "demo-user",
        uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        title: "Meme de prueba",
        image_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        image_name: "sample2.png",
        uploaded_by: "demo-user",
        uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const { data, error } = await supabase.from("photos").insert(samplePhotos).select();
    if (error) {
      console.error("Error creating sample data:", error);
      return false;
    }
    console.log("Sample data created successfully:", data);
    return true;
  } catch (error) {
    console.error("Error in createSampleData:", error);
    return false;
  }
}
async function createTableIfNotExists() {
  try {
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
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: createTableSQL
    });
    if (error) {
      console.error("Error creating table with RPC:", error);
      try {
        await supabase.from("photos").select("id").limit(1);
        console.log("Table already exists");
        return true;
      } catch (selectError) {
        console.error("Table does not exist and could not be created:", selectError);
        return false;
      }
    }
    console.log("Table created successfully or already exists");
    return true;
  } catch (error) {
    console.error("Error in createTableIfNotExists:", error);
    return false;
  }
}
async function testTableAccess() {
  try {
    const { data, error, count } = await supabase.from("photos").select("*", { count: "exact", head: true });
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
async function deletePhoto(photoId, currentUserId) {
  try {
    const { data: photo, error: fetchError } = await supabase.from("photos").select("uploaded_by").eq("id", photoId).single();
    if (fetchError) {
      console.error("Error fetching photo:", fetchError);
      return false;
    }
    if (photo.uploaded_by !== currentUserId) {
      console.error("User not authorized to delete this photo");
      return false;
    }
    const { error: deleteError } = await supabase.from("photos").delete().eq("id", photoId);
    if (deleteError) {
      console.error("Error deleting photo:", deleteError);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deletePhoto:", error);
    return false;
  }
}
export {
  checkDatabaseConnection as a,
  createSampleData as b,
  createTableIfNotExists as c,
  deletePhoto as d,
  getPhotos as g,
  testTableAccess as t,
  uploadPhoto as u
};
