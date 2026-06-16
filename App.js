import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Linking,
} from 'react-native';
import { supabase } from './lib/supabase';
import PromoBannerStrip from './components/PromoBannerStrip';
import ProductDetail from './components/ProductDetail';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';



const palette = {
  background: '#FAF9F9',
  surface: '#FFFFFF',
  charcoal: '#1B1C1C',
  secondary: '#5F5E5F',
  oxblood: '#4A0404',
  oxbloodSoft: '#D26A5F',
  vault: '#202222',
};

const fallbackChips = [
  'Sneakers',
  'Boots',
  'Sandals',
  'Heels',
  'Loafers',
  'Athletic',
  'Formal',
  'Casual',
  'Flip Flops',
  'Slippers',
  'Running',
  'Oxford',
  'Moccasins',
];
const weightOptions = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];
const weightMultipliers = {
  'US 7': 7,
  'US 8': 8,
  'US 9': 9,
  'US 10': 10,
  'US 11': 11,
};

const fallbackCategoryCards = [
  {
    id: 'sneakers',
    name: 'Nike Air Max 90',
    price: 150,
    tag: 'Best Seller',
    description: 'Classic sneaker with Max Air cushioning for all-day comfort.',
    image:
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'boots',
    name: 'Timberland Pro',
    price: 180,
    tag: 'Premium',
    description: 'Industrial-grade work boots with steel toe protection.',
    image:
      'https://images.unsplash.com/photo-1551107696-a4b0c5c0d0c0?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'heels',
    name: 'Jimmy Choo Pumps',
    price: 350,
    tag: 'Designer',
    description: 'Elegant stiletto heels perfect for formal occasions.',
    image:
      'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'loafers',
    name: 'Gucci Horsebit',
    price: 280,
    tag: 'Luxury',
    description: 'Classic leather loafers with signature horsebit detail.',
    image:
      'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sandals',
    name: 'Birkenstock Arizona',
    price: 99,
    tag: 'Comfort',
    description: 'Iconic sandals with contoured cork footbed.',
    image:
      'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80',
  },
];

const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80';

const LOCAL_API_BASE = 'http://localhost:3001';

const mapCategoryRowToCard = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.metadata?.price ?? row.metadata?.base_price ?? 0),
  tag: row.metadata?.tag ?? row.metadata?.label ?? null,
  description: row.description ?? row.metadata?.description ?? '',
  image: row.image_url || row.metadata?.image_url || DEFAULT_CATEGORY_IMAGE,
});

const mapProductRowToCard = (row, catNameToImageMap = {}, catIdToNameMap = {}) => {
  let catName = row.category_id ?? row.category ?? row.category_name ?? row.metadata?.category_name ?? row.metadata?.category ?? row.tag ?? null;
  
  // If the category is actually a UUID from the categories table, resolve it to the human-readable name!
  if (catName && catIdToNameMap[catName]) {
    catName = catIdToNameMap[catName];
  }
  
  // Handle products with or without weights
  const hasWeights = row.has_weights ?? false;
  const basePrice = Number(row.price ?? 0);
  
  return {
    id: row.id,
    name: row.name ?? row.title ?? 'Untitled product',
    price_250g: Number(row.price_250g ?? (hasWeights && basePrice ? basePrice * 0.25 : basePrice)),
    price_500g: Number(row.price_500g ?? (hasWeights && basePrice ? basePrice * 0.5 : basePrice)),
    price_1kg: Number(row.price_1kg ?? basePrice),
    hasWeights: hasWeights,
    price: basePrice,
    tag: row.tag ?? row.category_name ?? row.metadata?.tag ?? null,
    categoryLabel: catName,
    description: row.description ?? row.details ?? row.metadata?.description ?? '',
    position: row.position ?? 0,
    image:
      row.url || row.image_url || row.image || row.photo_url || row.metadata?.image_url || catNameToImageMap[catName] || DEFAULT_CATEGORY_IMAGE,
    stock_quantity: row.stock_quantity ?? 0,
    product_images: row.product_images || [], // ✅ Add product_images array
  };
};

