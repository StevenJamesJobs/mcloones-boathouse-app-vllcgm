
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { useLoyaltyRewards, useLoyaltyTransactions } from '@/hooks/useLoyalty';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function LoyaltyScreen() {
  const { profile, loading: profileLoading } = useCustomerProfile();
  const { rewards, loading: rewardsLoading } = useLoyaltyRewards();
  const { transactions, loading: transactionsLoading } = useLoyaltyTransactions();
  const insets = useSafeAreaInsets();

  const loading = profileLoading || rewardsLoading || transactionsLoading;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Loyalty Rewards',
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
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Points Balance Card */}
            <View style={[commonStyles.card, styles.balanceCard]}>
              <View style={styles.balanceHeader}>
                <MaterialIcons name="stars" size={48} color={colors.warning} />
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceLabel}>Your Points</Text>
                  <Text style={styles.balanceValue}>{profile?.loyalty_points || 0}</Text>
                </View>
              </View>
              <View style={styles.balanceStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile?.total_orders || 0}</Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    ${((profile?.loyalty_points || 0) * 0.01).toFixed(2)}
                  </Text>
                  <Text style={styles.statLabel}>Reward Value</Text>
                </View>
              </View>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <View style={commonStyles.card}>
                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <MaterialIcons name="shopping-cart" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.howItWorksText}>
                    <Text style={styles.howItWorksTitle}>Order & Earn</Text>
                    <Text style={styles.howItWorksDescription}>
                      Earn 1 point for every dollar spent
                    </Text>
                  </View>
                </View>
                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <MaterialIcons name="redeem" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.howItWorksText}>
                    <Text style={styles.howItWorksTitle}>Redeem Rewards</Text>
                    <Text style={styles.howItWorksDescription}>
                      Use points for discounts and free items
                    </Text>
                  </View>
                </View>
                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <MaterialIcons name="celebration" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.howItWorksText}>
                    <Text style={styles.howItWorksTitle}>Exclusive Perks</Text>
                    <Text style={styles.howItWorksDescription}>
                      Get access to special offers and promotions
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Available Rewards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Rewards</Text>
              {rewards.length === 0 ? (
                <View style={commonStyles.card}>
                  <Text style={styles.emptyText}>No rewards available at this time</Text>
                </View>
              ) : (
                rewards.map((reward) => {
                  const canRedeem = (profile?.loyalty_points || 0) >= reward.points_required;
                  return (
                    <View key={reward.id} style={commonStyles.card}>
                      <View style={styles.rewardHeader}>
                        <View style={styles.rewardInfo}>
                          <Text style={styles.rewardTitle}>{reward.title}</Text>
                          <Text style={styles.rewardDescription}>{reward.description}</Text>
                        </View>
                        <View style={[styles.pointsBadge, !canRedeem && styles.pointsBadgeDisabled]}>
                          <MaterialIcons
                            name="stars"
                            size={16}
                            color={canRedeem ? colors.warning : colors.textSecondary}
                          />
                          <Text style={[styles.pointsText, !canRedeem && styles.pointsTextDisabled]}>
                            {reward.points_required}
                          </Text>
                        </View>
                      </View>
                      {canRedeem && (
                        <Pressable style={styles.redeemButton}>
                          <Text style={styles.redeemButtonText}>Redeem</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {transactions.length === 0 ? (
                <View style={commonStyles.card}>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <View key={transaction.id} style={commonStyles.card}>
                    <View style={styles.transactionRow}>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>{transaction.description}</Text>
                        <Text style={styles.transactionDate}>
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionPoints,
                          transaction.points_change > 0 ? styles.pointsPositive : styles.pointsNegative,
                        ]}
                      >
                        {transaction.points_change > 0 ? '+' : ''}
                        {transaction.points_change}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
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
  balanceCard: {
    backgroundColor: colors.accent,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  howItWorksIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  howItWorksText: {
    flex: 1,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  howItWorksDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.warning + '20',
    gap: 4,
  },
  pointsBadgeDisabled: {
    backgroundColor: colors.textSecondary + '20',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
  },
  pointsTextDisabled: {
    color: colors.textSecondary,
  },
  redeemButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionPoints: {
    fontSize: 18,
    fontWeight: '700',
  },
  pointsPositive: {
    color: colors.success,
  },
  pointsNegative: {
    color: colors.error,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
});
