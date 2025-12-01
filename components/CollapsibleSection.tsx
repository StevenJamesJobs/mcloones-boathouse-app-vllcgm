
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/styles/commonStyles';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  iconColor?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  variant?: 'employee' | 'manager';
}

export function CollapsibleSection({
  title,
  icon,
  iconColor,
  children,
  defaultExpanded = true,
  variant = 'employee',
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const accentColor = variant === 'manager' ? colors.managerAccent : colors.employeeAccent;
  const headerBgColor = variant === 'manager' ? colors.managerSectionHeader : colors.employeeSectionHeader;
  const cardBgColor = variant === 'manager' ? colors.managerCard : colors.employeeCard;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.header, { backgroundColor: headerBgColor }]}
        onPress={toggleExpanded}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <MaterialIcons
              name={icon as any}
              color={iconColor || accentColor}
              size={24}
            />
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <MaterialIcons
          name={isExpanded ? 'expand-less' : 'expand-more'}
          color={colors.text}
          size={28}
        />
      </Pressable>
      
      {isExpanded && (
        <View style={[styles.content, { backgroundColor: cardBgColor }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});
