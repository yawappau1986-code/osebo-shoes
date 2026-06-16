const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hxkhlexajostqthptvaw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a2hsZXhham9zdHF0aHB0dmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMDk4NjgsImV4cCI6MjA5Njg4NTg2OH0.XxaTYL9DaIDhJnnHjfn5S_uPd7_oSU6EuaDd0KmOlC4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductImages() {
  console.log('🔍 Testing product_images fetch...\n');

  try {
    // Test 1: Fetch products with product_images
    console.log('1️⃣ Fetching products with product_images...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        image_url,
        product_images (
          id,
          image_url,
          position
        )
      `)
      .limit(3);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError.message);
      return;
    }

    console.log('✅ Products fetched:', products.length);
    products.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.name}`);
      console.log(`   Main image: ${product.image_url?.substring(0, 50)}...`);
      console.log(`   Additional images: ${product.product_images?.length || 0}`);
      
      if (product.product_images && product.product_images.length > 0) {
        product.product_images.forEach((img, i) => {
          console.log(`      Image ${i + 1} (pos ${img.position}): ${img.image_url.substring(0, 50)}...`);
        });
      }
    });

    // Test 2: Check if images are sorted correctly
    console.log('\n\n2️⃣ Testing image sorting...');
    const firstProduct = products[0];
    if (firstProduct.product_images && firstProduct.product_images.length > 1) {
      const sorted = [...firstProduct.product_images].sort((a, b) => (a.position || 0) - (b.position || 0));
      console.log('✅ Images sorted by position:', sorted.map(img => img.position).join(', '));
    } else {
      console.log('⚠️ First product has only', firstProduct.product_images?.length || 0, 'images');
    }

    // Test 3: Direct product_images query
    console.log('\n\n3️⃣ Direct product_images table query...');
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .limit(5);

    if (imagesError) {
      console.error('❌ Error fetching product_images:', imagesError.message);
      return;
    }

    console.log('✅ Total images in table:', images.length);
    images.forEach((img, i) => {
      console.log(`   Image ${i + 1}: product_id=${img.product_id}, position=${img.position}`);
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testProductImages();
