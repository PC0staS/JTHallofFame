// src/lib/profile-sync.ts
import { supabase } from './supabase';

export async function ensureUserProfile(userId: string, userData?: any): Promise<boolean> {
  try {
    // Verificar si el perfil ya existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Si ya existe, no hacer nada
    if (existingProfile && !fetchError) {
      console.log('Profile already exists for user:', userId);
      return true;
    }

    // Si no existe, crear el perfil
    console.log('Creating profile for existing user:', userId);

    let profileData = {
      id: userId,
      username: null,
      email: null,
      first_name: null,
      last_name: null,
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Si tenemos userData, usarlo
    if (userData) {
      profileData = {
        ...profileData,
        username: userData.username || null,
        email: userData.email || userData.emailAddress || null,
        first_name: userData.firstName || null,
        last_name: userData.lastName || null,
        image_url: userData.imageUrl || null
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }

    console.log('Profile created successfully:', data);
    return true;

  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
}

export async function syncUserProfileFromClerk(userId: string): Promise<boolean> {
  try {
    // Hacer una llamada a la API para obtener datos actualizados de Clerk
    const response = await fetch('/api/user', {
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch user data from Clerk');
      return false;
    }

    const userData = await response.json();
    
    // Crear o actualizar el perfil
    const profileData = {
      id: userId,
      username: userData.username || null,
      email: userData.email || null,
      first_name: userData.firstName || null,
      last_name: userData.lastName || null,
      image_url: userData.imageUrl || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing profile:', error);
      return false;
    }

    console.log('Profile synced successfully:', data);
    return true;

  } catch (error) {
    console.error('Error in syncUserProfileFromClerk:', error);
    return false;
  }
}