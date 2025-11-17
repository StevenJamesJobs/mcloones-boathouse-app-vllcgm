
import { useState, useEffect } from 'react';

interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

interface CurrentWeather {
  temp_f: number;
  condition: WeatherCondition;
}

interface ForecastDay {
  date: string;
  day: {
    maxtemp_f: number;
    mintemp_f: number;
    condition: WeatherCondition;
  };
}

interface WeatherData {
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
}

interface UseWeatherReturn {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_KEY = '6e3db8832cf34a5bbc5182329251711';
const LOCATION = '9 Cherry Ln, West Orange, NJ 07052'; // McLoone's Boathouse exact address

export function useWeather(): UseWeatherReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(LOCATION)}&days=4&aqi=no&alerts=no`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Weather data fetched successfully for:', LOCATION);
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    weatherData,
    loading,
    error,
    refetch: fetchWeather,
  };
}
