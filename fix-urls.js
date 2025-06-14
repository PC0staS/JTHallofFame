import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY);

async function fixUrls() {
  const { data: photos } = await supabase.from('photos').select('*');
  
  for (const photo of photos) {
    if (photo.image_data && photo.image_data.includes('https://https://')) {
      const fixedUrl = photo.image_data.replace('https://https://', 'https://');
      await supabase.from('photos').update({ image_data: fixedUrl }).eq('id', photo.id);
      console.log(`Fixed: ${photo.id} -> ${fixedUrl}`);
    }
  }
  console.log('URLs fixed!');
}

fixUrls().catch(console.error);
