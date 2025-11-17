
import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useWeather } from '@/hooks/useWeather';

interface WeatherDisplayProps {
  variant?: 'employee' | 'manager';
}

export function WeatherDisplay({ variant = 'employee' }: WeatherDisplayProps) {
  const { weatherData, loading, error, refetch } = useWeather();

  const accentColor = variant === 'manager' ? colors.managerAccent : colors.employeeAccent;
  const primaryColor = variant === 'manager' ? colors.managerPrimary : colors.employeePrimary;

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <IconSymbol 
            ios_icon_name="cloud.sun.fill" 
            android_material_icon_name="wb_sunny" 
            color={accentColor} 
            size={24} 
          />
          <Text style={styles.cardTitle}>Today&apos;s Weather</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </View>
    );
  }

  if (error || !weatherData) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <IconSymbol 
            ios_icon_name="cloud.sun.fill" 
            android_material_icon_name="wb_sunny" 
            color={accentColor} 
            size={24} 
          />
          <Text style={styles.cardTitle}>Today&apos;s Weather</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load weather data</Text>
          <Pressable onPress={refetch} style={[styles.retryButton, { backgroundColor: accentColor }]}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const today = weatherData.forecast.forecastday[0];
  // Extended forecast shows the NEXT two days (excluding today)
  const tomorrow = weatherData.forecast.forecastday[1];
  const dayAfter = weatherData.forecast.forecastday[2];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconSymbol 
          ios_icon_name="cloud.sun.fill" 
          android_material_icon_name="wb_sunny" 
          color={accentColor} 
          size={24} 
        />
        <Text style={styles.cardTitle}>Today&apos;s Weather</Text>
      </View>

      {/* Current Weather */}
      <View style={styles.currentWeather}>
        <View style={styles.currentLeft}>
          <Text style={styles.currentTemp}>{Math.round(weatherData.current.temp_f)}°F</Text>
          <Text style={styles.currentCondition}>{weatherData.current.condition.text}</Text>
          <View style={styles.highLowContainer}>
            <View style={styles.highLowItem}>
              <IconSymbol 
                ios_icon_name="arrow.up" 
                android_material_icon_name="arrow_upward" 
                color={colors.error} 
                size={16} 
              />
              <Text style={styles.highLowText}>{Math.round(today.day.maxtemp_f)}°</Text>
            </View>
            <View style={styles.highLowItem}>
              <IconSymbol 
                ios_icon_name="arrow.down" 
                android_material_icon_name="arrow_downward" 
                color={colors.accent} 
                size={16} 
              />
              <Text style={styles.highLowText}>{Math.round(today.day.mintemp_f)}°</Text>
            </View>
          </View>
        </View>
        <View style={styles.currentRight}>
          <Image
            source={{ uri: `https:${weatherData.current.condition.icon}` }}
            style={styles.weatherIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Forecast Summary */}
      <View style={styles.forecastSummary}>
        <Text style={styles.forecastTitle}>Today&apos;s Forecast</Text>
        <Text style={styles.forecastText}>
          Expect {today.day.condition.text.toLowerCase()} conditions with temperatures ranging from {Math.round(today.day.mintemp_f)}°F to {Math.round(today.day.maxtemp_f)}°F.
        </Text>
      </View>

      {/* Extended Forecast - Next Two Days Only */}
      <View style={styles.extendedForecast}>
        <Text style={styles.extendedTitle}>Extended Forecast</Text>
        <View style={styles.forecastDays}>
          {/* Tomorrow (Day 1) */}
          {tomorrow && (
            <View style={[styles.forecastDay, { backgroundColor: primaryColor }]}>
              <Text style={styles.forecastDayName}>{formatDate(tomorrow.date)}</Text>
              <Image
                source={{ uri: `https:${tomorrow.day.condition.icon}` }}
                style={styles.forecastIcon}
                resizeMode="contain"
              />
              <View style={styles.forecastTemps}>
                <Text style={styles.forecastHigh}>{Math.round(tomorrow.day.maxtemp_f)}°</Text>
                <Text style={styles.forecastLow}>{Math.round(tomorrow.day.mintemp_f)}°</Text>
              </View>
            </View>
          )}

          {/* Day After Tomorrow (Day 2) */}
          {dayAfter && (
            <View style={[styles.forecastDay, { backgroundColor: primaryColor }]}>
              <Text style={styles.forecastDayName}>{formatDate(dayAfter.date)}</Text>
              <Image
                source={{ uri: `https:${dayAfter.day.condition.icon}` }}
                style={styles.forecastIcon}
                resizeMode="contain"
              />
              <View style={styles.forecastTemps}>
                <Text style={styles.forecastHigh}>{Math.round(dayAfter.day.maxtemp_f)}°</Text>
                <Text style={styles.forecastLow}>{Math.round(dayAfter.day.mintemp_f)}°</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  currentWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLeft: {
    flex: 1,
  },
  currentTemp: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 64,
  },
  currentCondition: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  highLowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  highLowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highLowText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currentRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  forecastSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  forecastText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  extendedForecast: {
    marginTop: 8,
  },
  extendedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  forecastDays: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastDay: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  forecastDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  forecastIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  forecastLow: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
