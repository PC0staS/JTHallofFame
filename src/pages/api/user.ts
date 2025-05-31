import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const GET: APIRoute = async ({ locals }) => {
  const auth = locals.auth();
  
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }  try {
    const client = clerkClient();
    const user = await client.users.getUser(auth.userId);
    
    // Extraer información del usuario
    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddresses?.[0]?.emailAddress,
      displayName: user.username || 
        (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
        user.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
        `user-${user.id.slice(-8)}`
    };

    return new Response(JSON.stringify(userData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch user data',
      fallback: {
        id: auth.userId,
        displayName: `user-${auth.userId.slice(-8)}`
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
