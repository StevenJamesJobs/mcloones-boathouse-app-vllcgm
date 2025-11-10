
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// McLoone's Boathouse Color Scheme
export const colors = {
  // Customer-facing colors (Light blue and white theme)
  background: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#ADD8E6',
  secondary: '#87CEEB',
  accent: '#4682B4',
  card: '#F0F8FF',
  highlight: '#B0E2FF',
  
  // Employee-facing colors (Slightly darker)
  employeeBackground: '#F0F8FF',
  employeeCard: '#E6F3FF',
  employeePrimary: '#6BA3D1',
  employeeAccent: '#3A6EA5',
  
  // Manager-specific colors
  managerPrimary: '#4682B4',
  managerAccent: '#2E5A8A',
  
  // Utility colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  border: '#E0E0E0',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  employeeContainer: {
    flex: 1,
    backgroundColor: colors.employeeBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  employeeCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionTitle: {
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});
