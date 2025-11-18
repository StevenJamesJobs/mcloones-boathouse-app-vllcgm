
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useRewards } from '@/hooks/useRewards';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';

export default function RewardsManagementScreen() {
  const { user } = useAuth();
  const { transactions, topEmployees, loading, awardBucks } = useRewards();
  const { employees } = useEmployees();
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeEmployees = employees.filter(e => e.is_active);
  const filteredEmployees = activeEmployees.filter(e =>
    e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAwardBucks = async () => {
    if (!selectedEmployeeId) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }

    const numAmount = Number(amount);
    if (numAmount === 0) {
      Alert.alert('Error', 'Amount cannot be zero');
      return;
    }

    setSubmitting(true);

    const result = await awardBucks(
      selectedEmployeeId,
      numAmount,
      reason,
      user?.id || '',
      user?.full_name || 'Manager'
    );

    setSubmitting(false);

    if (result.success) {
      Alert.alert('Success', result.message);
      setShowAwardModal(false);
      setSelectedEmployeeId('');
      setAmount('');
      setReason('');
      setSearchQuery('');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const selectedEmployee = activeEmployees.find(e => e.id === selectedEmployeeId);

  return (
    <>
      <Stack.Screen
        options={{
          title: "McLoone's Bucks Management",
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Award Bucks Button */}
          <TouchableOpacity
            style={styles.awardButton}
            onPress={() => setShowAwardModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              color="#FFFFFF"
              size={24}
            />
            <Text style={styles.awardButtonText}>Award/Deduct Bucks</Text>
          </TouchableOpacity>

          {/* Top 5 Employees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 5 Employees</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.managerAccent} />
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

          {/* Recent Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.managerAccent} />
            ) : transactions.length === 0 ? (
              <View style={commonStyles.employeeCard}>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              transactions.slice(0, 20).map(transaction => {
                const employee = activeEmployees.find(
                  e => e.id === transaction.employee_id
                );
                return (
                  <View key={transaction.id} style={commonStyles.employeeCard}>
                    <View style={styles.transactionHeader}>
                      <Text style={styles.transactionEmployee}>
                        {employee?.full_name || 'Unknown Employee'}
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
                      {new Date(transaction.created_at).toLocaleDateString()} •
                      Awarded by {transaction.awarded_by_name}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Award Bucks Modal */}
      <Modal
        visible={showAwardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAwardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Award/Deduct Bucks</Text>
              <TouchableOpacity onPress={() => setShowAwardModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  color={colors.textSecondary}
                  size={28}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Employee Selection */}
              <Text style={styles.label}>Select Employee</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search employees..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <ScrollView style={styles.employeeList} nestedScrollEnabled>
                {filteredEmployees.map(employee => (
                  <TouchableOpacity
                    key={employee.id}
                    style={[
                      styles.employeeItem,
                      selectedEmployeeId === employee.id && styles.employeeItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedEmployeeId(employee.id);
                      setSearchQuery('');
                    }}
                  >
                    <View style={styles.employeeItemInfo}>
                      <Text style={styles.employeeItemName}>{employee.full_name}</Text>
                      <Text style={styles.employeeItemRole}>
                        {employee.job_title} • {employee.mcloones_bucks || 0} Bucks
                      </Text>
                    </View>
                    {selectedEmployeeId === employee.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        color={colors.managerAccent}
                        size={24}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedEmployee && (
                <View style={styles.selectedEmployeeCard}>
                  <Text style={styles.selectedEmployeeLabel}>Selected:</Text>
                  <Text style={styles.selectedEmployeeName}>
                    {selectedEmployee.full_name}
                  </Text>
                  <Text style={styles.selectedEmployeeBucks}>
                    Current Balance: {selectedEmployee.mcloones_bucks || 0} Bucks
                  </Text>
                </View>
              )}

              {/* Amount Input */}
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.helperText}>
                Enter a positive number to award, or negative to deduct
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50 or -25"
                placeholderTextColor={colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              {/* Reason Input */}
              <Text style={styles.label}>Reason</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Great customer review, Perfect attendance"
                placeholderTextColor={colors.textSecondary}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleAwardBucks}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      color="#FFFFFF"
                      size={20}
                    />
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  awardButton: {
    backgroundColor: colors.managerAccent,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  awardButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
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
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.employeeCard,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  employeeList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.employeeCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  employeeItemSelected: {
    backgroundColor: colors.managerPrimary,
    borderWidth: 2,
    borderColor: colors.managerAccent,
  },
  employeeItemInfo: {
    flex: 1,
  },
  employeeItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  employeeItemRole: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  selectedEmployeeCard: {
    backgroundColor: colors.managerPrimary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedEmployeeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  selectedEmployeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedEmployeeBucks: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.employeeCard,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.managerAccent,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
