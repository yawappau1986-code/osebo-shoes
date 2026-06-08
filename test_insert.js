const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://uwttjontkimdczydihuy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dHRqb250a2ltZGN6eWRpaHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwOTA0OTEsImV4cCI6MjA5NTY2NjQ5MX0.vnftZWTinuutP6ZoVnTch2TMj-IVcxIJKOC8LH8KHtg');

async function testInsert() {
  const { data, error } = await supabase.from('orders').insert([{
    total: 100,
    status: 'Pending',
    metadata: {
      customer_name: 'Test',
      customer_email: 'test@test.com',
      customer_phone: '1234567890',
      delivery_address: '123 Test St'
    }
  }]).select();
  
  if (error) {
    console.error("Order Insert Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Order inserted successfully:", data);
  }
}

testInsert();
