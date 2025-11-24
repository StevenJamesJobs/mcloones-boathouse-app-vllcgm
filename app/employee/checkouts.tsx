
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type PercentageOption = '0.01' | '0.02' | '0.03' | '0.035' | '0.04';

export default function CheckOutsScreen() {
  const [totalShiftSales, setTotalShiftSales] = useState('');
  const [cashedOutInTotal, setCashedOutInTotal] = useState('');
  const [isNegative, setIsNegative] = useState(false);
  const [busserRunnerPercent, setBusserRunnerPercent] = useState<PercentageOption>('0.01');
  const [bartenderPercent, setBartenderPercent] = useState<PercentageOption>('0.02');
  const [showResults, setShowResults] = useState(false);

  const busserRunnerOptions: PercentageOption[] = ['0.01', '0.02', '0.035'];
  const bartenderOptions: PercentageOption[] = ['0.02', '0.03', '0.04'];

  const formatPercentageDisplay = (value: string) => {
    const num = parseFloat(value);
    return `${(num * 100).toFixed(num === 0.035 ? 2 : 1)}%`;
  };

  const handleCashedOutInChange = (text: string) => {
    // Remove any non-numeric characters except decimal point and minus sign
    const cleaned = text.replace(/[^0-9.]/g, '');
    setCashedOutInTotal(cleaned);
  };

  const toggleSign = () => {
    setIsNegative(!isNegative);
  };

  const getActualCashTotal = () => {
    const value = parseFloat(cashedOutInTotal) || 0;
    return isNegative ? -Math.abs(value) : Math.abs(value);
  };

  const handleCalculate = () => {
    if (!totalShiftSales || !cashedOutInTotal) {
      Alert.alert('Missing Information', 'Please enter all required fields');
      return;
    }

    const sales = parseFloat(totalShiftSales);
    const cashTotal = getActualCashTotal();

    if (isNaN(sales) || isNaN(cashTotal)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers');
      return;
    }

    if (sales < 0) {
      Alert.alert('Invalid Input', 'Total Shift Sales cannot be negative');
      return;
    }

    setShowResults(true);
  };

  const handleReset = () => {
    setTotalShiftSales('');
    setCashedOutInTotal('');
    setIsNegative(false);
    setBusserRunnerPercent('0.01');
    setBartenderPercent('0.02');
    setShowResults(false);
  };

  // Calculations
  const sales = parseFloat(totalShiftSales) || 0;
  const cashTotal = getActualCashTotal();
  const busserAmount = sales * parseFloat(busserRunnerPercent);
  const bartenderAmount = sales * parseFloat(bartenderPercent);
  
  // Calculate final tally - ALWAYS ADD tip outs to cash total
  // Whether cash total is positive or negative, we add the tip out amounts
  const finalTally = cashTotal + busserAmount + bartenderAmount;

  // Determine if they owe or are owed based on final tally
  const isOwed = finalTally < 0;
  const displayAmount = Math.abs(finalTally);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Check Outs',
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
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="calculate" size={40} color={colors.employeeAccent} />
            <Text style={styles.headerTitle}>Check Out Calculator</Text>
            <Text style={styles.headerSubtitle}>
              Please enter required information for check out calculations.
            </Text>
          </View>

          {/* Input Card */}
          <View style={styles.calculatorCard}>
            {/* Total Shift Sales */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Shift Sales *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={totalShiftSales}
                  onChangeText={setTotalShiftSales}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Cashed Out/In Total */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cashed Out/In Total *</Text>
              <Text style={styles.inputHint}>
                (Enter amount and select positive or negative)
              </Text>
              <View style={styles.cashInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={cashedOutInTotal}
                    onChangeText={handleCashedOutInChange}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <Pressable
                  style={[
                    styles.signToggleButton,
                    isNegative && styles.signToggleButtonNegative,
                  ]}
                  onPress={toggleSign}
                >
                  <MaterialIcons 
                    name={isNegative ? "remove" : "add"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.signToggleText}>
                    {isNegative ? 'Negative' : 'Positive'}
                  </Text>
                </Pressable>
              </View>
              {cashedOutInTotal && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <Text style={[
                    styles.previewValue,
                    isNegative ? styles.negativeValue : styles.positiveValue,
                  ]}>
                    ${isNegative ? '-' : ''}{cashedOutInTotal || '0.00'}
                  </Text>
                </View>
              )}
            </View>

            {/* Busser/Runner Percentage */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Busser/Runner Tip Out *</Text>
              <View style={styles.percentageOptions}>
                {busserRunnerOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.percentageButton,
                      busserRunnerPercent === option && styles.percentageButtonSelected,
                    ]}
                    onPress={() => setBusserRunnerPercent(option)}
                  >
                    <Text
                      style={[
                        styles.percentageButtonText,
                        busserRunnerPercent === option && styles.percentageButtonTextSelected,
                      ]}
                    >
                      {formatPercentageDisplay(option)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {totalShiftSales && (
                <Text style={styles.calculatedAmount}>
                  Amount: ${busserAmount.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Bartenders Percentage */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bartenders Tip Out *</Text>
              <View style={styles.percentageOptions}>
                {bartenderOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.percentageButton,
                      bartenderPercent === option && styles.percentageButtonSelected,
                    ]}
                    onPress={() => setBartenderPercent(option)}
                  >
                    <Text
                      style={[
                        styles.percentageButtonText,
                        bartenderPercent === option && styles.percentageButtonTextSelected,
                      ]}
                    >
                      {formatPercentageDisplay(option)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {totalShiftSales && (
                <Text style={styles.calculatedAmount}>
                  Amount: ${bartenderAmount.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Calculate Button */}
            <Pressable
              style={styles.calculateButton}
              onPress={handleCalculate}
            >
              <MaterialIcons name="calculate" size={24} color="#FFFFFF" />
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </Pressable>
          </View>

          {/* Results Card */}
          {showResults && (
            <View style={styles.resultsCard}>
              <View style={styles.resultsHeader}>
                <MaterialIcons name="receipt" size={28} color={colors.employeeAccent} />
                <Text style={styles.resultsTitle}>Check Out Summary</Text>
              </View>

              {/* Busser/Runner Amount */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Busser/Runner Tip Out:</Text>
                <Text style={styles.resultValue}>
                  ${busserAmount.toFixed(2)}
                </Text>
              </View>

              {/* Bartender Amount */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Bartender Tip Out:</Text>
                <Text style={styles.resultValue}>
                  ${bartenderAmount.toFixed(2)}
                </Text>
              </View>

              {/* Cash In/Out Total */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Cash In/Out Total:</Text>
                <Text style={[
                  styles.resultValue,
                  cashTotal < 0 ? styles.negativeValue : styles.positiveValue,
                ]}>
                  ${cashTotal.toFixed(2)}
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Final Tally */}
              <View style={styles.finalTallyContainer}>
                <Text style={styles.finalTallyLabel}>Final Tally</Text>
                <View style={styles.finalTallyRow}>
                  <Text style={[
                    styles.finalTallyStatus,
                    isOwed ? styles.owedStatus : styles.oweStatus,
                  ]}>
                    {isOwed ? 'You are owed' : 'You owe'}
                  </Text>
                  <Text style={[
                    styles.finalTallyAmount,
                    isOwed ? styles.owedAmount : styles.oweAmount,
                  ]}>
                    ${displayAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Reset Button */}
              <Pressable
                style={styles.resetButton}
                onPress={handleReset}
              >
                <MaterialIcons name="refresh" size={20} color={colors.employeeAccent} />
                <Text style={styles.resetButtonText}>New Calculation</Text>
              </Pressable>
            </View>
          )}

          {/* Help Card */}
          <View style={styles.helpCard}>
            <MaterialIcons name="info" size={24} color={colors.employeeAccent} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>How to use this calculator:</Text>
              <Text style={styles.helpText}>
                - Enter your total shift sales{'\n'}
                - Enter your cash in/out amount and toggle between positive (cashed in) or negative (cashed out){'\n'}
                - Select the tip out percentages for busser/runner and bartenders{'\n'}
                - Tap Calculate to see your final check out amount
              </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  calculatorCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    paddingVertical: 14,
  },
  cashInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  signToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    minWidth: 110,
  },
  signToggleButtonNegative: {
    backgroundColor: colors.error,
  },
  signToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  percentageOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  percentageButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.employeeBackground,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  percentageButtonSelected: {
    backgroundColor: colors.employeeAccent,
    borderColor: colors.employeeAccent,
  },
  percentageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  percentageButtonTextSelected: {
    color: '#FFFFFF',
  },
  calculatedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.employeeAccent,
    marginTop: 8,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeAccent,
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultsCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  negativeValue: {
    color: colors.error,
  },
  positiveValue: {
    color: colors.success,
  },
  divider: {
    height: 2,
    backgroundColor: colors.employeeAccent,
    marginVertical: 16,
  },
  finalTallyContainer: {
    backgroundColor: colors.employeePrimary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  finalTallyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  finalTallyRow: {
    alignItems: 'center',
  },
  finalTallyStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  owedStatus: {
    color: colors.success,
  },
  oweStatus: {
    color: colors.error,
  },
  finalTallyAmount: {
    fontSize: 42,
    fontWeight: '800',
  },
  owedAmount: {
    color: colors.success,
  },
  oweAmount: {
    color: colors.error,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeBackground,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.employeeAccent,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.employeeAccent,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
