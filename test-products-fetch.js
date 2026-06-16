// Test script to verify product fetching from Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductFetch() {
  try {
    console.log('\n1. Testing basic products query...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*');
    
    if (prodError) {
      console.error('❌ Products error:', prodError);
    } else {
      console.log('✅ Products fetched:', products?.length || 0);
      if (products && products.length > 0) {
        console.log('First product:', products[0]);
      }
    }

    console.log('\n2. Testing categories query...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.error('❌ Categories error:', catError);
    } else {
      console.log('✅ Categories fetched:', categories?.length || 0);
    }

    console.log('\n3. Testing products with product_images...');
    const { data: productsWithImages, error: imgError } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          position
        )
      `);
    
    if (imgError) {
      console.error('❌ Products with images error:', imgError);
      console.log('Trying without product_images...');
      
      const { data: productsOnly, error: onlyError } = await supabase
        .from('products')
        .select('*');
      
      if (onlyError) {
        console.error('❌ Products only error:', onlyError);
      } else {
        console.log('✅ Products (without images) fetched:', productsOnly?.length || 0);
      }
    } else {
      console.log('✅ Products with images fetched:', productsWithImages?.length || 0);
    }

    console.log('\n4. Checking RLS policies...');
    const { data: policies, error: polError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products'` 
      })
      .single();
    
    if (polError) {
      console.log('⚠️ Cannot check policies (RLS function not available)');
    } else {
      console.log('Policies:', policies);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testProductFetch().then(() => {
  console.log('\n✅ Test complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
