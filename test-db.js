// Test script to add sample data to the database
import { createSampleData, testTableAccess, getPhotos } from './src/lib/supabase.js';

async function testDatabase() {
  console.log('🧪 Testing database connection...');
  
  // Test table access
  const tableTest = await testTableAccess();
  console.log('Table access test:', tableTest);
  
  if (!tableTest.success) {
    console.error('❌ Cannot access table. Please check your setup.');
    return;
  }
  
  // Get current photos
  console.log('\n📸 Current photos in database:');
  const photos = await getPhotos();
  console.log(`Found ${photos.length} photos`);
  
  if (photos.length === 0) {
    console.log('\n🌱 Creating sample data...');
    const sampleCreated = await createSampleData();
    if (sampleCreated) {
      console.log('✅ Sample data created successfully!');
      
      // Get photos again
      const newPhotos = await getPhotos();
      console.log(`Now we have ${newPhotos.length} photos`);
    } else {
      console.error('❌ Failed to create sample data');
    }
  }
}

testDatabase().catch(console.error);
