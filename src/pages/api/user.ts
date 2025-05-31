// src/pages/api/user.ts
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const { locals } = context;
    const auth = locals.auth();
    console.log('auth:', auth);

    if (!auth.userId) {
      console.log('No authenticated user');
      return new Response(
        JSON.stringify({ error: 'No authenticated user' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching user from Clerk:', auth.userId);

    // Obtener información del usuario desde Clerk
    const user = await clerkClient(context).users.getUser(auth.userId);

    console.log('User from Clerk:', user);

    return new Response(
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user data:', error, error?.stack);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user data', details: error?.message }),
      { status: 500 }
    );
  }
};