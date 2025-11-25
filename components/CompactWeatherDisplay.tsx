
import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useWeather } from '@/hooks/useWeather';

export function CompactWeatherDisplay() {
  const { weatherData, loading, error } = useWeather();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error || !weatherData) {
    return null; // Don't show anything if weather fails to load
  }

  const today = weatherData.forecast.forecastday[0];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>McLoone&apos;s Boathouse Weather</Text>
          <View style={styles.tempRow}>
            <Text style={styles.currentTemp}>{Math.round(weatherData.current.temp_f)}°F</Text>
            <Image
              source={{ uri: `https:${weatherData.current.condition.icon}` }}
              style={styles.weatherIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.condition}>{weatherData.current.condition.text}</Text>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.highLowRow}>
            <Text style={styles.highLowLabel}>High:</Text>
            <Text style={styles.highTemp}>{Math.round(today.day.maxtemp_f)}°</Text>
          </View>
          <View style={styles.highLowRow}>
            <Text style={styles.highLowLabel}>Low:</Text>
            <Text style={styles.lowTemp}>{Math.round(today.day.mintemp_f)}°</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  weatherIcon: {
    width: 40,
    height: 40,
  },
  condition: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  highLowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  highLowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 6,
  },
  highTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
  },
  lowTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
  },
});
