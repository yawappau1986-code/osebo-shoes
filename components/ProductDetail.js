import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Alert,
  ImageBackground,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const palette = {
  background: '#FAF9F9',
  surface: '#FFFFFF',
  charcoal: '#1B1C1C',
  secondary: '#5F5E5F',
  oxblood: '#4A0404',
  oxbloodSoft: '#D26A5F',
  vault: '#202222',
};

export default function ProductDetail({ product, visible, onClose, onAddToCart, onSetCartQuantity, cartItems = [] }) {
  const { width, height } = useWindowDimensions();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('US 9');
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  const scrollViewRef = useRef(null);

  // Reset state when product changes or modal opens/closes
  useEffect(() => {
    if (visible && product) {
      const defaultWeight = 'US 9';
      // Check if this product (with selected weight) is already in cart
      const cartItem = cartItems.find(
        (item) => item.id === product.id && item.selectedWeight === (product.hasWeights ? defaultWeight : 'unit')
      );
      
      if (cartItem) {
        // Product is in cart - show quantity controls with cart quantity
        setShowQuantityControls(true);
        setQuantity(cartItem.quantity);
      } else {
        // Product not in cart - show "Add to Cart" button
        setShowQuantityControls(false);
        setQuantity(1);
      }
      
      // Reset other states
      setSelectedImageIndex(0);
      setSelectedWeight(defaultWeight);
    }
  }, [visible, product?.id, cartItems]); // Also watch cartItems for updates

  // Update quantity when weight/size changes
  useEffect(() => {
    if (visible && product) {
      const cartItem = cartItems.find(
        (item) => item.id === product.id && item.selectedWeight === (product.hasWeights ? selectedWeight : 'unit')
      );
      
      if (cartItem) {
        // This weight is in cart - show controls with cart quantity
        setShowQuantityControls(true);
        setQuantity(cartItem.quantity);
      } else if (showQuantityControls) {
        // This weight is NOT in cart but controls are showing - reset to 1
        setQuantity(1);
      }
    }
  }, [selectedWeight]); // Watch for weight changes

  // Calculate current price based on weight selection - MUST be before early return
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (!product.hasWeights) return product.price || 0;
    if (selectedWeight === 'US 7') return product.price_250g || 0;
    if (selectedWeight === 'US 8') return product.price_500g || 0;
    return product.price_1kg || 0;
  }, [selectedWeight, product]);

  const totalPrice = currentPrice * quantity;

  // Get product images - MUST be after hooks
  const images = useMemo(() => {
    if (!product) return ['https://via.placeholder.com/600x600?text=No+Image'];
    
    console.log('🖼️ Product Images Debug:', {
      productName: product.name,
      hasProductImages: !!product.product_images,
      productImagesLength: product.product_images?.length || 0,
      productImagesArray: product.product_images,
      singleImage: product.image,
      finalImagesCount: product.product_images?.length > 0 
        ? product.product_images.length
        : (product.image ? 1 : 0)
    });
    
    const finalImages = product.product_images?.length > 0 
      ? product.product_images
          .map(img => (img.url || img.image_url)?.trim()) // Use url column (fallback to image_url)
          .filter(url => url && !url.includes('unsplash.com')) // ✅ Remove mock Unsplash images
      : product.image 
      ? [product.image] 
      : ['https://via.placeholder.com/600x600?text=No+Image'];
    
    console.log('🎨 Final images array:', finalImages);
    console.log('📊 Total images to display:', finalImages.length);
    
    return finalImages;
  }, [product]);

  const weightOptions = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];

  // Early return AFTER all hooks
  if (!product) return null;

  const handleImageScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageWidth = width;
    const index = Math.round(scrollPosition / imageWidth);
    setSelectedImageIndex(index);
  };

  const scrollToImage = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setSelectedImageIndex(index);
  };

  const handleShare = async () => {
    try {
      const shareUrl = images[selectedImageIndex] || images[0];
      await Share.share({
        message: `Check out ${product.name}!\n\nPrice: GHC ${currentPrice.toFixed(2)}\n\n${product.description || ''}\n\nImage: ${shareUrl}`,
        title: product.name,
      });
    } catch (error) {
      console.warn('Error sharing product:', error);
    }
  };

  const incrementQuantity = () => {
    if (product.stock_quantity && quantity >= product.stock_quantity) {
      Alert.alert('Stock Limit', `Only ${product.stock_quantity} items available`);
      return;
    }
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCartClick = () => {
    if (product.stock_quantity === 0) {
      Alert.alert('Out of Stock', 'This product is currently unavailable');
      return;
    }
    setShowQuantityControls(true);
    setQuantity(1); // Start with quantity 1
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="arrow-left" size={24} color={palette.charcoal} />
            </Pressable>
            <Text style={styles.headerTitle}>Product Details</Text>
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <FontAwesome name="share-alt" size={20} color={palette.charcoal} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image Gallery with Blurred Background */}
            <View style={styles.imageGalleryContainer}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleImageScroll}
                scrollEventThrottle={16}
                style={styles.imageScrollView}
              >
                {images.map((imageUrl, index) => (
                  <View key={index} style={[styles.imageContainer, { width }]}>
                    {/* Blurred Background Image */}
                    <ImageBackground
                      source={{ uri: imageUrl }}
                      style={styles.blurredBackground}
                      blurRadius={50}
                      resizeMode="cover"
                    >
                      {/* Overlay to darken/lighten the blur */}
                      <View style={styles.blurOverlay} />
                    </ImageBackground>
                    
                    {/* Sharp Product Image on Top */}
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Thumbnail Gallery - Directly under main image */}
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailContainer}
                  contentContainerStyle={styles.thumbnailContent}
                >
                  {images.map((imageUrl, index) => (
                    <Pressable
                      key={index}
                      onPress={() => scrollToImage(index)}
                      style={[
                        styles.thumbnail,
                        selectedImageIndex === index && styles.thumbnailActive,
                      ]}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {/* Image Dots Indicator - At the bottom */}
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  {images.map((_, index) => (
                    <Pressable
                      key={index}
                      onPress={() => scrollToImage(index)}
                      style={[
                        styles.dot,
                        selectedImageIndex === index && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
              {product.tag && (
                <View style={styles.tagContainer}>
                  <Text style={styles.tagText}>{product.tag}</Text>
                </View>
              )}

              <Text style={styles.productName}>{product.name}</Text>

              <Text style={styles.price}>
                GHC {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </Text>

              {product.stock_quantity !== undefined && product.stock_quantity !== null && (
                <Text style={styles.stock}>
                  {product.stock_quantity > 0 
                    ? `${product.stock_quantity} in stock`
                    : 'Out of stock'}
                </Text>
              )}

              {product.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{product.description}</Text>
                </View>
              )}

              {product.categoryLabel && (
                <View style={styles.categoryContainer}>
                  <Text style={styles.sectionTitle}>Category</Text>
                  <Text style={styles.categoryText}>{product.categoryLabel}</Text>
                </View>
              )}

              {/* Weight Selection (if applicable) */}
              {product.hasWeights && (
                <View style={styles.weightSelectionContainer}>
                  <Text style={styles.sectionTitle}>Select Size</Text>
                  <View style={styles.weightOptionsRow}>
                    {weightOptions.map((option) => {
                      const active = option === selectedWeight;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => setSelectedWeight(option)}
                          style={[styles.weightOption, active && styles.weightOptionActive]}
                        >
                          <Text style={[styles.weightOptionText, active && styles.weightOptionTextActive]}>
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={styles.pricePerUnit}>
                    {selectedWeight === 'US 7' && 'Price for 250g'}
                    {selectedWeight === 'US 8' && 'Price for 500g'}
                    {(selectedWeight === 'US 9' || selectedWeight === 'US 10' || selectedWeight === 'US 11') && 'Price for 1kg'}
                  </Text>
                </View>
              )}

              {/* Quantity Selection */}
              <View style={styles.quantityContainer}>
                <Text style={styles.sectionTitle}>Quantity</Text>
                
                {!showQuantityControls ? (
                  /* Add to Cart Button - Shows initially */
                  <Pressable
                    style={[
                      styles.initialAddToCartButton,
                      product.stock_quantity === 0 && styles.initialAddToCartButtonDisabled
                    ]}
                    onPress={handleAddToCartClick}
                    disabled={product.stock_quantity === 0}
                  >
                    <FontAwesome name="shopping-cart" size={18} color="#FFF" />
                    <Text style={styles.initialAddToCartText}>
                      {product.stock_quantity === 0
                        ? 'Out of Stock' 
                        : 'Add to Cart'}
                    </Text>
                  </Pressable>
                ) : (
                  /* Quantity Controls - Shows after clicking Add to Cart */
                  <View style={styles.quantityControls}>
                    <Pressable 
                      onPress={decrementQuantity} 
                      style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                      disabled={quantity <= 1}
                    >
                      <FontAwesome name="minus" size={16} color={quantity <= 1 ? '#CCC' : palette.charcoal} />
                    </Pressable>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <Pressable 
                      onPress={incrementQuantity} 
                      style={styles.quantityButton}
                    >
                      <FontAwesome name="plus" size={16} color={palette.charcoal} />
                    </Pressable>
                  </View>
                )}
                
                {product.stock_quantity !== undefined && product.stock_quantity !== null && (
                  <Text style={styles.stockInfo}>
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} available`
                      : 'Out of stock'}
                  </Text>
                )}
              </View>

              {/* Total Price Display */}
              <View style={styles.totalPriceContainer}>
                <Text style={styles.totalPriceLabel}>Total Price:</Text>
                <Text style={styles.totalPrice}>GHC {totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Add to Cart Button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.addToCartButton,
                (!showQuantityControls || product.stock_quantity === 0) && styles.addToCartButtonDisabled
              ]}
              onPress={() => {
                if (!showQuantityControls) {
                  Alert.alert('Select Quantity', 'Please click "Add to Cart" button first to select quantity');
                  return;
                }
                if (product.stock_quantity === 0) {
                  Alert.alert('Out of Stock', 'This product is currently unavailable');
                  return;
                }
                
                // Check if item is already in cart (for display message only)
                const existingCartItem = cartItems.find(
                  (item) => item.id === product.id && item.selectedWeight === (product.hasWeights ? selectedWeight : 'unit')
                );
                
                // Ensure product has image field (might be in product_images array)
                const productWithImage = {
                  ...product,
                  image: product.image || product.product_images?.[0]?.url || product.product_images?.[0]?.image_url || 'https://via.placeholder.com/600x600?text=No+Image'
                };
                
                // ALWAYS use setCartQuantity - SET the quantity to what's displayed
                // Never add to existing - always replace with the displayed quantity
                onSetCartQuantity?.(productWithImage, product.hasWeights ? selectedWeight : 'unit', currentPrice, quantity);
                
                // Show success feedback
                Alert.alert(
                  existingCartItem ? 'Cart Updated' : 'Added to Cart', 
                  existingCartItem 
                    ? `${product.name} quantity updated to ${quantity}`
                    : `${quantity} × ${product.name} added to your cart`,
                  [{ text: 'OK' }]
                );
                
                onClose(); // useEffect will reset state when modal closes
              }}
              disabled={!showQuantityControls || product.stock_quantity === 0}
            >
              <FontAwesome name="shopping-cart" size={20} color="#FFF" />
              <Text style={styles.addToCartText}>
                {product.stock_quantity === 0
                  ? 'Out of Stock' 
                  : !showQuantityControls
                    ? 'Select Quantity First'
                    : (() => {
                        const existingCartItem = cartItems.find(
                          (item) => item.id === product.id && item.selectedWeight === (product.hasWeights ? selectedWeight : 'unit')
                        );
                        return existingCartItem 
                          ? `Update Cart (${quantity}) • GHC ${totalPrice.toFixed(2)}`
                          : `Add ${quantity} to Cart • GHC ${totalPrice.toFixed(2)}`;
                      })()}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.charcoal,
  },
  content: {
    flex: 1,
  },
  imageGalleryContainer: {
    backgroundColor: '#000',
  },
  imageScrollView: {
    height: 400,
  },
  imageContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  blurredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light overlay to brighten the blur
  },
  productImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: palette.oxblood,
    width: 24,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  thumbnailContent: {
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: palette.oxblood,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: palette.oxblood,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 12,
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.charcoal,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.oxblood,
    marginBottom: 8,
  },
  stock: {
    fontSize: 14,
    color: palette.secondary,
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.charcoal,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.secondary,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 15,
    color: palette.charcoal,
  },
  weightSelectionContainer: {
    marginBottom: 20,
  },
  weightOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  weightOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  weightOptionActive: {
    borderColor: palette.oxblood,
    backgroundColor: palette.oxblood,
  },
  weightOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.charcoal,
  },
  weightOptionTextActive: {
    color: '#FFF',
  },
  pricePerUnit: {
    fontSize: 12,
    color: palette.secondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  initialAddToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.oxblood,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  initialAddToCartButtonDisabled: {
    backgroundColor: '#CCC',
  },
  initialAddToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.charcoal,
    minWidth: 40,
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: 12,
    color: palette.secondary,
    marginTop: 8,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.charcoal,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.oxblood,
  },
  footer: {
    padding: 16,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.oxblood,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
