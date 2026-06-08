const fs = require('fs');

async function main() {
  const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dHRqb250a2ltZGN6eWRpaHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwOTA0OTEsImV4cCI6MjA5NTY2NjQ5MX0.vnftZWTinuutP6ZoVnTch2TMj-IVcxIJKOC8LH8KHtg';
  const url = `https://uwttjontkimdczydihuy.supabase.co/rest/v1/?apikey=${apikey}`;
  
  const res = await fetch(url);
  const spec = await res.json();
  
  const tables = ['products', 'categories', 'orders', 'order_items', 'profiles'];
  
  const schemas = spec.components?.schemas || spec.definitions || {};
  console.log('Available schemas:', Object.keys(schemas));
  
  for (const t of tables) {
    console.log(`\n=== Table: ${t} ===`);
    const schema = schemas[t];
    if (schema && schema.properties) {
      for (const [col, def] of Object.entries(schema.properties)) {
        console.log(`  ${col}: ${def.type || def.format} (nullable: ${def.nullable ?? '?'})`);
      }
    } else {
      console.log('  Not found');
    }
  }
}

main();
