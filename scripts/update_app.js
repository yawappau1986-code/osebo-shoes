const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');

// 1. Replace the render block
const startMarker = `) : isAdminPage ? (`;
const endMarker = `      ) : (\n        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found!");
  process.exit(1);
}

const newAdminView = `) : isAdminPage ? (
        <View style={styles.adminDashboardLayout}>
          {/* SIDEBAR */}
          <View style={[styles.adminSidebar, isCompactAdmin && { display: 'none' }]}>
            <Text style={styles.adminSidebarBrand}>The Master's Cut</Text>
            
            <View style={styles.adminProfileBlock}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80' }} style={styles.adminAvatar} />
              <View style={styles.adminProfileInfo}>
                <Text style={styles.adminProfileName}>Head Butcher</Text>
                <Text style={styles.adminProfileRole}>ADMIN ACCESS</Text>
              </View>
            </View>

            <View style={styles.adminNavList}>
              {['Dashboard', 'Inventory', 'Orders', 'Analytics'].map((item, idx) => (
                <Pressable key={item} style={[styles.adminNavItem, idx === 0 && styles.adminNavItemActive]}>
                  <Text style={[styles.adminNavText, idx === 0 && styles.adminNavTextActive]}>{item}</Text>
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
              <Text style={styles.adminMainTitle}>Dashboard</Text>
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

            {/* STATS */}
            <View style={styles.adminStatCardsRow}>
              <View style={styles.adminNewStatCard}>
                <View style={styles.adminNewStatCardHeader}>
                  <Text style={styles.adminNewStatLabel}>REVENUE</Text>
                  <View style={styles.adminBadgeGreen}><Text style={styles.adminBadgeGreenText}>+12%</Text></View>
                </View>
                <Text style={styles.adminNewStatValue}>{formatCurrency(productCards.reduce((acc, p) => acc + p.price, 0) * 10)}</Text>
                <View style={styles.adminStatLine} />
              </View>
              
              <View style={styles.adminNewStatCard}>
                <View style={styles.adminNewStatCardHeader}>
                  <Text style={styles.adminNewStatLabel}>TOTAL ORDERS</Text>
                  <View style={styles.adminBadgeGreen}><Text style={styles.adminBadgeGreenText}>+5%</Text></View>
                </View>
                <Text style={styles.adminNewStatValue}>{adminOrders.length > 0 ? adminOrders.length : 84}</Text>
                <Text style={styles.adminNewStatSub}>Projected 92 by end of week</Text>
              </View>
              
              <View style={[styles.adminNewStatCard, styles.adminNewStatCardDark]}>
                <View style={styles.adminNewStatCardHeader}>
                  <Text style={[styles.adminNewStatLabel, {color: '#fff'}]}>ACTIVE SHIPMENTS</Text>
                </View>
                <Text style={[styles.adminNewStatValue, {color: '#fff'}]}>12</Text>
                <Text style={[styles.adminNewStatSub, {color: '#D26A5F'}]}>8 delivering today</Text>
                <Text style={styles.adminDarkCardIcon}>🚚</Text>
              </View>
            </View>

            {/* INVENTORY TABLE */}
            <View style={styles.adminDashboardSection}>
              <View style={styles.adminDashboardSectionHeader}>
                <Text style={styles.adminMainSubtitle}>Inventory Management</Text>
                <Pressable style={styles.adminDarkButton} onPress={() => setAddProductModalVisible(true)}>
                  <Text style={styles.adminDarkButtonText}>Add New Product</Text>
                </Pressable>
              </View>

              <View style={styles.adminNewTable}>
                <View style={[styles.adminNewTableHeader, isCompactAdmin && { display: 'none' }]}>
                  <Text style={[styles.adminNewTableCol, {flex: 3}]}>PREMIUM CUT</Text>
                  <Text style={[styles.adminNewTableCol, {flex: 1}]}>CURRENT STOCK</Text>
                  <Text style={[styles.adminNewTableCol, {flex: 1}]}>STATUS</Text>
                  <Text style={[styles.adminNewTableCol, {flex: 0.5, textAlign: 'right'}]}>ACTION</Text>
                </View>
                
                {productCards.slice(0, 5).map((product, idx) => {
                  const isLow = idx === 1 || product.price < 15; // Fake low stock logic for visual
                  return (
                    <View key={product.id} style={[styles.adminNewTableRow, isCompactAdmin && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
                      <View style={[{flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12}, isCompactAdmin && { width: '100%' }]}>
                        <Image source={{uri: product.image}} style={styles.adminNewTableImage} />
                        <Text style={styles.adminNewTableTitle}>{product.name}</Text>
                      </View>
                      
                      {!isCompactAdmin && (
                        <>
                          <View style={{flex: 1, justifyContent: 'center'}}>
                            <Text style={styles.adminNewTableText}>{isLow ? '12kg' : '45kg'}</Text>
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
                            price: String(product.price),
                            tag: product.tag || '',
                            categoryLabel: product.categoryLabel || '',
                            description: product.description || '',
                            image: product.image || '',
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

            {/* RECENT ORDERS */}
            <View style={styles.adminDashboardSection}>
              <Text style={styles.adminMainSubtitle}>Recent Orders</Text>
              <View style={styles.adminOrdersList}>
                {(adminOrders.length > 0 ? adminOrders.slice(0, 3) : [
                  {id: '#MC-84920', status: 'PROCESSING', customer_name: 'A. Thompson', order_items: [1,2], total_amount: 84.50},
                  {id: '#MC-84919', status: 'DELIVERY', customer_name: 'J. Richards', order_items: [1,2,3,4,5], total_amount: 212.00},
                  {id: '#MC-84918', status: 'PROCESSING', customer_name: 'L. Sterling', order_items: [1], total_amount: 45.99},
                ]).map(order => (
                  <View key={order.id} style={styles.adminNewOrderCard}>
                    <View>
                      <Text style={styles.adminOrderCardId}>{order.id}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                        <Text style={styles.adminOrderCardUser}>{order.customer_name}</Text>
                        <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: order.status === 'DELIVERY' || order.status === 'Delivered' ? '#4A0404' : '#10B981'}} />
                      </View>
                      <Text style={styles.adminOrderCardMeta}>
                        {(order.order_items?.length || 1)} Item{(order.order_items?.length !== 1) ? 's' : ''} • Pickup
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <View style={styles.adminOrderCardStatusBadge}>
                        <Text style={styles.adminOrderCardStatusText}>{String(order.status).toUpperCase()}</Text>
                      </View>
                      <Text style={styles.adminOrderCardTotal}>{formatCurrency(order.total_amount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Pressable style={styles.adminOutlineButton} onPress={fetchAdminOrders}>
                <Text style={styles.adminOutlineButtonText}>View All Orders</Text>
              </Pressable>
            </View>
            <View style={{height: 80}} />
          </ScrollView>
        </View>
`;

code = code.substring(0, startIndex) + newAdminView + code.substring(endIndex);

// 2. Append styles
const newStyles = `
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
    backgroundColor: '#4A0404',
    borderColor: '#4A0404',
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
    opacity: 0.1,
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
});
`;

code = code.replace(/}\);\s*$/, newStyles);

fs.writeFileSync(appPath, code);
console.log("App.js updated successfully.");
