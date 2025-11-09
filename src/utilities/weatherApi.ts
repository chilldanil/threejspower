/**
 * OpenWeatherMap API integration
 * Fetches real-time weather data and maps it to our preset weather types
 */

import type { WeatherType } from '../config/presetConfig';

const API_KEY = '8fbd0c2aeb2a33ee8b631dd430784f74';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface OpenWeatherResponse {
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  name: string;
}

/**
 * Fetches current weather data from OpenWeatherMap API
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<OpenWeatherResponse> {
  const url = `${API_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
}

/**
 * Maps OpenWeatherMap weather condition codes to our preset weather types
 *
 * OpenWeatherMap condition codes:
 * 2xx - Thunderstorm -> rainy
 * 3xx - Drizzle -> rainy
 * 5xx - Rain -> rainy
 * 6xx - Snow -> snowy
 * 7xx - Atmosphere (fog, mist, haze, etc.) -> foggy
 * 800 - Clear sky -> clear
 * 80x - Clouds -> cloudy
 */
export function mapWeatherConditionToPreset(
  weatherData: OpenWeatherResponse
): WeatherType {
  const weatherId = weatherData.weather[0]?.id || 800;
  const cloudiness = weatherData.clouds.all; // 0-100%
  const visibility = weatherData.visibility; // meters

  // Snow conditions (6xx)
  if (weatherId >= 600 && weatherId < 700) {
    return 'snowy';
  }

  // Rain conditions (2xx, 3xx, 5xx)
  if (
    (weatherId >= 200 && weatherId < 300) || // Thunderstorm
    (weatherId >= 300 && weatherId < 400) || // Drizzle
    (weatherId >= 500 && weatherId < 600)    // Rain
  ) {
    return 'rainy';
  }

  // Foggy/Mist/Haze conditions (7xx) or low visibility
  if (
    (weatherId >= 700 && weatherId < 800) ||
    visibility < 1000 // Less than 1km visibility
  ) {
    return 'foggy';
  }

  // Clear sky (800)
  if (weatherId === 800) {
    return 'clear';
  }

  // Cloudy conditions (801-804)
  if (weatherId > 800 && weatherId < 900) {
    // 801: few clouds (11-25%)
    // 802: scattered clouds (25-50%)
    // 803: broken clouds (51-84%)
    // 804: overcast clouds (85-100%)

    // Use cloudiness percentage to determine if it's clear or cloudy
    if (cloudiness < 25) {
      return 'clear';
    } else {
      return 'cloudy';
    }
  }

  // Default to clear
  return 'clear';
}

/**
 * Gets the current weather preset for a location
 */
export async function getCurrentWeatherPreset(
  latitude: number,
  longitude: number
): Promise<{ weatherType: WeatherType; weatherData: OpenWeatherResponse }> {
  const weatherData = await fetchWeatherData(latitude, longitude);
  const weatherType = mapWeatherConditionToPreset(weatherData);

  return { weatherType, weatherData };
}

/**
 * Formats weather data for display
 */
export function formatWeatherInfo(weatherData: OpenWeatherResponse): string {
  const temp = Math.round(weatherData.main.temp);
  const description = weatherData.weather[0]?.description || 'Unknown';
  const location = weatherData.name;

  return `${location}: ${description}, ${temp}°C`;
}
