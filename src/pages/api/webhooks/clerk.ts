// src/pages/api/webhooks/clerk.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { type, data } = payload;

    console.log('Webhook received:', { type, userId: data?.id });

    if (type === 'user.created' || type === 'user.updated') {
      const { 
        id, 
        username, 
        email_addresses, 
        first_name, 
        last_name,
        image_url 
      } = data;
      
      const profileData = {
        id,
        username: username || null,
        email: email_addresses?.[0]?.email_address || null,
        first_name: first_name || null,
        last_name: last_name || null,
        image_url: image_url || null,
        updated_at: new Date().toISOString()
      };

      console.log('Upserting profile:', profileData);

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting profile:', error);
        return new Response('Database error', { status: 500 });
      }

      console.log('Profile updated successfully');
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
};

// También manejar GET para verificación
export const GET: APIRoute = async () => {
  return new Response('Webhook endpoint is working', { status: 200 });
};