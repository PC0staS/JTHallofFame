export interface Photo {
  id: string;
  title: string;
  image_data: string; // URL de R2
  image_name: string;
  uploaded_by: string;
  uploaded_at: string;
  user_id?: string;
}

// Subir foto a R2 usando el endpoint API
export async function uploadPhoto(
  file: File,
  title: string,
  userId: string,
  userName?: string
): Promise<Photo | null> {
  try {
    // Crear FormData para enviar al endpoint
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('userId', userId);
    if (userName) {
      formData.append('userName', userName);
    }

    // Enviar al endpoint API
    const response = await fetch('/api/upload-to-r2', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en la subida:', errorData);
      return null;
    }    const result = await response.json();
    
    // Normalizar el username para consistencia
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
    
    // Crear el objeto Photo compatible
    const newPhoto: Photo = {
      id: result.id,
      title,
      image_data: result.imageUrl,
      image_name: file.name,
      uploaded_by: normalizedUserName,
      uploaded_at: new Date().toISOString(),
      user_id: userId
    };

    return newPhoto;
  } catch (error) {
    console.error('Error in uploadPhoto to R2:', error);
    return null;
  }
}
