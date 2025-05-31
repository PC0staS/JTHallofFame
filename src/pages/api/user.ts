// src/pages/api/user.ts
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const auth = locals.auth();
    
    if (!auth.userId) {
      return new Response(
        JSON.stringify({ error: 'No authenticated user' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener información del usuario desde Clerk
    const user = await clerkClient().users.getUser(auth.userId);
    
    const userData = {
      id: user.id,
      username: user.username,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.username || 
                  (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
                  user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
                  `user-${user.id.slice(-8)}`
    };

    return new Response(
      JSON.stringify(userData),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user data' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};