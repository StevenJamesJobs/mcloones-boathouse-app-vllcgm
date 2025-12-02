
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
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>McLoone&apos;s Boathouse Weather</Text>
          <View style={styles.tempRow}>
            <Image
              source={{ uri: `https:${weatherData.current.condition.icon}` }}
              style={styles.weatherIcon}
              resizeMode="contain"
            />
            <Text style={styles.currentTemp}>{Math.round(weatherData.current.temp_f)}°F</Text>
          </View>
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
      <View style={styles.forecastSection}>
        <Text style={styles.condition}>{weatherData.current.condition.text}</Text>
        <Text style={styles.forecast}>{today.day.condition.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.employeeAccent,
    marginBottom: 8,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 48,
    height: 48,
    marginRight: 8,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  lowTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  forecastSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  condition: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  forecast: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
