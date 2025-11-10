
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { mcLoonesBucks, topEmployees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export default function RewardsScreen() {
  const { user } = useAuth();

  // Calculate user's total bucks
  const userBucks = mcLoonesBucks
    .filter(buck => buck.employeeId === user?.id)
    .reduce((sum, buck) => sum + buck.amount, 0);

  // Get user's recent bucks
  const userRecentBucks = mcLoonesBucks
    .filter(buck => buck.employeeId === user?.id)
    .slice(0, 5);

  // Get latest bucks across all employees
  const latestBucks = mcLoonesBucks.slice(0, 5);

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
            <IconSymbol name="dollarsign.circle.fill" color={colors.employeeAccent} size={48} />
            <Text style={styles.totalAmount}>{userBucks}</Text>
            <Text style={styles.totalLabel}>Your McLoone&apos;s Bucks</Text>
          </View>

          {/* Top 5 Employees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Employees</Text>
            {topEmployees.map((employee, index) => (
              <View key={employee.employeeId} style={styles.leaderboardItem}>
                <View style={[
                  styles.rankBadge,
                  index === 0 && styles.rankBadgeGold,
                  index === 1 && styles.rankBadgeSilver,
                  index === 2 && styles.rankBadgeBronze,
                ]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.employeeName}</Text>
                  <Text style={styles.employeeBucks}>{employee.totalBucks} Bucks</Text>
                </View>
                {index < 3 && (
                  <IconSymbol 
                    name="trophy.fill" 
                    color={
                      index === 0 ? '#FFD700' : 
                      index === 1 ? '#C0C0C0' : 
                      '#CD7F32'
                    } 
                    size={24} 
                  />
                )}
              </View>
            ))}
          </View>

          {/* Latest Awards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Awards</Text>
            {latestBucks.map((buck) => (
              <View key={buck.id} style={commonStyles.employeeCard}>
                <View style={styles.buckHeader}>
                  <Text style={styles.buckEmployee}>{buck.employeeName}</Text>
                  <Text style={styles.buckAmount}>+{buck.amount}</Text>
                </View>
                <Text style={styles.buckReason}>{buck.reason}</Text>
                <Text style={styles.buckDate}>
                  {new Date(buck.date).toLocaleDateString()} • Awarded by {buck.awardedBy}
                </Text>
              </View>
            ))}
          </View>

          {/* How to Earn */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Earn More</Text>
            <View style={commonStyles.employeeCard}>
              <View style={styles.earnItem}>
                <IconSymbol name="star.fill" color={colors.employeeAccent} size={20} />
                <Text style={styles.earnText}>Receive positive customer reviews</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol name="checkmark.circle.fill" color={colors.employeeAccent} size={20} />
                <Text style={styles.earnText}>Perfect weekly attendance</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol name="person.2.fill" color={colors.employeeAccent} size={20} />
                <Text style={styles.earnText}>Demonstrate great teamwork</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol name="lightbulb.fill" color={colors.employeeAccent} size={20} />
                <Text style={styles.earnText}>Suggest improvements</Text>
              </View>
              <View style={styles.earnItem}>
                <IconSymbol name="trophy.fill" color={colors.employeeAccent} size={20} />
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
  buckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buckEmployee: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buckAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  buckReason: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  buckDate: {
    fontSize: 12,
    color: colors.textSecondary,
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
