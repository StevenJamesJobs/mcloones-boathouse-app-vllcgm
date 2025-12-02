
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import { useReviews } from '@/hooks/useReviews';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabType = 'rewards' | 'reviews';

export default function RewardsAndReviewsScreen() {
  const { user } = useAuth();
  const { transactions, topEmployees, loading: rewardsLoading } = useRewards();
  const { reviews, loading: reviewsLoading } = useReviews();
  const [activeTab, setActiveTab] = useState<TabType>('rewards');
  const insets = useSafeAreaInsets();
  const bannerHeight = insets.top + 60;

  // Filter out hidden transactions for employees
  const visibleTransactions = transactions.filter(t => !t.hidden_from_employees);

  // Get user's recent transactions (excluding hidden ones)
  const userRecentTransactions = visibleTransactions
    .filter(t => t.employee_id === user?.id)
    .slice(0, 10);

  // Get latest transactions across all employees (excluding hidden ones)
  const latestTransactions = visibleTransactions.slice(0, 10);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name="star"
            size={18}
            color={star <= rating ? '#FFD700' : '#D3D3D3'}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reviews',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Floating Header Banner */}
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <Image 
            source={require('@/assets/images/08405405-7ef4-4671-9758-a7220430497a.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.bannerTitle}>Reviews</Text>
        </View>

        {/* Content with top padding */}
        <View style={[styles.content, { paddingTop: bannerHeight + 8 }]}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
              onPress={() => setActiveTab('rewards')}
            >
              <MaterialIcons 
                name="stars" 
                size={20} 
                color={activeTab === 'rewards' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}>
                Rewards
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
              onPress={() => setActiveTab('reviews')}
            >
              <MaterialIcons 
                name="rate-review" 
                size={20} 
                color={activeTab === 'reviews' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                Latest Reviews
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          {activeTab === 'rewards' ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* User's Total */}
              <View style={styles.totalCard}>
                <IconSymbol
                  ios_icon_name="dollarsign.circle.fill"
                  android_material_icon_name="monetization_on"
                  color={colors.employeeAccent}
                  size={48}
                />
                <Text style={styles.totalAmount}>${user?.mcloones_bucks || 0}</Text>
                <Text style={styles.totalLabel}>Your McLoone&apos;s Bucks</Text>
              </View>

              {/* Top 5 Employees */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Employees</Text>
                {rewardsLoading ? (
                  <View style={commonStyles.employeeCard}>
                    <Text style={styles.emptyText}>Loading...</Text>
                  </View>
                ) : topEmployees.length === 0 ? (
                  <View style={commonStyles.employeeCard}>
                    <Text style={styles.emptyText}>No employees with bucks yet</Text>
                  </View>
                ) : (
                  topEmployees.map((employee, index) => (
                    <View key={employee.id} style={styles.leaderboardItem}>
                      <View
                        style={[
                          styles.rankBadge,
                          index === 0 && styles.rankBadgeGold,
                          index === 1 && styles.rankBadgeSilver,
                          index === 2 && styles.rankBadgeBronze,
                        ]}
                      >
                        <Text style={styles.rankText}>{index + 1}</Text>
                      </View>
                      <View style={styles.employeeInfo}>
                        <Text style={styles.employeeName}>{employee.full_name}</Text>
                        <Text style={styles.employeeBucks}>
                          ${employee.mcloones_bucks || 0} Bucks
                        </Text>
                      </View>
                      {index < 3 && (
                        <IconSymbol
                          ios_icon_name="trophy.fill"
                          android_material_icon_name="emoji_events"
                          color={
                            index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                          }
                          size={24}
                        />
                      )}
                    </View>
                  ))
                )}
              </View>

              {/* My Recent Awards */}
              {userRecentTransactions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>My Recent Awards</Text>
                  {userRecentTransactions.map(transaction => (
                    <View key={transaction.id} style={commonStyles.employeeCard}>
                      <View style={styles.transactionHeader}>
                        <Text style={styles.transactionReason}>{transaction.reason}</Text>
                        <Text
                          style={[
                            styles.transactionAmount,
                            transaction.amount > 0
                              ? styles.positiveAmount
                              : styles.negativeAmount,
                          ]}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </Text>
                      </View>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.created_at).toLocaleDateString()} • Awarded
                        by {transaction.awarded_by_name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Latest Awards (All Employees) */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest Awards</Text>
                {rewardsLoading ? (
                  <View style={commonStyles.employeeCard}>
                    <Text style={styles.emptyText}>Loading...</Text>
                  </View>
                ) : latestTransactions.length === 0 ? (
                  <View style={commonStyles.employeeCard}>
                    <Text style={styles.emptyText}>No awards yet</Text>
                  </View>
                ) : (
                  latestTransactions.map(transaction => {
                    const employee = topEmployees.find(e => e.id === transaction.employee_id);
                    return (
                      <View key={transaction.id} style={commonStyles.employeeCard}>
                        <View style={styles.transactionHeader}>
                          <Text style={styles.transactionEmployee}>
                            {employee?.full_name || 'Employee'}
                          </Text>
                          <Text
                            style={[
                              styles.transactionAmount,
                              transaction.amount > 0
                                ? styles.positiveAmount
                                : styles.negativeAmount,
                            ]}
                          >
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount}
                          </Text>
                        </View>
                        <Text style={styles.transactionReason}>{transaction.reason}</Text>
                        <Text style={styles.transactionDate}>
                          {new Date(transaction.created_at).toLocaleDateString()} • Awarded
                          by {transaction.awarded_by_name}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>

              {/* How to Earn */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Earn More</Text>
                <View style={commonStyles.employeeCard}>
                  <View style={styles.earnItem}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      color={colors.employeeAccent}
                      size={20}
                    />
                    <Text style={styles.earnText}>Receive positive customer reviews</Text>
                  </View>
                  <View style={styles.earnItem}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      color={colors.employeeAccent}
                      size={20}
                    />
                    <Text style={styles.earnText}>Great attendance</Text>
                  </View>
                  <View style={styles.earnItem}>
                    <IconSymbol
                      ios_icon_name="person.2.fill"
                      android_material_icon_name="groups"
                      color={colors.employeeAccent}
                      size={20}
                    />
                    <Text style={styles.earnText}>Demonstrating great teamwork</Text>
                  </View>
                  <View style={styles.earnItem}>
                    <IconSymbol
                      ios_icon_name="lightbulb.fill"
                      android_material_icon_name="lightbulb"
                      color={colors.employeeAccent}
                      size={20}
                    />
                    <Text style={styles.earnText}>Overall Skill Improvements</Text>
                  </View>
                  <View style={styles.earnItem}>
                    <IconSymbol
                      ios_icon_name="trophy.fill"
                      android_material_icon_name="emoji_events"
                      color={colors.employeeAccent}
                      size={20}
                    />
                    <Text style={styles.earnText}>Going above and beyond</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.reviewsIntro}>
                Check out our latest customer reviews!
              </Text>

              {reviewsLoading ? (
                <View style={commonStyles.employeeCard}>
                  <Text style={styles.emptyText}>Loading reviews...</Text>
                </View>
              ) : reviews.length === 0 ? (
                <View style={commonStyles.employeeCard}>
                  <Text style={styles.emptyText}>No reviews yet</Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                      {renderStars(review.rating)}
                    </View>
                    <Text style={styles.reviewText}>{review.review_text}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.review_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.employeeBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  logo: {
    height: 40,
    width: 200,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.employeeCard,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.employeeAccent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  totalCard: {
    backgroundColor: colors.employeePrimary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  totalAmount: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
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
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
  },
  rankBadgeSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBadgeBronze: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  employeeBucks: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionEmployee: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.error,
  },
  transactionReason: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  earnText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  reviewsIntro: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  reviewCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAuthor: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
