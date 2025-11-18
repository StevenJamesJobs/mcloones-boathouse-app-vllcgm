
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';

export default function RewardsScreen() {
  const { user } = useAuth();
  const { transactions, topEmployees, loading, getEmployeeTotalBucks } = useRewards();
  const [userBucks, setUserBucks] = useState(0);

  useEffect(() => {
    if (user?.id) {
      getEmployeeTotalBucks(user.id).then(setUserBucks);
    }
  }, [user?.id, transactions]);

  // Get user's recent transactions
  const userRecentTransactions = transactions
    .filter(t => t.employee_id === user?.id)
    .slice(0, 10);

  // Get latest transactions across all employees
  const latestTransactions = transactions.slice(0, 10);

  return (
    <>
      <Stack.Screen
        options={{
          title: "McLoone's Bucks",
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={[commonStyles.employeeContainer, styles.container]}>
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
            <Text style={styles.totalAmount}>{user?.mcloones_bucks || 0}</Text>
            <Text style={styles.totalLabel}>Your McLoone&apos;s Bucks</Text>
          </View>

          {/* Top 5 Employees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Employees</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.employeeAccent} />
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
                      {employee.mcloones_bucks || 0} Bucks
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
            {loading ? (
              <ActivityIndicator size="large" color={colors.employeeAccent} />
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
                <Text style={styles.earnText}>Perfect weekly attendance</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="groups"
                  color={colors.employeeAccent}
                  size={20}
                />
                <Text style={styles.earnText}>Demonstrate great teamwork</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol
                  ios_icon_name="lightbulb.fill"
                  android_material_icon_name="lightbulb"
                  color={colors.employeeAccent}
                  size={20}
                />
                <Text style={styles.earnText}>Suggest improvements</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol
                  ios_icon_name="trophy.fill"
                  android_material_icon_name="emoji_events"
                  color={colors.employeeAccent}
                  size={20}
                />
                <Text style={styles.earnText}>Go above and beyond</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
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
});
