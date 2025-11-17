
import { StyleSheet } from 'react-native';

export const colors = {
  // Customer side colors (light blue and white theme)
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#000000',
  primary: '#3289a8',      // Light blue
  secondary: '#000000',    // Sky blue
  accent: '#3289a8',       // Steel blue // Buttons and Tagline
	secondaryaccent: '#000000',    // Black
	taglineaccent: '#000000',    //Black
  card: '#f0f8ff',         // Alice blue
  highlight: '#3289a8',     // Light sky blue
  border: '#FFFFFF',    // Thumbnail backgroud
  error: '#DC3545',  
  success: '#28A745',
  warning: '#FFC107',
  
  // Employee side colors (slightly darker)
  employeeBackground: '#F5F5F5',
  employeePrimary: '#87CEEB',
  employeeSecondary: '#4682B4',
  employeeAccent: '#5F9EA0',
  employeeCard: '#E6F3F7',
  
  // Manager side colors (darker blue and gray)
  managerBackground: '#E8EEF2',
  managerPrimary: '#2C5F7C',
  managerSecondary: '#4682B4',
  managerAccent: '#5F9EA0',
  managerCard: '#D6E4EC',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  employeeContainer: {
    flex: 1,
    backgroundColor: colors.employeeBackground,
  },
  managerContainer: {
    flex: 1,
    backgroundColor: colors.managerBackground,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  managerCard: {
    backgroundColor: colors.managerCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
