
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Image, Alert, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { usePromotions } from '@/hooks/usePromotions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';

export default function PromotionsScreen() {
  const { promotions, loading, error } = usePromotions();
  const insets = useSafeAreaInsets();
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const copyPromoCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Promo code "${code}" copied to clipboard`);
  };

  const getDiscountText = (promo: any) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% OFF`;
    } else if (promo.discount_type === 'fixed-amount') {
      return `$${promo.discount_value} OFF`;
    } else {
      return 'FREE ITEM';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Exclusive Promotions',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.container, styles.container, { paddingTop: insets.top }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading promotions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading promotions: {error}</Text>
          </View>
        ) : promotions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="local-offer" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No active promotions</Text>
            <Text style={styles.emptySubtext}>Check back soon for exclusive app-only deals!</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {promotions.map((promo) => (
              <View key={promo.id} style={[commonStyles.card, styles.promoCard]}>
                {promo.image_url && (
                  <Pressable onPress={() => setExpandedImage(promo.image_url)}>
                    <Image
                      source={{ uri: promo.image_url }}
                      style={styles.promoImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}
                
                <View style={styles.promoHeader}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{getDiscountText(promo)}</Text>
                  </View>
                  {promo.max_uses && (
                    <Text style={styles.usesText}>
                      {promo.max_uses - promo.current_uses} left
                    </Text>
                  )}
                </View>

                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoDescription}>{promo.description}</Text>

                {promo.min_order_amount && (
                  <View style={styles.minOrderRow}>
                    <MaterialIcons name="info-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.minOrderText}>
                      Minimum order: ${promo.min_order_amount.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={styles.validityRow}>
                  <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
                  <Text style={styles.validityText}>
                    Valid until {new Date(promo.valid_until).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                {promo.promo_code && (
                  <View style={styles.promoCodeContainer}>
                    <View style={styles.promoCodeBox}>
                      <Text style={styles.promoCodeLabel}>Promo Code:</Text>
                      <Text style={styles.promoCode}>{promo.promo_code}</Text>
                    </View>
                    <Pressable
                      style={styles.copyButton}
                      onPress={() => copyPromoCode(promo.promo_code!)}
                    >
                      <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}

        {/* Image Modal */}
        <Modal
          visible={expandedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setExpandedImage(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setExpandedImage(null)}>
            <Image
              source={{ uri: expandedImage || '' }}
              style={styles.expandedImage}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  scrollContentWithTabBar: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  promoCard: {
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.border,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: colors.error,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  usesText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  minOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  minOrderText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  validityText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  promoCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  promoCodeBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  promoCodeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  promoCode: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: '90%',
    height: '80%',
  },
});
