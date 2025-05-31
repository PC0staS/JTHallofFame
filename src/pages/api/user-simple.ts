import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const auth = locals.auth();
  
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // For now, just return basic user info with the userId
    // In the future, we can enhance this with more Clerk user data
    const userData = {
      id: auth.userId,
      displayName: `user-${auth.userId.slice(-8)}`
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