function CategoryCard({ category, cardWidth, currency, onAddToCart, onRemoveFromCart, cartItems = [], onViewDetails, isPhone }) {
  const [selectedWeight, setSelectedWeight] = useState('US 9');
  
  const itemPrice = useMemo(() => {
    if (!category.hasWeights) return category.price || 0;
    if (selectedWeight === 'US 7') return category.price_250g || category.price || 0;
    if (selectedWeight === 'US 8') return category.price_500g || category.price || 0;
    if (selectedWeight === 'US 9') return category.price_1kg || category.price || 0;
    if (selectedWeight === 'US 10') return category.price_1kg || category.price || 0;
    if (selectedWeight === 'US 11') return category.price_1kg || category.price || 0;
    return category.price || 0;
  }, [selectedWeight, category]);

  // Check if this item is in the cart with the selected weight
  const isSelected = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(
      (item) => item.id === category.id && item.selectedWeight === (category.hasWeights ? selectedWeight : 'unit')
    );
  }, [cartItems, category.id, selectedWeight, category.hasWeights]);

  const handleToggleCart = () => {
    const weight = category.hasWeights ? selectedWeight : 'unit';
    if (isSelected) {
      // Remove from cart
      onRemoveFromCart(category.id, weight);
    } else {
      // Add to cart
      onAddToCart(category, weight, itemPrice);
    }
  };

  // Compact sizes for real phone 2-column layout (~167px cards)
  const cardPad   = isPhone ? 8  : 14;
  const nameFz    = isPhone ? 14 : 24;
  const nameLineH = isPhone ? 18 : 28;
  const priceFz   = isPhone ? 12 : 20;
  const weightPad = isPhone ? 6  : 10;
  const weightFz  = isPhone ? 10 : 12;
  const btnPad    = isPhone ? 8  : 13;
  const btnFz     = isPhone ? 9  : 12;
  const btnLs     = isPhone ? 0.6 : 1.8;

  return (
    <View style={[styles.productCard, { width: cardWidth }]}>
      <View style={{ padding: cardPad }}>
        <Pressable onPress={() => onViewDetails?.(category)}>
          <View style={[styles.imageWrap, { width: cardWidth - cardPad * 2 }]}>
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: category.image }} resizeMode="contain" style={styles.productImage} />
              
              {/* Square Cart Icon at bottom-right of image */}
              <Pressable 
                onPress={handleToggleCart}
                style={[
                  styles.cartIconSquare,
                  isSelected && styles.cartIconSquareSelected
                ]}
              >
                <FontAwesome 
                  name="shopping-cart" 
                  size={isPhone ? 14 : 20} 
                  color={isSelected ? '#FFF' : palette.oxblood}
                />
              </Pressable>
            </View>
          </View>

          <View style={[styles.rowBetween, { gap: 4 }]}>
            <Text style={[styles.productName, { fontSize: nameFz, lineHeight: nameLineH }]} numberOfLines={isPhone ? 2 : undefined}>
              {category.name}
            </Text>
          <Text style={[styles.productPrice, { fontSize: priceFz }]}>{formatMoney(itemPrice, currency)}</Text>
        </View>
          <Text style={styles.priceUnit}>{category.hasWeights ? 'Price per unit' : 'Price per unit'}</Text>
          {/* Hide description on phone to save vertical space */}
          {!isPhone && <Text style={styles.categoryDescription}>{category.description}</Text>}
        </Pressable>

        {category.hasWeights && (
          <View style={styles.weightWrap}>
            {!isPhone && <Text style={styles.weightLabel}>SELECT WEIGHT</Text>}
            <View style={styles.weightOptionsRow}>
              {weightOptions.map((option) => {
                const active = option === selectedWeight;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedWeight(option)}
                    style={[styles.weightOption, active && styles.weightOptionActive, { paddingVertical: weightPad }]}
                  >
                    <Text style={[styles.weightOptionText, active && styles.weightOptionTextActive, { fontSize: weightFz }]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const adminStats = (count) => [
  { label: 'Products', value: String(count), note: 'Live catalog items' },
  { label: 'Orders', value: '18', note: 'Today' },
  { label: 'Low stock', value: '2', note: 'Needs review' },
  { label: 'Revenue', value: '$3.42K', note: 'Week to date' },
];

const adminActions = ['Review orders', 'Publish promo'];
const currencyOptions = ['USD', 'EUR', 'GBP', 'NGN', 'GHC'];
const currencyRates = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  NGN: { symbol: '₦', rate: 1550 },
  GHC: { symbol: 'GH₵', rate: 15.2 },
};

const formatMoney = (amount, currency = 'GHC') => {
  const config = currencyRates[currency] ?? currencyRates.GHC;
  const ghcRate = currencyRates.GHC?.rate || 15.2;
  const converted = amount * (config.rate / ghcRate);
  return `${config.symbol}${converted.toFixed(2)}`;
};

const fallbackFooterSections = [
  {
    section_key: 'aboutUs',
    title: 'ABOUT JFAMCO',
    footer_items: [
      { id: 'f1', label: 'We specialize in the distribution of a wide range of quality products, proudly made in Ghana.', action_type: 'text', sort_order: 10 },
      { id: 'f2', label: 'Whether you\'re a household, restaurant, caterer, retailer, or food service provider, we offer professional support and consistent supply to meet your needs.', action_type: 'text', sort_order: 20 }
    ]
  },
  {
    section_key: 'mainMenu',
    title: 'MAIN MENU',
    footer_items: [
      { id: 'f4', label: 'Home', action_type: 'navigate', action_value: 'shop', sort_order: 10 },
      { id: 'f5', label: 'About Us', action_type: 'alert', action_value: 'About JFAMCO coming soon', sort_order: 20 },
      { id: 'f6', label: 'JFAMCO Shop', action_type: 'navigate', action_value: 'shop', sort_order: 30 },
      { id: 'f7', label: 'Contact Us', action_type: 'alert', action_value: 'Contact Us coming soon', sort_order: 40 }
    ]
  },
  {
    section_key: 'links',
    title: 'LINKS',
    footer_items: [
      { id: 'f8', label: 'Cart', action_type: 'navigate', action_value: 'cart', sort_order: 10 },
      { id: 'f9', label: 'Checkout', action_type: 'checkout', sort_order: 20 },
      { id: 'f10', label: 'Wishlist', action_type: 'alert', action_value: 'Wishlist coming soon', sort_order: 30 },
      { id: 'f11', label: 'Terms And Conditions', action_type: 'alert', action_value: 'Terms & Conditions coming soon', sort_order: 40 }
    ]
  },
  {
    section_key: 'contact',
    title: 'CONTACT',
    footer_items: [
      { id: 'f12', label: 'Madina Estate Road to Social Welfare, Behind the Goil Filling Station, Madina, Ghana', action_type: 'text', sort_order: 10 },
      { id: 'f13', label: 'For Business, call: +233591008897', action_type: 'link', action_value: 'tel:+233591008897', icon_library: 'FontAwesome', icon_name: 'phone', sort_order: 20 },
      { id: 'f14', label: 'Click here to order on Whatsapp', action_type: 'link', action_value: 'https://wa.me/233591008897', icon_library: 'FontAwesome', icon_name: 'whatsapp', sort_order: 30 },
      { id: 'f15', label: 'Facebook', action_type: 'link', action_value: 'https://facebook.com', icon_library: 'FontAwesome5', icon_name: 'facebook-f', sort_order: 40 },
      { id: 'f16', label: 'Instagram', action_type: 'link', action_value: 'https://instagram.com', icon_library: 'FontAwesome5', icon_name: 'instagram', sort_order: 50 },
      { id: 'f17', label: 'WhatsApp', action_type: 'link', action_value: 'https://wa.me/233591008897', icon_library: 'FontAwesome5', icon_name: 'whatsapp', sort_order: 60 },
      { id: 'f18', label: 'Twitter', action_type: 'link', action_value: 'https://twitter.com', icon_library: 'FontAwesome5', icon_name: 'twitter', sort_order: 70 },
      { id: 'f19', label: 'TikTok', action_type: 'link', action_value: 'https://tiktok.com', icon_library: 'FontAwesome5', icon_name: 'tiktok', sort_order: 80 }
    ]
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState([]);

  // Cart Bottom Sheet State & Animation
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const cartSheetAnim = useRef(new Animated.Value(1)).current;

  const openCart = () => {
    setCartModalVisible(true);
    Animated.spring(cartSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const closeCart = () => {
    Animated.timing(cartSheetAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setCartModalVisible(false);
    });
  };
  
  // User Auth State
  const [user, setUser] = useState(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [userAccountSheetVisible, setUserAccountSheetVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authInterests, setAuthInterests] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Current Page Route
  const [currentPage, setCurrentPage] = useState('shop');
  const [currency, setCurrency] = useState('GHC');
  const [adminEmail, setAdminEmail] = useState('');
  const [ratesUpdated, setRatesUpdated] = useState(0);
// const isCartPage = currentPage === 'cart'; // moved to later block
// const isShopPage = currentPage === 'shop'; // moved
// const isAdminPage = currentPage === 'adminLogin'; // removed duplicate

  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          if (data.rates.EUR) currencyRates.EUR.rate = data.rates.EUR;
          if (data.rates.GBP) currencyRates.GBP.rate = data.rates.GBP;
          if (data.rates.NGN) currencyRates.NGN.rate = data.rates.NGN;
          if (data.rates.GHS) currencyRates.GHC.rate = data.rates.GHS; // API uses GHS
          setRatesUpdated(Date.now());
        }
      } catch (err) {
        console.warn('Failed to fetch live currency rates:', err.message);
      }
    };
    fetchLiveRates();
  }, []);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [categoryChips, setCategoryChips] = useState(['All', ...fallbackChips]);
  const [productCards, setProductCards] = useState(fallbackCategoryCards);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  
  // Checkout & Order states
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessModalVisible, setOrderSuccessModalVisible] = useState(false);
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState('');
  const [localOrders, setLocalOrders] = useState([]);
  
  // Admin Profile State
  const [adminAvatarUrl, setAdminAvatarUrl] = useState('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80');
  const [adminProfileModalVisible, setAdminProfileModalVisible] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  
  // Customer Account State
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Footer Accordion State
  const [expandedFooterSections, setExpandedFooterSections] = useState({
    aboutUs: false,
    mainMenu: false,
    links: false,
    contact: false,
  });
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  const toggleFooterSection = (section) => {
    setExpandedFooterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [dbFooterSections, setDbFooterSections] = useState(fallbackFooterSections);

  const halalSealItem = null;
  const halalSealSource = null;

  // Admin order states
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [adminOrdersError, setAdminOrdersError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('Dashboard');
  
  // Admin catalog states
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [editProductModalVisible, setEditProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Category Maps
  const [catNameToIdMap, setCatNameToIdMap] = useState({});
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price_250g: '',
    price_500g: '',
    price_1kg: '',
    price: '',
    has_weights: true,
    tag: '',
    category_name: '',
    description: '',
    image_url: '',
    stock_quantity: '',
  });

  const reveal = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(20)).current;
  const cartBarAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();


  useEffect(() => {
    Animated.parallel([
      Animated.timing(reveal, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [lift, reveal]);

const fetchFooterData = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_sections')
        .select(`
          id,
          section_key,
          title,
          sort_order,
          footer_items!footer_items_footer_section_id_fkey (
            id,
            label,
            action_type,
            action_value,
            icon_library,
            icon_name,
            sort_order
          )
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const sortedData = data.map(section => ({
          ...section,
          footer_items: (section.footer_items || []).sort((a, b) => a.sort_order - b.sort_order)
        }));
        setDbFooterSections(sortedData);
      }
    } catch (err) {
      console.warn('Failed to load Supabase footer schema, using hardcoded fallback:', err.message);
    }
  };

  const loadSupabaseData = async (showLoading = true) => {
    fetchFooterData();
    if (showLoading) {
      setCategoriesLoading(true);
    }
    setCategoriesError('');

    let productData = [];
    let success = false;
    let catNameToImageMap = {};
    let catIdToNameMap = {};
    let catNameToId = {};
    let categoryNames = [];
    let fetchError = null;

    console.log('🔄 Starting product fetch from Supabase...');
    console.log('Supabase URL configured:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);

    // 1. Try querying Supabase directly
    try {
      console.log('📡 Attempting direct Supabase query...');
      
      // First, try with product_images
      let prodRes = await supabase.from('products').select(`
        *,
        product_images (url, position)
      `);
      
      console.log('🔍 Raw prodRes:', { 
        hasError: !!prodRes.error, 
        dataLength: prodRes.data?.length,
        errorMessage: prodRes.error?.message,
        firstProduct: prodRes.data?.[0],
        firstProductImages: prodRes.data?.[0]?.product_images
      });
      // If product_images table doesn't exist, fallback to simple query
      if (prodRes.error && prodRes.error.message?.includes('product_images')) {
        console.log('⚠️ product_images table not found, fetching products without images...');
        prodRes = await supabase.from('products').select('*');
      }
      
      const catRes = await supabase.from('categories').select('*');
      
      if (prodRes.error) {
        console.error('❌ Products query error:', prodRes.error);
        throw prodRes.error;
      }
      
      console.log('✅ Products fetched from Supabase:', prodRes.data?.length || 0, 'products');
      
      if (catRes.data) {
        catRes.data.forEach(c => {
          if (c.id && c.name) {
            catIdToNameMap[c.id] = c.name;
            catNameToId[c.name.toLowerCase()] = c.id;
          }
          if (c.image_url) catNameToImageMap[c.name] = c.image_url;
          if (c.name) categoryNames.push(c.name);
        });
        setCatNameToIdMap(catNameToId);
        console.log('📂 Categories loaded:', catRes.data.length);
      }

      if (prodRes.data && prodRes.data.length > 0) {
        // Sort product_images by position for each product
        productData = prodRes.data.map(product => ({
          ...product,
          product_images: product.product_images 
            ? product.product_images.sort((a, b) => (a.position || 0) - (b.position || 0))
            : []
        }));
        success = true;
        console.log('✅ Successfully loaded', productData.length, 'products from Supabase');
      } else {
        console.log('✅ Backend connected successfully, but products table is empty (0 products)');
        console.log('💡 Using fallback demo products for display');
      }
    } catch (err) {
      console.error('❌ Direct Supabase fetch failed:', err.message);
      fetchError = err.message;
      setCategoriesError('Supabase Error: ' + err.message);
      
      if (err.message?.includes('JWT') || err.message?.includes('expired')) {
        supabase.auth.signOut();
      }
    }

    // 2. Try proxy server if direct fetch failed
    if (!success) {
      try {
        console.log('📡 Trying proxy server fallback...');
        const response = await fetch(`${LOCAL_API_BASE}/api/products`);
        if (response.ok) {
          productData = await response.json();
          success = true;
          console.log('✅ Products fetched via proxy:', productData.length);
        } else {
          throw new Error(`Proxy status ${response.status}`);
        }
      } catch (error) {
        console.warn('⚠️ Proxy fetch failed:', error.message);
      }
    }

    if (success && productData && productData.length > 0) {
      const nextCards = productData
        .map(row => mapProductRowToCard(row, catNameToImageMap, catIdToNameMap))
        .filter((card) => card.name)
        .sort((left, right) => {
          const leftPosition = Number(left.position ?? 0);
          const rightPosition = Number(right.position ?? 0);
          if (leftPosition !== rightPosition) {
            return leftPosition - rightPosition;
          }
          return left.name.localeCompare(right.name);
        });

      setProductCards(nextCards);
      console.log('✅ Displaying', nextCards.length, 'products from Supabase');
      
      // Extract chips from already-mapped cards using categoryLabel (safe, already normalised)
      const isValidCategory = (val) => {
        if (!val || typeof val !== 'string') return false;
        const trimmed = val.trim();
        if (trimmed.length === 0 || trimmed.length > 60) return false;
        // Reject anything that looks like a URL or file path
        if (/^https?:\/\//i.test(trimmed)) return false;
        if (/\.(jpg|jpeg|png|gif|webp|svg|mp4|pdf)$/i.test(trimmed)) return false;
        return true;
      };

      const categoriesFromCards = new Set(categoryNames);
      if (categoriesFromCards.size === 0) {
        nextCards.forEach((card) => {
          if (isValidCategory(card.categoryLabel)) categoriesFromCards.add(card.categoryLabel.trim());
          else if (isValidCategory(card.tag)) categoriesFromCards.add(card.tag.trim());
        });
      }

      const dynamicChips = ['All', ...Array.from(categoriesFromCards).sort()];
      setCategoryChips(dynamicChips.length > 1 ? dynamicChips : ['All', ...fallbackChips]);
      
      // Clear error since we successfully loaded from Supabase
      setCategoriesError('');
    } else {
      // 3. Fall back to local data when Supabase fetch failed or returned empty
      console.log('🔄 Showing fallback demo products...');
      const errorMsg = fetchError 
        ? `⚠️ Backend Error: ${fetchError}`
        : '✅ Backend connected. Database is empty - showing demo products.';
      setCategoriesError(errorMsg);
      setProductCards(fallbackCategoryCards);
      setCategoryChips(['All', ...fallbackChips]);
      console.log('✅ Displaying', fallbackCategoryCards.length, 'fallback products');
    }

    setCategoriesLoading(false);
  };

  // Manual refresh function for user to retry loading products
  const refreshProducts = () => {
    loadSupabaseData(true);
  };

  useEffect(() => {
    loadSupabaseData();
    
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCustomerName(session.user.user_metadata?.full_name || '');
        setCustomerEmail(session.user.email || '');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCustomerName(session.user.user_metadata?.full_name || '');
        setCustomerEmail(session.user.email || '');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentPage === 'admin') {
      fetchAdminOrders();
    }
    if (currentPage === 'account') {
      fetchCustomerOrders();
    }
  }, [currentPage, user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80'
  ];

  const fetchCustomerOrders = async () => {
    if (!user) {
      console.log('❌ Cannot fetch orders: User not logged in');
      return;
    }
    
    console.log('🔄 Fetching customer orders for user:', user.id);
    setCustomerOrdersLoading(true);
    
    try {
      // Fetch orders with order_items, products, and product_images
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            line_total,
            products (
              id,
              name,
              url,
              product_images (url, position)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }
      
      console.log('✅ Orders fetched from Supabase:', data?.length || 0, 'orders');
      
      // Map product data to order items for easy access
      const ordersWithProducts = (data || []).map(order => {
        console.log('📦 Order:', order.id, 'Items:', order.order_items?.length || 0);
        return {
          ...order,
          order_items: (order.order_items || []).map(item => {
            // Get first product image from product_images array
            const firstProductImage = item.products?.product_images?.[0]?.url;
            const fallbackImage = item.products?.url || item.products?.image_url;
            
            const productInfo = {
              ...item,
              product_name: item.product_name || item.products?.name || 'Product',  // Use stored name first
              product_image: firstProductImage || fallbackImage || null
            };
            console.log('  - Item:', productInfo.product_name, 'Qty:', item.quantity, 'Image:', productInfo.product_image ? '✅' : '❌');
            return productInfo;
          })
        };
      });
      
      setCustomerOrders(ordersWithProducts);
      console.log('✅ Customer orders state updated');
    } catch (err) {
      console.warn('⚠️ Error fetching customer orders:', err.message);
      // Fallback to basic query if join fails
      try {
        console.log('🔄 Trying fallback query without product join...');
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error) {
          console.log('✅ Fallback query successful:', data?.length || 0, 'orders');
          setCustomerOrders(data || []);
        } else {
          console.error('❌ Fallback query failed:', error);
        }
      } catch (fallbackErr) {
        console.warn('❌ Fallback query also failed:', fallbackErr.message);
      }
    } finally {
      setCustomerOrdersLoading(false);
    }
  };

  // Checkout and Order Placement Flow
  const submitOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      alert('Please fill in Name, Phone, and Delivery Address.');
      return;
    }

    console.log('🛒 Submitting order...');
    console.log('  User ID:', user?.id || 'Guest');
    console.log('  Cart Items:', cartItems.length);
    
    setIsSubmittingOrder(true);
    const mockOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalAmount = cartItems.reduce((total, item) => total + item.lineTotal, 0);

    try {
      console.log('📝 Creating order in Supabase...');
      // 1. Insert order metadata
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id || null,
            total: totalAmount,
            status: 'Pending',
            metadata: {
              customer_name: customerName.trim(),
              customer_email: customerEmail.trim() || 'no-email@store.com',
              customer_phone: customerPhone.trim(),
              delivery_address: deliveryAddress.trim(),
            }
          },
        ])
        .select();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw orderError;
      }
      if (!orderData || orderData.length === 0) {
        console.error('❌ No order data returned from Supabase');
        throw new Error('No order data returned from Supabase');
      }

      const newOrderId = orderData[0].id;
      console.log('✅ Order created:', newOrderId);

      // 2. Insert order items with product snapshot data
      console.log('📦 Adding order items...');
      const orderItemsToInsert = cartItems.map((item) => {
        console.log('Cart item:', JSON.stringify(item));
        return {
          order_id: newOrderId,
          product_id: item.id.toString().startsWith('prod-') ? null : item.id,
          product_name: item.name,  // ✅ Snapshot product name at order time
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: item.lineTotal,
          // Product images come from product_images table via join (not stored here)
        };
      });

      console.log('  Items to insert:', orderItemsToInsert.length);
      console.log('  Order items data:', JSON.stringify(orderItemsToInsert, null, 2));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsError) {
        console.error('❌ Error inserting order items:', itemsError);
        throw itemsError;
      }

      console.log('✅ Order items inserted successfully');
      console.log('🎉 Order completed successfully!');

      setLastCreatedOrderId(newOrderId);
      setOrderSuccessModalVisible(true);
      setCartItems([]);
      clearCheckoutForm();
      
      // Refresh order history if user is logged in
      if (user) {
        console.log('🔄 Refreshing order history...');
        fetchCustomerOrders();
      } else {
        console.log('⚠️ User not logged in, skipping order history refresh');
      }
    } catch (err) {
      console.warn('⚠️ Supabase checkout failed, falling back to local simulation:', err.message);
      
      // Local Order Simulation
      const simulatedOrder = {
        id: mockOrderId,
        total: totalAmount,
        status: 'Pending',
        created_at: new Date().toISOString(),
        metadata: {
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || 'no-email@store.com',
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
        },
        order_items: cartItems.map((item) => ({
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          product_name: item.name,
          selected_weight: item.selectedWeight,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: item.lineTotal,
        })),
      };

      setLocalOrders((prev) => [simulatedOrder, ...prev]);
      setLastCreatedOrderId(mockOrderId);
      setOrderSuccessModalVisible(true);
      setCartItems([]);
      clearCheckoutForm();
      
      // Add to customer orders for display
      if (user) {
        setCustomerOrders((prev) => [simulatedOrder, ...prev]);
      }
    } finally {
      setIsSubmittingOrder(false);
      setCheckoutModalVisible(false);
    }
  };

  const clearCheckoutForm = () => {
    setDeliveryAddress('');
    setCustomerPhone('');
    // Intentionally keep customerName and Email if they are logged in
  };

  // Check if user is admin using profiles table
  const checkAdmin = async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.log('Error fetching profile:', error);
        return false;
      }
      
      return profile?.role === 'admin';
    } catch (err) {
      console.log('Error checking admin status:', err);
      return false;
    }
  };

  // Auth Handlers
  const handleAuth = async () => {
    setAuthLoading(true);
    if (!authEmail || !authPassword || (!isLoginMode && !authName)) {
      alert('Please fill all fields');
      setAuthLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        // Sign in with Supabase
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;

        // Check admin using profiles table
        const isAdmin = await checkAdmin(user);
        
        if (isAdmin) {
          setAdminUnlocked(true);
          setCurrentPage('admin');
        } else {
          setCurrentPage('shop');
        }
        setAuthModalVisible(false);
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authName,
              interests: authInterests,
            }
          }
        });
        if (error) throw error;
        setAuthModalVisible(false);
        alert('Welcome to JFAMCO! Your account has been created.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('shop');
  };

  const INTERESTS = [];
  const toggleInterest = (interest) => {
    setAuthInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // Admin Order Retrieval & Actions
  const fetchAdminOrders = async () => {
    setAdminOrdersLoading(true);
    setAdminOrdersError('');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Merge live database orders with locally simulated orders
      const mergedOrders = [...localOrders, ...(data || [])];
      setAdminOrders(mergedOrders);
    } catch (err) {
      console.warn('Could not fetch Supabase orders. Using local simulation data:', err.message);
      setAdminOrders(localOrders);
    } finally {
      setAdminOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI update for immediate feedback
    setAdminOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // If it's a simulated order
    if (orderId.toString().startsWith('ORD-')) {
      setLocalOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      return; // UI is already updated
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      
      // If no rows were returned, RLS might have silently blocked it.
      if (!data || data.length === 0) {
        console.warn('Update succeeded but no rows were modified. Check Supabase RLS.');
      }

      // Re-fetch to ensure sync, but UI is already optimistically updated
      fetchAdminOrders();
    } catch (err) {
      alert('Failed to update status in database: ' + err.message);
      // Revert optimistic update by re-fetching
      fetchAdminOrders();
    }
  };

  const deleteOrder = async (orderId) => {
    // Optimistic UI update
    setAdminOrders((prev) => prev.filter((o) => o.id !== orderId));

    if (orderId.toString().startsWith('ORD-')) {
      setLocalOrders((prev) => prev.filter((o) => o.id !== orderId));
      return;
    }

    try {
      const { data, error } = await supabase.from('orders').delete().eq('id', orderId).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Supabase RLS policy prevented deletion. Please add a DELETE policy for the 'orders' table in your Supabase dashboard.");
      }
      fetchAdminOrders();
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
      fetchAdminOrders(); // Revert optimistic delete
    }
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return productCards.filter((card) => {
      const selected = activeCategory === 'All' || card.categoryLabel === activeCategory || card.name === activeCategory;
      const searchable = `${card.name} ${card.description} ${card.tag ?? ''} ${card.categoryLabel ?? ''}`.toLowerCase();
      const matchesQuery = query.length === 0 || searchable.includes(query);
      return selected && matchesQuery;
    });
  }, [activeCategory, productCards, search]);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let currentWeekRevenue = 0;
    let lastWeekRevenue = 0;
    let currentWeekOrders = 0;
    let lastWeekOrders = 0;

    adminOrders.forEach(o => {
      const date = new Date(o.created_at || now);
      if (date >= oneWeekAgo) {
        currentWeekRevenue += Number(o.total_amount) || 0;
        currentWeekOrders++;
      } else if (date >= twoWeeksAgo) {
        lastWeekRevenue += Number(o.total_amount) || 0;
        lastWeekOrders++;
      }
    });

    const revGrowth = lastWeekRevenue === 0 ? (currentWeekRevenue > 0 ? 100 : 0) : Math.round(((currentWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100);
    const orderGrowth = lastWeekOrders === 0 ? (currentWeekOrders > 0 ? 100 : 0) : Math.round(((currentWeekOrders - lastWeekOrders) / lastWeekOrders) * 100);

    const getStyle = (growth) => {
      if (growth > 0) return { bg: styles.adminBadgeGreen, text: styles.adminBadgeGreenText };
      if (growth < 0) return { bg: styles.adminBadgeRed, text: styles.adminBadgeRedText };
      return { bg: styles.adminBadgeGray, text: styles.adminBadgeGrayText };
    };

    return {
      revGrowthStr: revGrowth > 0 ? `+${revGrowth}%` : `${revGrowth}%`,
      orderGrowthStr: orderGrowth > 0 ? `+${orderGrowth}%` : `${orderGrowth}%`,
      revStyle: getStyle(revGrowth),
      orderStyle: getStyle(orderGrowth),
    };
  }, [adminOrders]);

  // Admin Catalog Actions
  const adminAddProduct = async () => {
    if (!newProduct.name) {
      alert('Please enter a product name.');
      return;
    }

    let p250 = null, p500 = null, p1kg = null, pUnit = null;

    if (newProduct.has_weights) {
      if (!newProduct.price_250g || !newProduct.price_500g || !newProduct.price_1kg) {
        alert('Please enter prices for all three variants (250g, 500g, 1kg).');
        return;
      }
      p250 = parseFloat(newProduct.price_250g);
      p500 = parseFloat(newProduct.price_500g);
      p1kg = parseFloat(newProduct.price_1kg);
      if (isNaN(p250) || isNaN(p500) || isNaN(p1kg)) {
        alert('All prices must be valid numbers.');
        return;
      }
    } else {
      if (!newProduct.price) {
        alert('Please enter a unit price.');
        return;
      }
      pUnit = parseFloat(newProduct.price);
      if (isNaN(pUnit)) {
        alert('Price must be a valid number.');
        return;
      }
    }

    // Find category ID from name
    const catNameInput = newProduct.category_name.trim();
    const resolvedCategoryId = catNameToIdMap[catNameInput.toLowerCase()] || catNameInput || null;

    const productRow = {
      name: newProduct.name.trim(),
      price_250g: p250,
      price_500g: p500,
      price_1kg: p1kg,
      price: pUnit,
      has_weights: newProduct.has_weights,
      tag: newProduct.tag.trim() || null,
      category_id: resolvedCategoryId,
      description: newProduct.description.trim() || '',
      image_url: newProduct.image_url.trim() || null,
      stock_quantity: parseInt(newProduct.stock_quantity) || 0,
    };

    try {
      const { error } = await supabase.from('products').insert([productRow]);
      if (error) throw error;

      setAddProductModalVisible(false);
      setNewProduct({ name: '', price_250g: '', price_500g: '', price_1kg: '', price: '', has_weights: true, tag: '', category_name: '', description: '', image_url: '', stock_quantity: '' });
      loadSupabaseData();
    } catch (err) {
      console.warn('Failed to insert product in Supabase. Simulating locally:', err.message);
      
      const newLocalCard = {
        id: `prod-${Math.random().toString(36).substr(2, 9)}`,
        name: productRow.name,
        price_250g: productRow.price_250g,
        price_500g: productRow.price_500g,
        price_1kg: productRow.price_1kg,
        price: productRow.price,
        hasWeights: productRow.has_weights,
        tag: productRow.tag,
        categoryLabel: newProduct.category_name,
        description: productRow.description,
        image: productRow.image_url || DEFAULT_CATEGORY_IMAGE,
        position: 0,
      };

      setProductCards((prev) => [newLocalCard, ...prev]);
      setAddProductModalVisible(false);
      setNewProduct({ name: '', price_250g: '', price_500g: '', price_1kg: '', price: '', has_weights: true, tag: '', category_name: '', description: '', image_url: '', stock_quantity: '' });
    }
  };

  const adminDeleteProduct = async (id) => {
    // If it's a simulated local product
    if (id.toString().startsWith('prod-')) {
      setProductCards((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadSupabaseData();
    } catch (err) {
      console.warn('Failed to delete product from Supabase. Removing locally:', err.message);
      setProductCards((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const adminEditProduct = async () => {
    if (!editingProduct.name) {
      alert('Please enter a product name.');
      return;
    }

    let p250 = null, p500 = null, p1kg = null, pUnit = null;

    if (editingProduct.hasWeights) {
      if (!editingProduct.price_250g || !editingProduct.price_500g || !editingProduct.price_1kg) {
        alert('Please enter prices for all three variants (250g, 500g, 1kg).');
        return;
      }
      p250 = parseFloat(editingProduct.price_250g);
      p500 = parseFloat(editingProduct.price_500g);
      p1kg = parseFloat(editingProduct.price_1kg);
      if (isNaN(p250) || isNaN(p500) || isNaN(p1kg)) {
        alert('All prices must be valid numbers.');
        return;
      }
    } else {
      if (!editingProduct.price) {
        alert('Please enter a unit price.');
        return;
      }
      pUnit = parseFloat(editingProduct.price);
      if (isNaN(pUnit)) {
        alert('Price must be a valid number.');
        return;
      }
    }

    // Check if it's simulated local product
    if (editingProduct.id.toString().startsWith('prod-') || editingProduct.id.toString().includes('prod-')) {
      setProductCards((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { 
          ...editingProduct, 
          price_250g: p250, 
          price_500g: p500, 
          price_1kg: p1kg,
          price: pUnit,
          hasWeights: editingProduct.hasWeights
        } : p))
      );
      setEditProductModalVisible(false);
      setEditingProduct(null);
      return;
    }

    // Find category ID from name
    const catNameInput = (editingProduct.categoryLabel?.trim() || editingProduct.tag?.trim() || '');
    const resolvedCategoryId = catNameToIdMap[catNameInput.toLowerCase()] || catNameInput || null;

    const updatedFields = {
      name: editingProduct.name.trim(),
      price_250g: p250,
      price_500g: p500,
      price_1kg: p1kg,
      price: pUnit,
      has_weights: editingProduct.hasWeights,
      tag: editingProduct.tag?.trim() || null,
      category_id: resolvedCategoryId,
      description: editingProduct.description?.trim() || '',
      image_url: editingProduct.image?.trim() || null,
      stock_quantity: parseInt(editingProduct.stock_quantity) || 0,
    };

    // --- Optimistic local update: shop reflects changes immediately ---
    const optimisticCard = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      price_250g: p250 ?? editingProduct.price_250g,
      price_500g: p500 ?? editingProduct.price_500g,
      price_1kg:  p1kg  ?? editingProduct.price_1kg,
      price:      pUnit ?? editingProduct.price,
      hasWeights: editingProduct.hasWeights,
      tag:        editingProduct.tag?.trim() || null,
      description: editingProduct.description?.trim() || '',
      image:      editingProduct.image?.trim() || editingProduct.image,
      stock_quantity: parseInt(editingProduct.stock_quantity) || 0,
    };
    setProductCards((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? { ...p, ...optimisticCard } : p))
    );
    setEditProductModalVisible(false);
    setEditingProduct(null);

    // --- Sync to Supabase: refresh session first, then update ---
    try {
      // 1. Ensure a valid JWT session
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData?.session;
      }
      if (!session) {
        alert('Admin session expired. Sign out and back in to save changes to the database.');
        return;
      }

      // 2. Push update
      const { error } = await supabase
        .from('products')
        .update(updatedFields)
        .eq('id', editingProduct.id);

      if (error) throw error;

      // 3. Verify it landed
      const { data: verified } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', editingProduct.id)
        .single();

      if (verified) {
        console.log('✅ Supabase confirmed update:', verified.name);
        loadSupabaseData();
      } else {
        alert('Saved locally. Supabase did not confirm the update — please sign out and back in as admin.');
      }
    } catch (err) {
      console.warn('Supabase update failed:', err.message);
      alert(`Changes saved locally only.\nError: ${err.message}\n\nSign out and back in as admin, then try again.`);
    }
  };

  function LoginModal({ email, setEmail, password, setPassword, onSubmit, onCancel }) {
    return (
      <ScrollView contentContainerStyle={styles.adminLoginContent} showsVerticalScrollIndicator={false}>
        <View style={styles.adminLoginCard}>
          <Text style={styles.cartPageKicker}>SIGN IN</Text>
          <Text style={styles.adminLoginTitle}>Enter your email and password.</Text>
          <Text style={styles.adminLoginBody}>
            Use your account to access the store.
          </Text>

          <View style={styles.adminLoginField}>
            <Text style={styles.adminLoginLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#89726F"
              style={styles.adminLoginInput}
            />
          </View>
          <View style={styles.adminLoginField}>
            <Text style={styles.adminLoginLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              placeholder="Password"
              placeholderTextColor="#89726F"
              style={styles.adminLoginInput}
            />
          </View>
          <Pressable style={styles.adminLoginButton} onPress={onSubmit}>
            <Text style={styles.adminLoginButtonText}>SIGN IN</Text>
          </Pressable>
          <Pressable style={styles.adminLoginCancelButton} onPress={onCancel}>
            <Text style={styles.adminLoginCancelText}>BACK TO SHOP</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const MIN_CARD = 160;
  const GAP = 8;
  const PADDING = 8;
  const availableWidth = width - (PADDING * 2);
  const columnCount = 2; // 👈 hardcode this — no Math, no logic
  const cardWidth = (availableWidth - (GAP * (columnCount - 1))) / columnCount;
  const isCompactCard = cardWidth < 200;
  const isCompactAdmin = width < 760;
  const isPhoneScreen = width < 600;
  const isMobileOrTablet = width <= 1400;
  const formatCurrency = (amount) => formatMoney(amount, currency);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    Animated.spring(cartBarAnim, {
      toValue: cartCount > 0 ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [cartCount, cartBarAnim]);
  const cartTotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);
  const isCartPage = false;
  const isAdminPage = currentPage === 'admin';
  const isAdminLoginPage = currentPage === 'adminLogin';
  const isShopPage = currentPage === 'shop';
  const isAccountPage = currentPage === 'account';
  const adminStatsList = useMemo(() => adminStats(productCards.length), [productCards.length]);

  const addToCart = (category, selectedWeight, itemPrice, qty = 1) => {
    const priceNum = Number(itemPrice);
    const quantityToAdd = Number(qty) || 1;
    
    setCartItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === category.id && item.selectedWeight === selectedWeight
      );

      if (existingItemIndex >= 0) {
        return currentItems.map((item, idx) => {
          if (idx !== existingItemIndex) return item;
          const quantity = item.quantity + quantityToAdd;
          return {
            ...item,
            quantity,
            lineTotal: +(item.unitPrice * quantity).toFixed(2),
          };
        });
      }

      return [
        ...currentItems,
        {
          id: category.id,
          name: category.name,
          image: category.image,
          selectedWeight,
          unitPrice: priceNum,
          quantity: quantityToAdd,
          lineTotal: +(priceNum * quantityToAdd).toFixed(2),
        },
      ];
    });
  };

  const removeFromCart = (categoryId, selectedWeight) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === categoryId && item.selectedWeight === selectedWeight)
      )
    );
  };

  const changeCartQuantity = (id, selectedWeight, delta) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== id || item.selectedWeight !== selectedWeight) {
            return item;
          }

          const quantity = item.quantity + delta;
          if (quantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity,
            lineTotal: +(item.unitPrice * quantity).toFixed(2),
          };
        })
        .filter(Boolean),
    );
  };

  const openAdmin = () => {
    setCurrentPage(adminUnlocked ? 'admin' : 'adminLogin');
  };

  const handleLogin = async () => {
    const enteredEmail = authEmail.trim().toLowerCase();

    // Try Supabase login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (!error && data?.user) {
        // Check admin using profiles table
        const isAdmin = await checkAdmin(data.user);
        
        if (isAdmin) {
          setAdminUnlocked(true);
          setCurrentPage('admin');
        } else {
          setCurrentPage('shop');
        }
        setAuthModalVisible(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase authentication failed:', err.message);
      alert('Invalid login credentials or authentication error.');
    }
  };

  const submitAdminLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: authPassword,
      });

      if (error) throw error;

      if (data?.user) {
        const isAdmin = await checkAdmin(data.user);
        
        if (isAdmin) {
          setAdminUnlocked(true);
          setCurrentPage('admin');
        } else {
          alert('You do not have admin privileges.');
        }
      }
    } catch (err) {
      alert('Invalid credentials or authentication error.');
    }
  };

  const uniqueCustomers = useMemo(() => {
    const map = new Map();
    adminOrders.forEach(order => {
      const phone = order.metadata?.customer_phone;
      if (phone) {
        if (!map.has(phone)) {
          map.set(phone, {
            name: order.metadata?.customer_name || 'Guest',
            phone: phone,
            totalSpent: order.total || 0,
            orderCount: 1,
            email: order.metadata?.customer_email || 'N/A'
          });
        } else {
          const existing = map.get(phone);
          existing.totalSpent += (order.total || 0);
          existing.orderCount += 1;
          if (order.metadata?.customer_name && existing.name === 'Guest') {
            existing.name = order.metadata.customer_name;
          }
        }
      }
    });
    return Array.from(map.values()).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [adminOrders]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={[styles.header, isPhoneScreen && { paddingHorizontal: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Brand name removed for cleaner look */}
        </View>
        <View style={[styles.headerActions, isPhoneScreen && { gap: 6 }]}>
          <Pressable
            style={[styles.currencyBtn, isPhoneScreen && { paddingHorizontal: 8, paddingVertical: 4 }]}
            onPress={() => setCurrency((prev) => currencyOptions[(currencyOptions.indexOf(prev) + 1) % currencyOptions.length])}
          >
            <Text style={[styles.currencyBtnText, isPhoneScreen && { fontSize: 10 }]}>{currency}</Text>
          </Pressable>
          <Pressable style={styles.badgeWrap} onPress={openCart}>
            <Text style={styles.headerIcon}>bag</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {isAccountPage ? (
        <ScrollView style={styles.cartPageLayout} contentContainerStyle={{padding: 20}}>
          <View style={{marginBottom: 20}}>
            <Text style={{fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: palette.oxblood}}>My Account</Text>
            <Text style={{color: palette.secondary, marginTop: 4}}>Welcome back, {user?.user_metadata?.full_name || 'Guest'}!</Text>
          </View>
          
          <View style={{backgroundColor: palette.background, borderWidth: 1, borderColor: palette.oxblood, padding: 20, marginBottom: 20}}>
            <Text style={{fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: palette.oxblood, marginBottom: 16}}>Order History</Text>
            {customerOrdersLoading ? (
              <Text style={{color: palette.secondary}}>Loading orders...</Text>
            ) : customerOrders.length > 0 ? (
              customerOrders.map(order => (
                <View key={order.id} style={{flexDirection: 'column', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8}}>
                    <View style={{flex: 1}}>
                      <Text style={{fontWeight: '700', color: palette.charcoal, fontSize: 11}} numberOfLines={1} ellipsizeMode="tail">
                        Order #{String(order.id).slice(0, 8).toUpperCase()}...
                      </Text>
                      <Text style={{fontSize: 11, color: palette.secondary, marginTop: 2}}>{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end', flexShrink: 0}}>
                      <Text style={{fontWeight: '700', color: palette.oxblood}}>{formatCurrency(order.total)}</Text>
                      <View style={{backgroundColor: order.status === 'Pending' ? '#FDE68A' : order.status === 'Processing' ? '#93C5FD' : order.status === 'Delivered' ? '#86EFAC' : '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4}}>
                        <Text style={{fontSize: 10, fontWeight: '700', color: '#1F2937'}}>{String(order.status).toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {order.order_items && order.order_items.length > 0 && (
                    <View style={{marginTop: 12}}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 12}}>
                        {order.order_items.map((item, idx) => {
                          const product = productCards.find(p => p.id === item.product_id);
                          const imageUrl = product ? product.image : 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80';
                          return (
                            <View key={idx} style={{alignItems: 'center', width: 44}}>
                              <Image source={{uri: imageUrl}} style={{width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'}} />
                              <Text style={{fontSize: 10, color: palette.secondary, marginTop: 4, fontWeight: '700'}}>{item.quantity}x</Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={{color: palette.secondary}}>You haven't placed any orders yet.</Text>
            )}
          </View>
          
            <Pressable
              style={{backgroundColor: palette.oxblood, padding: 14, alignItems: 'center', marginBottom: 12}}
              onPress={() => setCurrentPage('shop')}
              accessibilityLabel="Back to Shop"
            >
              <Text style={{color: '#fff', fontWeight: '700', letterSpacing: 1}}>
                BACK TO SHOP
              </Text>
            </Pressable>

            <Pressable
              style={{borderWidth: 1, borderColor: palette.oxblood, padding: 14, alignItems: 'center'}}
              onPress={handleLogout}
              accessibilityLabel="Sign Out"
            >
              <Text style={{color: palette.oxblood, fontWeight: '700', letterSpacing: 1}}>
                SIGN OUT
              </Text>
            </Pressable>
        </ScrollView>
      ) : isAdminLoginPage ? (
        <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 500 }} showsVerticalScrollIndicator={false}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderTopWidth: 4, borderTopColor: palette.oxblood, padding: 36, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.08, shadowRadius: 24 }}>

            {/* Logo / Brand */}
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 3, color: palette.oxblood, marginBottom: 8 }}>JFAMCO</Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', color: palette.charcoal, marginBottom: 4 }}>Admin Login</Text>
            <Text style={{ fontSize: 13, color: palette.secondary, marginBottom: 32, lineHeight: 20 }}>Sign in with your admin account to access the dashboard.</Text>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 1, marginBottom: 6 }}>EMAIL ADDRESS</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="admin@example.com"
                placeholderTextColor="#C4A89C"
                style={{ borderWidth: 1, borderColor: 'rgba(74,4,4,0.2)', backgroundColor: '#FAFAFA', padding: 14, fontSize: 14, color: palette.charcoal }}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 1, marginBottom: 6 }}>PASSWORD</Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry={true}
                placeholder="••••••••"
                placeholderTextColor="#C4A89C"
                style={{ borderWidth: 1, borderColor: 'rgba(74,4,4,0.2)', backgroundColor: '#FAFAFA', padding: 14, fontSize: 14, color: palette.charcoal }}
              />
            </View>

            {/* Sign In Button */}
            <Pressable
              onPress={() => { setIsLoginMode(true); handleLogin(); }}
              style={({ pressed }) => [{ backgroundColor: pressed ? '#3a0303' : palette.oxblood, paddingVertical: 16, alignItems: 'center', marginBottom: 14 }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 2 }}>SIGN IN</Text>
            </Pressable>

            {/* Back to Shop */}
            <Pressable onPress={() => setCurrentPage('shop')} style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.oxblood, letterSpacing: 1 }}>← BACK TO SHOP</Text>
            </Pressable>

          </View>
        </ScrollView>
      ) : isAdminPage ? (
        <View style={styles.adminDashboardLayout}>
          {/* SIDEBAR */}
          <View style={[styles.adminSidebar, isCompactAdmin && { display: 'none' }]}>
            <Text style={styles.adminSidebarBrand}>JFAMCO</Text>
            
            <View style={styles.adminProfileBlock}>
              <Pressable onPress={() => { setTempAvatarUrl(adminAvatarUrl); setAdminProfileModalVisible(true); }}>
                <Image source={{ uri: adminAvatarUrl }} style={styles.adminAvatar} />
                <View style={{position: 'absolute', bottom: -2, right: -2, backgroundColor: '#4A0404', borderRadius: 12, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                  <FontAwesome name="pencil" size={10} color="#fff" />
                </View>
              </Pressable>
              <View style={styles.adminProfileInfo}>
                <Text style={styles.adminProfileName}>Administrator</Text>
                <Text style={styles.adminProfileRole}>ADMIN ACCESS</Text>
              </View>
            </View>

            <View style={styles.adminNavList}>
              {['Dashboard', 'Inventory', 'Orders', 'Customers', 'Analytics'].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setActiveAdminTab(item)}
                  style={[styles.adminNavItem, activeAdminTab === item && styles.adminNavItemActive]}
                >
                  <Text style={[styles.adminNavText, activeAdminTab === item && styles.adminNavTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.adminNavListBottom}>
              {['Settings', 'Price Update'].map((item) => (
                <Pressable key={item} style={styles.adminNavItem}>
                  <Text style={styles.adminNavText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* MAIN CONTENT */}
          <ScrollView style={styles.adminMainContent} contentContainerStyle={styles.adminMainScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.adminTopHeader}>
              <Text style={styles.adminMainTitle}>{activeAdminTab}</Text>
              <View style={styles.adminTopIcons}>
                <Pressable onPress={() => {
                  setAdminUnlocked(false);
                  setCurrentPage('shop');
                }} style={{ marginRight: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#5F5E5F' }}>LOGOUT</Text>
                </Pressable>
              </View>
            </View>

            {/* CURRENCY TOGGLE */}
            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Analytics') && (
            <View style={styles.adminCurrencySection}>
              <Text style={styles.adminSectionSubTitle}>CURRENCY</Text>
              <View style={styles.adminCurrencyToggleRow}>
                {currencyOptions.map((option) => {
                  const active = option === currency;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setCurrency(option)}
                      style={[styles.adminCurrencyToggle, active && styles.adminCurrencyToggleActive, isCompactAdmin && { paddingHorizontal: 12, paddingVertical: 6 }]}
                    >
                      <Text style={[styles.adminCurrencyToggleText, active && styles.adminCurrencyToggleTextActive]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            )}

            {/* STATS */}
            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Analytics') && (
            <View style={styles.adminStatCardsRow}>
              <View style={styles.adminNewStatCard}>
                <View style={styles.adminNewStatCardHeader}>
                  <Text style={styles.adminNewStatLabel}>REVENUE</Text>
                  <View style={analyticsData.revStyle.bg}><Text style={analyticsData.revStyle.text}>{analyticsData.revGrowthStr}</Text></View>
                </View>
                <Text style={styles.adminNewStatValue}>{formatCurrency(adminOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0))}</Text>
                <View style={styles.adminStatLine} />
              </View>
              
              <View style={styles.adminNewStatCard}>
                <View style={styles.adminNewStatCardHeader}>
                  <Text style={styles.adminNewStatLabel}>TOTAL ORDERS</Text>
                  <View style={analyticsData.orderStyle.bg}><Text style={analyticsData.orderStyle.text}>{analyticsData.orderGrowthStr}</Text></View>
                </View>
                <Text style={styles.adminNewStatValue}>{adminOrders.length}</Text>
                <Text style={styles.adminNewStatSub}>Lifetime orders</Text>
              </View>
              
              <View style={[styles.adminNewStatCard, styles.adminNewStatCardDark]}>
                <View style={styles.adminNewStatCardHeader}>
                  <Text style={[styles.adminNewStatLabel, {color: '#fff'}]}>ACTIVE SHIPMENTS</Text>
                </View>
                <Text style={[styles.adminNewStatValue, {color: '#fff'}]}>{adminOrders.filter(o => ['processing', 'delivery'].includes(String(o.status).toLowerCase())).length}</Text>
                <Text style={[styles.adminNewStatSub, {color: '#FF9999'}]}>{adminOrders.filter(o => String(o.status).toLowerCase() === 'delivery').length} delivering today</Text>
                <Text style={styles.adminDarkCardIcon}>🚚</Text>
              </View>
            </View>
            )}

            {/* INVENTORY TABLE */}
            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Inventory') && (
            <View style={styles.adminDashboardSection}>
              <View style={styles.adminDashboardSectionHeader}>
                <Text style={styles.adminMainSubtitle}>Inventory Management</Text>
                <Pressable style={styles.adminDarkButton} onPress={() => setAddProductModalVisible(true)}>
                  <Text style={styles.adminDarkButtonText}>Add New Product</Text>
                </Pressable>
              </View>

              <View style={styles.adminNewTable}>
                <View style={[styles.adminNewTableHeader, isCompactAdmin && { display: 'none' }]}>
                  <Text style={[styles.adminNewTableCol, {flex: 3}]}>PRODUCT</Text>
                  <Text style={[styles.adminNewTableCol, {flex: 1}]}>CURRENT STOCK</Text>
                  <Text style={[styles.adminNewTableCol, {flex: 1}]}>STATUS</Text>
                  <Text style={[styles.adminNewTableCol, {flex: 0.5, textAlign: 'right'}]}>ACTION</Text>
                </View>
                
                {productCards.slice(0, activeAdminTab === 'Dashboard' ? 5 : undefined).map((product, idx) => {
                  const stockValue = Number(product.stock_quantity) || 0;
                  const isLow = stockValue < 15;
                  return (
                    <View key={product.id} style={[styles.adminNewTableRow, isCompactAdmin && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
                      <View style={[{flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12}, isCompactAdmin && { width: '100%' }]}>
                        <Image source={{uri: product.image}} style={styles.adminNewTableImage} />
                        <Text style={styles.adminNewTableTitle}>{product.name}</Text>
                      </View>

                      {!isCompactAdmin && (
                        <>
                          <View style={{flex: 1, justifyContent: 'center'}}>
                            <Text style={styles.adminNewTableText}>{stockValue}kg</Text>
                          </View>
                          <View style={{flex: 1, justifyContent: 'center'}}>
                            <View style={isLow ? styles.adminStatusBadgeRed : styles.adminStatusBadgeGreen}>
                              <Text style={isLow ? styles.adminStatusBadgeRedText : styles.adminStatusBadgeGreenText}>
                                {isLow ? 'Low Stock' : 'In Stock'}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}

                      <View style={[{flex: 0.5, alignItems: 'flex-end', justifyContent: 'center'}, isCompactAdmin && { position: 'absolute', right: 20, top: 28 }]}>
                        <Pressable onPress={() => {
                          setEditingProduct({
                            id: product.id,
                            name: product.name,
                            price_250g: String(product.price_250g ?? '0'),
                            price_500g: String(product.price_500g ?? '0'),
                            price_1kg: String(product.price_1kg ?? '0'),
                            price: String(product.price ?? ''),
                            hasWeights: product.hasWeights ?? true,
                            tag: product.tag || '',
                            categoryLabel: product.categoryLabel || '',
                            description: product.description || '',
                            image: product.image || '',
                            stock_quantity: String(product.stock_quantity || '0'),
                          });
                          setEditProductModalVisible(true);
                        }}>
                          <Text style={styles.adminEditIcon}>✎</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            )}

            {/* RECENT ORDERS */}
            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Orders') && (
            <View style={styles.adminDashboardSection}>
              <Text style={styles.adminMainSubtitle}>{activeAdminTab === 'Orders' ? 'All Orders' : 'Recent Orders'}</Text>
              <View style={styles.adminOrdersList}>
                {(adminOrders.length > 0 ? (activeAdminTab === 'Dashboard' ? adminOrders.slice(0, 3) : adminOrders) : [
                  {id: '#MC-84920', status: 'PROCESSING', metadata: { customer_name: 'A. Thompson', customer_phone: '+233241234567' }, order_items: [1,2], total: 84.50},
                  {id: '#MC-84919', status: 'DELIVERY', metadata: { customer_name: 'J. Richards', customer_phone: '+233209876543' }, order_items: [1,2,3,4,5], total: 212.00},
                  {id: '#MC-84918', status: 'PROCESSING', metadata: { customer_name: 'L. Sterling', customer_phone: '+233551112233' }, order_items: [1], total: 45.99},
                ]).map(order => (
                  <View key={order.id} style={styles.adminNewOrderCard}>
                    <View>
                      <Text style={styles.adminOrderCardId}>{order.id}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                        <Text style={styles.adminOrderCardUser}>{order.metadata?.customer_name || 'Guest'}</Text>
                        <Pressable onPress={() => {
                          const phone = order.metadata?.customer_phone || '+233240000000';
                          let waPhone = phone.replace(/[^0-9]/g, '');
                          if (waPhone.startsWith('0')) {
                            waPhone = '233' + waPhone.substring(1);
                          }
                          Linking.openURL(`https://wa.me/${waPhone}`);
                        }}>
                          <FontAwesome name="whatsapp" size={16} color={order.status === 'DELIVERY' || order.status === 'Delivered' ? '#4A0404' : '#10B981'} />
                        </Pressable>
                        <Pressable onPress={() => deleteOrder(order.id)} style={{marginLeft: 8}}>
                          <FontAwesome name="trash-o" size={16} color="#D26A5F" />
                        </Pressable>
                      </View>
                      <Text style={styles.adminOrderCardMeta}>
                        {(order.order_items?.length || 1)} Item{(order.order_items?.length !== 1) ? 's' : ''} • Pickup
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Pressable 
                        onPress={() => {
                          const statuses = ['Pending', 'Processing', 'Delivery', 'Delivered'];
                          const currentIdx = statuses.findIndex(s => String(order.status).toLowerCase() === s.toLowerCase());
                          const nextStatus = statuses[(currentIdx + 1) % statuses.length];
                          updateOrderStatus(order.id, nextStatus);
                        }}
                        style={[
                          styles.adminOrderCardStatusBadge, 
                          { backgroundColor: String(order.status).toLowerCase() === 'pending' ? '#FFF3CD' : 
                                           String(order.status).toLowerCase() === 'processing' ? '#CCE5FF' : 
                                           String(order.status).toLowerCase() === 'delivery' ? '#D4EDDA' : 
                                           String(order.status).toLowerCase() === 'delivered' ? '#A855F7' : '#F3F4F6' }
                        ]}
                      >
                        <Text style={[
                          styles.adminOrderCardStatusText,
                          { color: String(order.status).toLowerCase() === 'pending' ? '#856404' : 
                                   String(order.status).toLowerCase() === 'processing' ? '#004085' : 
                                   String(order.status).toLowerCase() === 'delivery' ? '#155724' : 
                                   String(order.status).toLowerCase() === 'delivered' ? '#FFFFFF' : '#6B7280' }
                        ]}>{String(order.status).toUpperCase()}</Text>
                      </Pressable>
                      <Text style={styles.adminOrderCardAmount}>
                        {formatCurrency(order.total || 0)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              {activeAdminTab === 'Dashboard' && (
                <Pressable style={styles.adminOutlineButton} onPress={() => setActiveAdminTab('Orders')}>
                  <Text style={styles.adminOutlineButtonText}>View All Orders</Text>
                </Pressable>
              )}
            </View>
            )}

            {/* CUSTOMERS CRM */}
            {(activeAdminTab === 'Customers') && (
            <View style={styles.adminDashboardSection}>
              <Text style={styles.adminMainSubtitle}>Customer CRM & WhatsApp</Text>
              <View style={styles.adminOrdersList}>
                {uniqueCustomers.length > 0 ? uniqueCustomers.map((customer, idx) => (
                  <View key={idx} style={styles.adminNewOrderCard}>
                    <View>
                      <Text style={[styles.adminOrderCardId, {fontSize: 16}]}>{customer.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                        <Text style={[styles.adminOrderCardUser, {fontSize: 13}]}>{customer.phone}</Text>
                      </View>
                      <Text style={[styles.adminOrderCardMeta, {marginTop: 4}]}>
                        {customer.orderCount} Order{customer.orderCount !== 1 ? 's' : ''} • {customer.email}
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end', justifyContent: 'space-between'}}>
                      <Pressable onPress={() => {
                        let waPhone = customer.phone.replace(/[^0-9]/g, '');
                        if (waPhone.startsWith('0')) {
                          waPhone = '233' + waPhone.substring(1);
                        }
                        Linking.openURL(`https://wa.me/${waPhone}`);
                      }} style={{backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <FontAwesome name="whatsapp" size={16} color="#FFF" />
                        <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 12}}>Message</Text>
                      </Pressable>
                      <Text style={[styles.adminOrderCardAmount, {marginTop: 8}]}>
                        {formatCurrency(customer.totalSpent)}
                      </Text>
                    </View>
                  </View>
                )) : (
                  <Text style={{color: '#888', fontStyle: 'italic', padding: 20}}>No customers found.</Text>
                )}
              </View>
            </View>
            )}
            <View style={{height: 80}} />
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
          <Image
            source={{ uri: HERO_IMAGES[currentHeroSlide] }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <Animated.View style={[styles.heroTextWrap, { opacity: reveal, transform: [{ translateY: lift }] }]}>
            <Text style={styles.kicker}>JFAMCO</Text>
            <Text style={styles.heroTitle}>Quality Products,{`\n`}Delivered Fresh.</Text>
            <Text style={styles.heroBody}>
              Transparency in sourcing. Excellence in quality. The definitive collection for
              every household and business.
            </Text>
            <View style={styles.heroActionsRow}>
              <Pressable style={styles.heroBtn} onPress={() => setCurrentPage('shop')}>
                <Text style={styles.heroBtnText}>SHOP NOW</Text>
              </Pressable>
              <Pressable style={styles.heroOutlineBtn} onPress={openCart}>
                <Text style={styles.heroOutlineBtnText}>VIEW CART</Text>
              </Pressable>
            </View>
          </Animated.View>

          <View style={{position: 'absolute', bottom: 24, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8}}>
            {HERO_IMAGES.map((_, i) => (
              <View key={i} style={{width: i === currentHeroSlide ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === currentHeroSlide ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s ease'}} />
            ))}
          </View>
        </View>

        <PromoBannerStrip 
          onBannerPress={(banner) => {
            console.log('Banner clicked:', banner.title);
            // You can add navigation or open product detail here
            if (banner.product_id) {
              const product = productCards.find(p => p.id === banner.product_id);
              if (product) {
                setSelectedProduct(product);
                setProductDetailVisible(true);
              }
            }
          }}
        />

        {(() => {
          const chips = categoryChips.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.chipGridItem, 
                  active && styles.chipActive,
                  isMobileOrTablet && { paddingHorizontal: 12, paddingVertical: 6, minHeight: 30 }
                ]}
              >
                <Text style={[
                  styles.chipText, 
                  active && styles.chipTextActive,
                  isMobileOrTablet && { fontSize: 11 }
                ]}>{cat}</Text>
              </Pressable>
            );
          });

          if (isMobileOrTablet) {
            return (
              <View style={[styles.chipsScrollContent, { flexWrap: 'wrap', paddingBottom: 12, marginTop: 8, width: '100%', justifyContent: 'flex-start' }]}>
                {chips}
              </View>
            );
          }

          return (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContent}
              style={styles.chipsScrollView}
            >
              {chips}
            </ScrollView>
          );
        })()}

<View style={styles.searchWrap}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search category"
              placeholderTextColor="#89726F"
              style={[styles.searchInput, {flex: 1}]}
            />
            <Pressable 
              onPress={refreshProducts}
              style={{
                backgroundColor: '#FFD700',
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 4,
              }}
              accessibilityLabel="Refresh products"
            >
              <FontAwesome name="refresh" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={[styles.productGrid, { paddingHorizontal: 0, rowGap: 0, columnGap: 0, paddingBottom: 200 }]}>
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              cardWidth={cardWidth}
              currency={currency}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              cartItems={cartItems}
              onViewDetails={(product) => {
                setSelectedProduct(product);
                setProductDetailVisible(true);
              }}
              isPhone={isCompactCard}
            />
          ))}
          {filteredCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No category found</Text>
              <Text style={styles.emptyBody}>Try another search term or select a different chip.</Text>
            </View>
          ) : null}
        </View>
        </ScrollView>
      )}

      <Animated.View 
        style={[
          styles.checkoutBar,
          {
            opacity: cartBarAnim,
            transform: [
              {
                translateY: cartBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={cartCount > 0 ? 'auto' : 'none'}
      >
        <View>
          <Text style={styles.checkoutLabel}>CATEGORY RESULTS</Text>
          <Text style={styles.checkoutText}>{cartCount} in cart</Text>
        </View>
        <View style={styles.checkoutActions}>
          <Pressable style={styles.checkoutBtn} onPress={openCart}>
            <Text style={styles.checkoutBtnText}>VIEW CART</Text>
          </Pressable>
        </View>
      </Animated.View>

      <View style={styles.bottomNav}>
        <Pressable
          key="shop"
          style={[styles.navItem, currentPage === 'shop' && styles.navActive]}
          onPress={() => setCurrentPage('shop')}
        >
          <FontAwesome name="home" size={20} color={currentPage === 'shop' ? '#28A745' : '#FFFFFF'} />
          <Text style={[styles.navLabel, currentPage === 'shop' && styles.navLabelActive]}>Shop</Text>
        </Pressable>

        <Pressable
          key="cart"
          style={[styles.navItem, cartModalVisible && styles.navActive]}
          onPress={openCart}
        >
          <FontAwesome name="shopping-cart" size={20} color={cartModalVisible ? '#28A745' : '#FFFFFF'} />
          <Text style={[styles.navLabel, cartModalVisible && styles.navLabelActive]}>Cart</Text>
        </Pressable>

        <Pressable
          key="account"
          style={[styles.navItem, userAccountSheetVisible && styles.navActive]}
          onPress={() => {
            if (user) {
              fetchCustomerOrders();
              setUserAccountSheetVisible(true);
            } else {
              setIsLoginMode(true);
              setAuthModalVisible(true);
            }
          }}
        >
          <FontAwesome name="user" size={20} color={userAccountSheetVisible ? '#28A745' : '#FFFFFF'} />
          <Text style={[styles.navLabel, userAccountSheetVisible && styles.navLabelActive]}>
            {user ? 'Account' : 'Sign In'}
          </Text>
        </Pressable>
      </View>

      {/* CHECKOUT MODAL */}
      <Modal visible={checkoutModalVisible} animationType="fade" transparent={true} onRequestClose={() => setCheckoutModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ 
            backgroundColor: palette.background, 
            borderWidth: 1, 
            borderColor: palette.oxblood, 
            padding: 20,
            width: '100%',
            maxWidth: 580,
            alignSelf: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8
          }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>DELIVERY DETAILS</Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: palette.oxblood, marginTop: 4 }}>Complete Your Order</Text>
              <Text style={{ fontSize: 13, color: palette.secondary, lineHeight: 18, marginBottom: 8 }}>
                Provide your contact details and shipping address to place this order. Payment is cash on delivery.
              </Text>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>FULL NAME *</Text>
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PHONE NUMBER *</Text>
                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  keyboardType="phone-pad"
                  placeholder="e.g. +233 24 000 0000"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>EMAIL ADDRESS</Text>
                <TextInput
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. john@example.com"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>DELIVERY ADDRESS *</Text>
                <TextInput
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline={true}
                  numberOfLines={3}
                  placeholder="Street name, house number, landmarks..."
                  placeholderTextColor="#89726F"
                  style={[styles.adminLoginInput, { height: 80, textAlignVertical: 'top' }]}
                />
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 8, flexDirection: 'row', gap: 10 }}>
                <Pressable 
                  onPress={() => setCheckoutModalVisible(false)}
                  style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}
                >
                  <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>
                </Pressable>
                
                <Pressable 
                  onPress={submitOrder}
                  disabled={isSubmittingOrder}
                  style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}
                >
                  {isSubmittingOrder ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>PLACE ORDER</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CART BOTTOM SHEET */}
      <Modal visible={cartModalVisible} animationType="none" transparent={true} onRequestClose={closeCart}>
        <View style={styles.bottomSheetBackdrop}>
          <Pressable style={styles.bottomSheetBackdropDismiss} onPress={closeCart} />
          <Animated.View style={[styles.bottomSheetContainer, {
            transform: [{
              translateY: cartSheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1000],
              })
            }]
          }]}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>YOUR CART</Text>
              <Pressable onPress={closeCart} style={{ padding: 4 }}>
                <Text style={styles.bottomSheetCloseBtn}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <View key={`${item.id}-${item.selectedWeight}`} style={styles.cartRow}>
                    <View style={styles.cartRowTextWrap}>
                      <View style={styles.cartRowTop}>
                        <Image source={{ uri: item.image }} style={styles.cartRowImage} />
                        <View style={styles.cartRowCopy}>
                          <Text style={styles.cartRowName}>{item.name}</Text>
                          <Text style={styles.cartRowMeta}>
                            {item.selectedWeight && item.selectedWeight !== 'unit' ? `${item.selectedWeight} · ` : ''}{formatCurrency(item.unitPrice)} each
                          </Text>
                          <Text style={styles.cartRowMeta}>Line total: {formatCurrency(item.lineTotal)}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cartRowControls}>
                      <Pressable
                        onPress={() => changeCartQuantity(item.id, item.selectedWeight, -1)}
                        style={styles.cartStepButton}
                      >
                        <Text style={styles.cartStepButtonText}>-</Text>
                      </Pressable>
                      <Text style={styles.cartQuantity}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => changeCartQuantity(item.id, item.selectedWeight, 1)}
                        style={styles.cartStepButton}
                      >
                        <Text style={styles.cartStepButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyState, { marginVertical: 32 }]}>
                  <Text style={styles.emptyTitle}>Your cart is empty</Text>
                  <Text style={styles.emptyBody}>Add products from the shop to see them here.</Text>
                </View>
              )}
            </ScrollView>

            {cartItems.length > 0 && (
              <View style={styles.bottomSheetSummaryCard}>
                <View>
                  <Text style={styles.bottomSheetSummaryLabel}>TOTAL AMOUNT</Text>
                  <Text style={styles.bottomSheetSummaryValue}>{formatCurrency(cartTotal)}</Text>
                </View>
                <Pressable style={styles.checkoutBtn} onPress={() => {
                  closeCart();
                  if (!user) {
                    alert('Please sign in or create an account to proceed to checkout.');
                    setIsLoginMode(true);
                    setAuthModalVisible(true);
                  } else {
                    setCheckoutModalVisible(true);
                  }
                }}>
                  <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* ORDER SUCCESS MODAL */}
      <Modal visible={orderSuccessModalVisible} animationType="fade" transparent={true} onRequestClose={() => setOrderSuccessModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: palette.vault, borderWidth: 1, borderColor: '#fff', padding: 22, alignItems: 'center' }}>
            <Text style={{ color: palette.oxbloodSoft, fontSize: 36, fontWeight: 'bold', marginBottom: 12 }}>✓</Text>
            <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>ORDER PLACED SUCCESSFULLY</Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginTop: 6, marginBottom: 12 }}>
              Thank you for your order!
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 18 }}>
              Your order has been recorded. Our butcher is preparing your cuts. You will receive a call shortly at the provided number to confirm delivery.
            </Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: '100%', padding: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#888989', letterSpacing: 1 }}>ORDER REFERENCE</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Georgia', marginTop: 4 }}>
                {lastCreatedOrderId}
              </Text>
            </View>

            <Pressable 
              onPress={() => {
                setOrderSuccessModalVisible(false);
                setCurrentPage('shop');
              }}
              style={{ backgroundColor: palette.oxbloodSoft, width: '100%', paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1.4 }}>CONTINUE SHOPPING</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ADMIN PROFILE MODAL */}
      <Modal visible={adminProfileModalVisible} animationType="fade" transparent={true} onRequestClose={() => setAdminProfileModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ 
            backgroundColor: palette.background, 
            borderWidth: 1, 
            borderColor: palette.oxblood, 
            padding: 20,
            width: '100%',
            maxWidth: 580,
            alignSelf: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8
          }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: palette.oxblood, marginBottom: 14 }}>Update Profile Photo</Text>
            
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>IMAGE URL</Text>
              <TextInput
                value={tempAvatarUrl}
                onChangeText={setTempAvatarUrl}
                placeholder="Paste new image URL..."
                placeholderTextColor="#89726F"
                style={styles.adminLoginInput}
              />
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 14, flexDirection: 'row', gap: 10 }}>
              <Pressable 
                onPress={() => setAdminProfileModalVisible(false)}
                style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}
              >
                <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => {
                  setAdminAvatarUrl(tempAvatarUrl);
                  setAdminProfileModalVisible(false);
                }}
                style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>SAVE PHOTO</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADMIN ADD PRODUCT MODAL */}
      <Modal visible={addProductModalVisible} animationType="fade" transparent={true} onRequestClose={() => setAddProductModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ 
            backgroundColor: palette.background, 
            borderWidth: 1, 
            borderColor: palette.oxblood, 
            padding: 20,
            width: '100%',
            maxWidth: 580,
            alignSelf: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8
          }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>CATALOG MANAGER</Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: palette.oxblood, marginTop: 4 }}>Add New Product</Text>
              
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRODUCT NAME *</Text>
                <TextInput
                  value={newProduct.name}
                  onChangeText={(txt) => setNewProduct({ ...newProduct, name: txt })}
                  placeholder="e.g. Ribeye Steak A5"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICING TYPE *</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable
                    onPress={() => setNewProduct({ ...newProduct, has_weights: true })}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: newProduct.has_weights ? palette.oxblood : 'rgba(27,28,28,0.2)',
                      backgroundColor: newProduct.has_weights ? 'rgba(74,4,4,0.05)' : '#fff',
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: newProduct.has_weights ? palette.oxblood : palette.secondary }}>WEIGHT-BASED</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setNewProduct({ ...newProduct, has_weights: false })}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: !newProduct.has_weights ? palette.oxblood : 'rgba(27,28,28,0.2)',
                      backgroundColor: !newProduct.has_weights ? 'rgba(74,4,4,0.05)' : '#fff',
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: !newProduct.has_weights ? palette.oxblood : palette.secondary }}>UNIT-BASED</Text>
                  </Pressable>
                </View>
              </View>

              {newProduct.has_weights ? (
                <>
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR 250G *</Text>
                    <TextInput
                      value={newProduct.price_250g}
                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_250g: txt })}
                      keyboardType="numeric"
                      placeholder="e.g. 6.50"
                      placeholderTextColor="#89726F"
                      style={styles.adminLoginInput}
                    />
                  </View>

                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR 500G *</Text>
                    <TextInput
                      value={newProduct.price_500g}
                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_500g: txt })}
                      keyboardType="numeric"
                      placeholder="e.g. 12.00"
                      placeholderTextColor="#89726F"
                      style={styles.adminLoginInput}
                    />
                  </View>

                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR 1KG *</Text>
                    <TextInput
                      value={newProduct.price_1kg}
                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_1kg: txt })}
                      keyboardType="numeric"
                      placeholder="e.g. 22.00"
                      placeholderTextColor="#89726F"
                      style={styles.adminLoginInput}
                    />
                  </View>
                </>
              ) : (
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>UNIT PRICE *</Text>
                  <TextInput
                    value={newProduct.price}
                    onChangeText={(txt) => setNewProduct({ ...newProduct, price: txt })}
                    keyboardType="numeric"
                    placeholder="e.g. 35.00"
                    placeholderTextColor="#89726F"
                    style={styles.adminLoginInput}
                  />
                </View>
              )}

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CATEGORY / CHIP (E.g. Chicken, Beef, Pork) *</Text>
                <TextInput
                  value={newProduct.category_name}
                  onChangeText={(txt) => setNewProduct({ ...newProduct, category_name: txt, tag: txt })}
                  placeholder="e.g. Cow And Beef"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>TAG / LABEL (E.g. Best Seller)</Text>
                <TextInput
                  value={newProduct.tag}
                  onChangeText={(txt) => setNewProduct({ ...newProduct, tag: txt })}
                  placeholder="e.g. Best Seller"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>DESCRIPTION *</Text>
                <TextInput
                  value={newProduct.description}
                  onChangeText={(txt) => setNewProduct({ ...newProduct, description: txt })}
                  multiline={true}
                  numberOfLines={2}
                  placeholder="Describe cuts, grade, source..."
                  placeholderTextColor="#89726F"
                  style={[styles.adminLoginInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>IMAGE URL</Text>
                <TextInput
                  value={newProduct.image_url}
                  onChangeText={(txt) => setNewProduct({ ...newProduct, image_url: txt })}
                  placeholder="Paste URL starting with https://..."
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CURRENT STOCK ({newProduct.has_weights ? 'KG' : 'UNITS'})</Text>
                <TextInput
                  value={newProduct.stock_quantity}
                  onChangeText={(txt) => setNewProduct({ ...newProduct, stock_quantity: txt })}
                  keyboardType="numeric"
                  placeholder="e.g. 50"
                  placeholderTextColor="#89726F"
                  style={styles.adminLoginInput}
                />
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 8, flexDirection: 'row', gap: 10 }}>
                <Pressable 
                  onPress={() => setAddProductModalVisible(false)}
                  style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}
                >
                  <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>
                </Pressable>
                
                <Pressable 
                  onPress={adminAddProduct}
                  style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>SAVE PRODUCT</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ADMIN EDIT PRODUCT MODAL */}
      <Modal visible={editProductModalVisible} animationType="fade" transparent={true} onRequestClose={() => setEditProductModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>
          {editingProduct && (
            <View style={{ 
              backgroundColor: palette.background, 
              borderWidth: 1, 
              borderColor: palette.oxblood, 
              padding: 20,
              width: '100%',
              maxWidth: 580,
              alignSelf: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8
            }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>CATALOG MANAGER</Text>
                <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: palette.oxblood, marginTop: 4 }}>Edit Product</Text>
                
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRODUCT NAME *</Text>
                  <TextInput
                    value={editingProduct.name}
                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, name: txt })}
                    placeholder="Product Name"
                    placeholderTextColor="#89726F"
                    style={styles.adminLoginInput}
                  />
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICING TYPE *</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      onPress={() => setEditingProduct({ ...editingProduct, hasWeights: true })}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: editingProduct.hasWeights ? palette.oxblood : 'rgba(27,28,28,0.2)',
                        backgroundColor: editingProduct.hasWeights ? 'rgba(74,4,4,0.05)' : '#fff',
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: editingProduct.hasWeights ? palette.oxblood : palette.secondary }}>WEIGHT-BASED</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setEditingProduct({ ...editingProduct, hasWeights: false })}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: !editingProduct.hasWeights ? palette.oxblood : 'rgba(27,28,28,0.2)',
                        backgroundColor: !editingProduct.hasWeights ? 'rgba(74,4,4,0.05)' : '#fff',
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: !editingProduct.hasWeights ? palette.oxblood : palette.secondary }}>UNIT-BASED</Text>
                    </Pressable>
                  </View>
                </View>

                {editingProduct.hasWeights ? (
                  <>
                    <View style={{ gap: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR 250G *</Text>
                      <TextInput
                        value={editingProduct.price_250g !== undefined && editingProduct.price_250g !== null ? String(editingProduct.price_250g) : ''}
                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_250g: txt })}
                        keyboardType="numeric"
                        placeholder="e.g. 6.50"
                        placeholderTextColor="#89726F"
                        style={styles.adminLoginInput}
                      />
                    </View>

                    <View style={{ gap: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR 500G *</Text>
                      <TextInput
                        value={editingProduct.price_500g !== undefined && editingProduct.price_500g !== null ? String(editingProduct.price_500g) : ''}
                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_500g: txt })}
                        keyboardType="numeric"
                        placeholder="e.g. 12.00"
                        placeholderTextColor="#89726F"
                        style={styles.adminLoginInput}
                      />
                    </View>

                    <View style={{ gap: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR 1KG *</Text>
                      <TextInput
                        value={editingProduct.price_1kg !== undefined && editingProduct.price_1kg !== null ? String(editingProduct.price_1kg) : ''}
                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_1kg: txt })}
                        keyboardType="numeric"
                        placeholder="e.g. 22.00"
                        placeholderTextColor="#89726F"
                        style={styles.adminLoginInput}
                      />
                    </View>
                  </>
                ) : (
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>UNIT PRICE *</Text>
                    <TextInput
                      value={editingProduct.price !== undefined && editingProduct.price !== null ? String(editingProduct.price) : ''}
                      onChangeText={(txt) => setEditingProduct({ ...editingProduct, price: txt })}
                      keyboardType="numeric"
                      placeholder="e.g. 35.00"
                      placeholderTextColor="#89726F"
                      style={styles.adminLoginInput}
                    />
                  </View>
                )}

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CATEGORY / CHIP *</Text>
                  <TextInput
                    value={editingProduct.categoryLabel}
                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, categoryLabel: txt, tag: txt })}
                    placeholder="e.g. Cow And Beef"
                    placeholderTextColor="#89726F"
                    style={styles.adminLoginInput}
                  />
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>TAG / LABEL</Text>
                  <TextInput
                    value={editingProduct.tag}
                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, tag: txt })}
                    placeholder="e.g. Best Seller"
                    placeholderTextColor="#89726F"
                    style={styles.adminLoginInput}
                  />
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>DESCRIPTION *</Text>
                  <TextInput
                    value={editingProduct.description}
                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, description: txt })}
                    multiline={true}
                    numberOfLines={2}
                    placeholder="Describe product..."
                    placeholderTextColor="#89726F"
                    style={[styles.adminLoginInput, { height: 60, textAlignVertical: 'top' }]}
                  />
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>IMAGE URL</Text>
                  <TextInput
                    value={editingProduct.image}
                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, image: txt })}
                    placeholder="Image URL"
                    placeholderTextColor="#89726F"
                    style={styles.adminLoginInput}
                  />
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CURRENT STOCK ({editingProduct.hasWeights ? 'KG' : 'UNITS'})</Text>
                  <TextInput
                    value={editingProduct.stock_quantity}
                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, stock_quantity: txt })}
                    keyboardType="numeric"
                    placeholder="e.g. 50"
                    placeholderTextColor="#89726F"
                    style={styles.adminLoginInput}
                  />
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 8, flexDirection: 'row', gap: 10 }}>
                  <Pressable 
                    onPress={() => {
                      setEditProductModalVisible(false);
                      setEditingProduct(null);
                    }}
                    style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}
                  >
                    <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>
                  </Pressable>
                  
                  <Pressable 
                    onPress={adminEditProduct}
                    style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>SAVE CHANGES</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* AUTH MODAL */}
      <Modal visible={authModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAuthModalVisible(false)}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: isPhoneScreen ? 'flex-end' : 'center',
          alignItems: isPhoneScreen ? 'stretch' : 'center',
          padding: isPhoneScreen ? 0 : 20
        }}>
          <View style={{
            backgroundColor: '#FAFAFA',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: isPhoneScreen ? 0 : 20,
            borderBottomRightRadius: isPhoneScreen ? 0 : 20,
            width: isPhoneScreen ? '100%' : 480,
            maxHeight: '92%',
            overflow: 'hidden',
            borderWidth: isPhoneScreen ? 0 : 1,
            borderColor: 'rgba(74,4,4,0.15)',
          }}>

            {/* Brand Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, backgroundColor: '#FFF', position: 'relative' }}>
              <Pressable onPress={() => setAuthModalVisible(false)} style={{ position: 'absolute', left: 24, top: 20, zIndex: 10, padding: 4 }}>
                <Text style={{ fontSize: 24, color: palette.charcoal, fontWeight: '300' }}>✕</Text>
              </Pressable>
              <Text style={{ fontFamily: 'Georgia', fontSize: 32, fontWeight: '700', color: palette.oxblood, marginLeft: 36, lineHeight: 34 }}>
                JFAMCO
              </Text>
            </View>

            {/* Header Info */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FAFAFA' }}>
              <Text style={{ fontFamily: 'Georgia', fontSize: 25, fontWeight: '700', color: palette.oxblood, lineHeight: 28 }}>
                {isLoginMode ? 'Welcome Back' : 'Create an Account'}
              </Text>
              <Text style={{ fontSize: 13, color: palette.secondary, marginTop: 6, lineHeight: 18 }}>
                {isLoginMode ? 'Sign in to access your orders and account.' : 'Join JFAMCO for a seamless shopping experience.'}
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

              {/* Full Name — sign up only */}
              {!isLoginMode && (
                <View style={{ marginBottom: 18 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: palette.charcoal, marginBottom: 4 }}>Full Name</Text>
                  <TextInput
                    value={authName}
                    onChangeText={setAuthName}
                    placeholder="Elias Thorne"
                    placeholderTextColor="#D8D8D8"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#E0E0E0',
                      paddingVertical: 6,
                      fontSize: 14,
                      color: palette.charcoal,
                    }}
                  />
                </View>
              )}

              {/* Email */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: palette.charcoal, marginBottom: 4 }}>Email Address</Text>
                <TextInput
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  placeholder="elias@heritage.com"
                  placeholderTextColor="#D8D8D8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#E0E0E0',
                    paddingVertical: 6,
                    fontSize: 14,
                    color: palette.charcoal,
                  }}
                />
              </View>

              {/* Password */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: palette.charcoal, marginBottom: 4 }}>Password</Text>
                <TextInput
                  value={authPassword}
                  onChangeText={setAuthPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#D8D8D8"
                  secureTextEntry={true}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#E0E0E0',
                    paddingVertical: 6,
                    fontSize: 14,
                    color: palette.charcoal,
                  }}
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleAuth}
                disabled={authLoading}
                style={{
                  backgroundColor: authLoading ? '#8B4444' : palette.oxblood,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>
                  {authLoading ? 'PLEASE WAIT...' : (isLoginMode ? 'Sign In' : 'Create Your Account')}
                </Text>
              </Pressable>

              {/* Social Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 1, paddingHorizontal: 12 }}>
                  {isLoginMode ? 'OR SIGN IN WITH' : 'OR REGISTER WITH'}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
              </View>

              {/* Social Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                <Pressable
                  onPress={() => alert('Social Sign In with Apple coming soon')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    paddingVertical: 12,
                    backgroundColor: '#FFF',
                    borderRadius: 6,
                  }}
                >
                  <FontAwesome name="apple" size={16} color="#000" />
                  <Text style={{ fontWeight: '600', fontSize: 13, color: '#000' }}>Apple</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => alert('Social Sign In with Google coming soon')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    paddingVertical: 12,
                    backgroundColor: '#FFF',
                    borderRadius: 6,
                  }}
                >
                  <FontAwesome name="google" size={16} color="#000" />
                  <Text style={{ fontWeight: '600', fontSize: 13, color: '#000' }}>Google</Text>
                </Pressable>
              </View>

              {/* Toggle Link */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ color: palette.secondary, fontSize: 13 }}>
                  {isLoginMode ? "Don't have an account?  " : 'Already have an account?  '}
                </Text>
                <Pressable onPress={() => { setIsLoginMode(!isLoginMode); setAuthInterests([]); }}>
                  <Text style={{ color: palette.oxblood, fontSize: 13, fontWeight: '700' }}>
                    {isLoginMode ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Pressable>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* USER ACCOUNT BOTTOM SHEET */}
      <Modal visible={userAccountSheetVisible} animationType="slide" transparent={true} onRequestClose={() => setUserAccountSheetVisible(false)}>
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setUserAccountSheetVisible(false)}
        >
          <Pressable 
            style={{ 
              backgroundColor: '#FFF', 
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20,
              paddingBottom: 40,
              maxHeight: '80%'
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: palette.oxblood }}>My Account</Text>
                  <Text style={{ fontSize: 14, color: palette.secondary, marginTop: 4 }}>
                    {user?.user_metadata?.full_name || user?.email || 'Guest'}
                  </Text>
                </View>
                <Pressable onPress={() => setUserAccountSheetVisible(false)}>
                  <FontAwesome name="times" size={24} color="#888" />
                </Pressable>
              </View>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: palette.oxblood, marginBottom: 12 }}>
                  Order History
                </Text>
                
                {customerOrdersLoading ? (
                  <Text style={{ color: palette.secondary, textAlign: 'center', paddingVertical: 20 }}>
                    Loading orders...
                  </Text>
                ) : customerOrders.length > 0 ? (
                  customerOrders.map(order => (
                    <View 
                      key={order.id} 
                      style={{ 
                        backgroundColor: palette.background, 
                        padding: 14, 
                        borderRadius: 8,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#E0E0E0'
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: palette.oxblood }}>
                          Order #{order.id.substring(0, 8)}
                        </Text>
                        <Text style={{ fontSize: 12, color: palette.secondary }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: palette.secondary }}>Status: {order.status}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: palette.charcoal }}>
                          {formatMoney(order.total, currency)}
                        </Text>
                      </View>
                      
                      {/* Product Images */}
                      {order.order_items && order.order_items.length > 0 && (
                        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 12 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, marginBottom: 8, letterSpacing: 0.5 }}>
                            ITEMS ({order.order_items.length})
                          </Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                            {order.order_items.map((item, idx) => {
                              // Try to get product from order_items join first, then fallback to productCards
                              const product = productCards.find(p => p.id === item.product_id);
                              const imageUrl = item.product_image || product?.image || 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80';
                              const productName = item.product_name || product?.name || 'Product';
                              
                              return (
                                <View key={idx} style={{ alignItems: 'center', width: 70 }}>
                                  <Image 
                                    source={{ uri: imageUrl }} 
                                    style={{ 
                                      width: 60, 
                                      height: 60, 
                                      borderRadius: 8, 
                                      backgroundColor: '#f5f5f5', 
                                      borderWidth: 1, 
                                      borderColor: 'rgba(0,0,0,0.08)' 
                                    }} 
                                    resizeMode="cover"
                                  />
                                  <Text 
                                    style={{ 
                                      fontSize: 10, 
                                      color: palette.charcoal, 
                                      marginTop: 4, 
                                      fontWeight: '600',
                                      textAlign: 'center'
                                    }}
                                    numberOfLines={2}
                                  >
                                    {productName}
                                  </Text>
                                  <Text style={{ fontSize: 9, color: palette.secondary, marginTop: 2 }}>
                                    Qty: {item.quantity}
                                  </Text>
                                </View>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={{ color: palette.secondary, textAlign: 'center', paddingVertical: 20 }}>
                    No orders yet. Start shopping!
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
              <Pressable
                style={{
                  backgroundColor: palette.oxblood,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
                onPress={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                  setCustomerName('');
                  setCustomerEmail('');
                  setUserAccountSheetVisible(false);
                  setCurrentPage('shop');
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14, letterSpacing: 1 }}>
                  SIGN OUT
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        visible={productDetailVisible}
        onClose={() => {
          setProductDetailVisible(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(product, selectedWeight, itemPrice, quantity) => {
          addToCart(product, selectedWeight, itemPrice, quantity);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 28, 28, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyBtn: {
    borderWidth: 1,
    borderColor: palette.oxblood,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  currencyBtnText: {
    color: palette.oxblood,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerActionBtn: {
    borderWidth: 1,
    borderColor: palette.oxblood,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerActionText: {
    color: palette.oxblood,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerIcon: {
    color: palette.oxblood,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  headerTitle: {
    color: palette.oxblood,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  badgeWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.oxbloodSoft,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    height: 510,
    margin: 16,
    backgroundColor: palette.oxblood,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.72,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 0, 0, 0.35)',
  },
  heroTextWrap: {
    padding: 20,
  },
  kicker: {
    color: palette.oxbloodSoft,
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -1,
  },
  heroBody: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.84)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  heroBtn: {
    marginTop: 24,
    alignSelf: 'flex-start',
    backgroundColor: palette.oxbloodSoft,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  heroActionsRow: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroBtnText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  heroOutlineBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  heroOutlineBtnText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  chipsScrollView: {
    marginTop: 8,
    marginBottom: 4,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipGridItem: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.18)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.2)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
  },
  chipText: {
    color: palette.secondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productCard: {
    backgroundColor: palette.surface,
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
  },
  imageWrap: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'column',
    // Height = width * (5/4) so the card maintains its 4:5 portrait ratio.
    // We drive this from explicit width passed as inline style instead of
    // aspectRatio so flex children never hit sub-pixel rounding gaps.
    aspectRatio: 4 / 5,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  cardSignatureLogo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    // width/height driven by inline style relative to cardWidth
  },
  cardImageContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  cartIconSquare: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cartIconSquareSelected: {
    backgroundColor: '#FFD700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 2,
  },
  productName: {
    flex: 1,
    fontSize: 24,
    lineHeight: 28,
    color: palette.oxblood,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  productPrice: {
    fontSize: 20,
    color: palette.charcoal,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  priceUnit: {
    marginTop: 4,
    marginBottom: 8,
    color: palette.secondary,
    fontSize: 11,
  },
  categoryDescription: {
    color: palette.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  weightWrap: {
    marginTop: 2,
  },
  weightLabel: {
    color: palette.secondary,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
  weightOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  weightOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightOptionActive: {
    backgroundColor: palette.vault,
    borderColor: palette.vault,
  },
  weightOptionText: {
    color: palette.secondary,
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  weightOptionTextActive: {
    color: '#fff',
  },
  addBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: palette.oxblood,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  addBtnText: {
    color: palette.oxblood,
    letterSpacing: 1.8,
    fontWeight: '700',
    fontSize: 12,
  },
  cartPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 164,
    maxHeight: 200,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    padding: 14,
  },
  cartPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartPanelLabel: {
    color: palette.secondary,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  cartPanelTitle: {
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  cartPanelTotal: {
    color: palette.oxblood,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  cartList: {
    maxHeight: 150,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,28,28,0.08)',
  },
  cartRowTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  cartRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartRowImage: {
    width: 72,
    height: 72,
    backgroundColor: '#EEECEC',
  },
  cartRowCopy: {
    flex: 1,
  },
  cartRowName: {
    color: palette.charcoal,
    fontSize: 14,
    fontWeight: '700',
  },
  cartRowMeta: {
    color: palette.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  cartRowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartStepButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartStepButtonText: {
    color: palette.oxblood,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
  },
  cartQuantity: {
    minWidth: 18,
    textAlign: 'center',
    color: palette.charcoal,
    fontWeight: '700',
  },
  cartPageContent: {
    paddingBottom: 120,
    backgroundColor: palette.background,
  },
  adminPageContent: {
    paddingBottom: 130,
    backgroundColor: palette.background,
  },
  adminLoginContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  adminLoginCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.14)',
    padding: 18,
  },
  adminLoginTitle: {
    color: palette.charcoal,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 6,
  },
  adminLoginBody: {
    marginTop: 10,
    color: palette.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  adminLoginField: {
    marginBottom: 14,
  },
  adminLoginLabel: {
    color: palette.secondary,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 8,
  },
  adminLoginInput: {
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.18)',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.charcoal,
    fontSize: 15,
  },
  adminLoginButton: {
    backgroundColor: palette.oxblood,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  adminLoginButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  adminLoginCancelButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  adminLoginCancelText: {
    color: palette.oxblood,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  adminHero: {
    margin: 16,
    padding: 18,
    backgroundColor: palette.oxblood,
  },
  adminTitle: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  adminStatsGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  adminStatsGridCompact: {
    paddingHorizontal: 16,
    flexDirection: 'column',
  },
  adminStatCard: {
    width: '48%',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.14)',
    padding: 14,
  },
  adminStatCardCompact: {
    width: '100%',
  },
  adminStatLabel: {
    color: palette.secondary,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
  },
  adminStatValue: {
    color: palette.oxblood,
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 6,
  },
  adminStatNote: {
    color: palette.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  adminSection: {
    marginTop: 18,
    marginHorizontal: 16,
  },
  productSummaryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.14)',
    padding: 16,
  },
  productSummaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  productSummaryTopRowCompact: {
    flexDirection: 'column',
  },
  productSummaryTitle: {
    color: palette.charcoal,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  productSummaryBody: {
    marginTop: 4,
    color: palette.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  currencyPill: {
    backgroundColor: palette.oxblood,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  currencyPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  productSummaryMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  productSummaryMetricsCompact: {
    flexDirection: 'column',
  },
  productSummaryMetric: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 12,
  },
  productSummaryMetricCompact: {
    width: '100%',
  },
  productSummaryActions: {
    marginTop: 12,
    flexDirection: 'row',
  },
  productSummaryMetricLabel: {
    color: palette.secondary,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
  },
  productSummaryMetricValue: {
    color: palette.oxblood,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 6,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyRowCompact: {
    gap: 8,
  },
  currencyOption: {
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.14)',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  currencyOptionActive: {
    backgroundColor: palette.vault,
    borderColor: palette.vault,
  },
  currencyOptionText: {
    color: palette.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  currencyOptionTextActive: {
    color: '#fff',
  },
  adminSectionLabel: {
    color: palette.secondary,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 10,
  },
  syncNotice: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    backgroundColor: '#fff',
  },
  syncNoticeText: {
    color: palette.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  syncNoticeError: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,4,4,0.18)',
    backgroundColor: 'rgba(210, 106, 95, 0.08)',
  },
  syncNoticeErrorText: {
    color: palette.oxblood,
    fontSize: 12,
    fontWeight: '600',
  },
  adminActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  adminActionRowCompact: {
    flexDirection: 'column',
  },
  adminActionButton: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  adminActionButtonCompact: {
    flexBasis: '100%',
  },
  adminActionText: {
    color: palette.charcoal,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  adminLogoutButton: {
    borderWidth: 1,
    borderColor: palette.oxblood,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  adminLogoutButtonText: {
    color: palette.oxblood,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  adminTable: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.14)',
  },
  adminTableRow: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,28,28,0.08)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  adminTableRowCompact: {
    flexDirection: 'column',
  },
  adminRowCopy: {
    flex: 1,
  },
  adminRowTitle: {
    color: palette.charcoal,
    fontSize: 15,
    fontWeight: '700',
  },
  adminRowMeta: {
    marginTop: 4,
    color: palette.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  adminRowRight: {
    alignItems: 'flex-end',
  },
  adminRowRightCompact: {
    alignItems: 'flex-start',
  },
  adminRowPrice: {
    color: palette.oxblood,
    fontSize: 18,
    fontWeight: '700',
  },
  adminRowStatus: {
    marginTop: 4,
    color: palette.secondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cartPageHero: {
    margin: 16,
    padding: 18,
    backgroundColor: palette.vault,
  },
  cartPageKicker: {
    color: palette.oxbloodSoft,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginBottom: 8,
  },
  cartPageTitle: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  cartPageBody: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  cartPagePanel: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    backgroundColor: '#FFF',
    padding: 14,
  },
  cartSummaryCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 92,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    backgroundColor: palette.vault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cartSummaryLabel: {
    color: '#888989',
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  cartSummaryValue: {
    color: '#fff',
    fontSize: 24,
    marginTop: 2,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.2)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.charcoal,
    fontSize: 15,
  },
  emptyState: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    padding: 16,
    marginBottom: 20,
  },
  emptyTitle: {
    color: palette.oxblood,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyBody: {
    color: palette.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  checkoutBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 82,
    backgroundColor: palette.vault,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminQuickButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.oxblood,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  adminQuickButtonText: {
    color: palette.oxblood,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  checkoutLabel: {
    color: '#888989',
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 2,
    fontWeight: '600',
  },
  checkoutBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  checkoutBtnText: {
    color: palette.oxblood,
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
  },
  cartNavButton: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: palette.oxblood,
  },
  cartNavButtonText: {
    color: '#fff',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,28,28,0.08)',
  },
  navItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
  },
  navActive: {
    backgroundColor: '#FFFFFF',
  },
  navIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  navIconActive: {
    color: '#28A745',
  },
  navLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  navLabelActive: {
    color: '#28A745',
  },

  adminDashboardLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FAF9F9',
  },
  adminSidebar: {
    width: 260,
    backgroundColor: '#F5F4F4',
    borderRightWidth: 1,
    borderRightColor: 'rgba(27,28,28,0.06)',
    paddingVertical: 32,
  },
  adminSidebarBrand: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1C1C',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  adminProfileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
  },
  adminProfileInfo: {
    flex: 1,
  },
  adminProfileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B1C1C',
  },
  adminProfileRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888989',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  adminNavList: {
    gap: 8,
  },
  adminNavItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  adminNavItemActive: {
    backgroundColor: '#270808',
  },
  adminNavText: {
    fontSize: 14,
    color: '#5F5E5F',
  },
  adminNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  adminNavListBottom: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,28,28,0.06)',
    paddingTop: 16,
  },
  adminMainContent: {
    flex: 1,
    backgroundColor: '#FAF9F9',
  },
  adminMainScroll: {
    padding: 40,
    maxWidth: 1000,
  },
  adminTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,28,28,0.08)',
    paddingBottom: 24,
    marginBottom: 32,
  },
  adminMainTitle: {
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '700',
    color: '#1B1C1C',
  },
  adminTopIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  adminSectionSubTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888989',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  adminCurrencySection: {
    marginBottom: 32,
  },
  adminCurrencyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  adminCurrencyToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.1)',
    backgroundColor: '#fff',
  },
  adminCurrencyToggleActive: {
    backgroundColor: '#270808',
    borderColor: '#270808',
  },
  adminCurrencyToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F5E5F',
  },
  adminCurrencyToggleTextActive: {
    color: '#fff',
  },
  adminStatCardsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 48,
    flexWrap: 'wrap',
  },
  adminNewStatCard: {
    flex: 1,
    minWidth: 250,
    backgroundColor: '#fff',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.08)',
  },
  adminNewStatCardDark: {
    backgroundColor: '#2A0303',
    borderColor: '#2A0303',
    overflow: 'hidden',
  },
  adminNewStatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminNewStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5F5E5F',
    letterSpacing: 1,
  },
  adminBadgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminBadgeGreenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  adminBadgeRed: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminBadgeRedText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  adminBadgeGray: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminBadgeGrayText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  adminNewStatValue: {
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '700',
    color: '#1B1C1C',
    marginBottom: 8,
  },
  adminNewStatSub: {
    fontSize: 12,
    color: '#888989',
  },
  adminStatLine: {
    height: 4,
    backgroundColor: '#4A0404',
    width: 60,
    marginTop: 16,
  },
  adminDarkCardIcon: {
    position: 'absolute',
    right: -10,
    bottom: -20,
    fontSize: 120,
    opacity: 0.15,
  },
  adminDashboardSection: {
    marginBottom: 48,
  },
  adminDashboardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  adminMainSubtitle: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1C1C',
    marginBottom: 16,
  },
  adminDarkButton: {
    backgroundColor: '#270808',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  adminDarkButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  adminNewTable: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.08)',
  },
  adminNewTableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,28,28,0.08)',
  },
  adminNewTableCol: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888989',
    letterSpacing: 1,
  },
  adminNewTableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,28,28,0.04)',
    alignItems: 'center',
  },
  adminNewTableImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  adminNewTableTitle: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1C1C',
  },
  adminNewTableText: {
    fontSize: 13,
    color: '#5F5E5F',
  },
  adminStatusBadgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminStatusBadgeGreenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '600',
  },
  adminStatusBadgeRed: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminStatusBadgeRedText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '600',
  },
  adminEditIcon: {
    fontSize: 18,
    color: '#888989',
  },
  adminOrdersList: {
    gap: 16,
    marginBottom: 24,
  },
  adminNewOrderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.08)',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminOrderCardId: {
    fontSize: 13,
    color: '#5F5E5F',
    fontWeight: '500',
  },
  adminOrderCardUser: {
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1C1C',
  },
  adminOrderCardMeta: {
    fontSize: 12,
    color: '#888989',
    marginTop: 4,
  },
  adminOrderCardStatusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderRadius: 4,
  },
  adminOrderCardStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  adminOrderCardTotal: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1C1C',
  },
  adminOutlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.4)',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FAF9F9',
  },
  adminOutlineButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B1C1C',
  },
  footerContainer: {
    backgroundColor: '#1B1C1C',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 140, // Padding to clear bottom navigation tabs
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 48,
  },
  footerDesktopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 24,
  },
  footerCol: {
    flex: 1,
    minWidth: 160,
    marginBottom: 20,
  },
  footerColHeader: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1.2,
  },
  footerAboutText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  footerLink: {
    fontSize: 13,
    color: '#B5B5B5',
    marginBottom: 12,
    lineHeight: 18,
  },
  halalBannerCard: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 4,
    width: 140,
    height: 198,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halalSealImage: {
    width: '100%',
    height: '100%',
  },
  footerContactText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  contactIcon: {
    width: 18,
    textAlign: 'center',
  },
  contactLinkText: {
    fontSize: 13,
    color: '#B5B5B5',
    lineHeight: 18,
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  socialCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerAccordionContainer: {
    flexDirection: 'column',
  },
  accordionSection: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  accordionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  accordionHeaderSign: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  accordionContent: {
    paddingTop: 4,
    paddingBottom: 16,
    paddingLeft: 8,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: '#666',
  },
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27,28,28,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetBackdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetContainer: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.08)',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: palette.oxblood,
    letterSpacing: 0.5,
  },
  bottomSheetCloseBtn: {
    fontSize: 20,
    color: palette.secondary,
    fontWeight: '300',
    padding: 4,
  },
  bottomSheetSummaryCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: 'rgba(74,4,4,0.1)',
    padding: 20,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomSheetSummaryLabel: {
    color: palette.secondary,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  bottomSheetSummaryValue: {
    color: palette.oxblood,
    fontSize: 24,
    marginTop: 2,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
});
