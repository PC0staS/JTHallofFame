import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

/**
 * Batch API endpoint to get comment counts for multiple photo IDs.
 * Expects a POST request with a JSON body: { photoIds: string[] }
 * Returns: { [photoId: string]: number }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { photoIds } = await request.json();
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return new Response(JSON.stringify({ error: 'photoIds must be a non-empty array' }), { status: 400 });
    }

    console.log('Received photoIds:', photoIds);

    // Query all comments for the requested photo IDs
    const { data, error } = await supabase
      .from('comments')
      .select('photo_id')
      .in('photo_id', photoIds);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log('Comments data:', data);

    // Build result: { [photoId]: count }
    const counts: Record<string, number> = {};
    
    // Initialize all requested photo IDs with 0
    for (const id of photoIds) {
      counts[id] = 0;
    }
    
    // Count comments for each photo
    for (const row of data ?? []) {
      if (row.photo_id in counts) {
        counts[row.photo_id]++;
      }
    }

    console.log('Returning counts:', counts);

    return new Response(JSON.stringify(counts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { status: 500 });
  }
};
