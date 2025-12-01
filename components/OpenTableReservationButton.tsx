
import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/styles/commonStyles';

interface OpenTableReservationButtonProps {
  restaurantUrl: string;
  restaurantName?: string;
}

export function OpenTableReservationButton({
  restaurantUrl,
  restaurantName = "McLoone's Boathouse",
}: OpenTableReservationButtonProps) {
  const handleReservation = async () => {
    try {
      const supported = await Linking.canOpenURL(restaurantUrl);
      
      if (supported) {
        await Linking.openURL(restaurantUrl);
      } else {
        Alert.alert('Error', 'Unable to open reservation page');
      }
    } catch (error) {
      console.error('Error opening OpenTable URL:', error);
      Alert.alert('Error', 'Could not open reservation page');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleReservation}
      >
        <View style={styles.buttonContent}>
          <View style={styles.leftContent}>
            <MaterialIcons name="restaurant" size={28} color="#FFFFFF" />
            <View style={styles.textContent}>
              <Text style={styles.buttonTitle}>Make a Reservation</Text>
              <Text style={styles.buttonSubtitle}>Book your table on OpenTable</Text>
            </View>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
        </View>
      </Pressable>
      
      <View style={styles.infoRow}>
        <MaterialIcons name="info-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          You&apos;ll be redirected to OpenTable to complete your reservation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: '#da3743',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
