const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');

// Add import
const importStr = "import { FontAwesome } from '@expo/vector-icons';\n";
if (!code.includes("import { FontAwesome }")) {
  code = code.replace("import { supabase } from './lib/supabase';", "import { supabase } from './lib/supabase';\n" + importStr);
}

// Replace View with FontAwesome
const targetStr = "<View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: order.status === 'DELIVERY' || order.status === 'Delivered' ? '#4A0404' : '#10B981'}} />";
const replacementStr = "<FontAwesome name=\"whatsapp\" size={16} color={order.status === 'DELIVERY' || order.status === 'Delivered' ? '#4A0404' : '#10B981'} />";

code = code.split(targetStr).join(replacementStr);

fs.writeFileSync(appPath, code);
console.log("WhatsApp icon fixed!");
