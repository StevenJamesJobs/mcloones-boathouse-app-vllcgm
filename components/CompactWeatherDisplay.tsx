
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
      <Text style={styles.condition}>{weatherData.current.condition.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 6,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentTemp: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  weatherIcon: {
    width: 36,
    height: 36,
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
    fontSize: 13,
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
  condition: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
});
