import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Eye,
  Sun,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WeatherColumn, WeatherData } from './types'

export const getWeatherIcon = (weatherCode: number): LucideIcon => {
  const iconMap: Record<number, LucideIcon> = {
    // Clear sky
    0: Sun,
    // Mainly clear
    1: Sun,
    // Partly cloudy
    2: Cloud,
    // Overcast
    3: Cloud,
    // Fog
    45: Eye,
    48: Eye,
    // Drizzle
    51: CloudDrizzle,
    53: CloudDrizzle,
    55: CloudDrizzle,
    56: CloudDrizzle,
    57: CloudDrizzle,
    // Rain
    61: CloudRain,
    63: CloudRain,
    65: CloudRain,
    66: CloudRain,
    67: CloudRain,
    // Snow
    71: CloudSnow,
    73: CloudSnow,
    75: CloudSnow,
    77: CloudSnow,
    // Rain showers
    80: CloudRain,
    81: CloudRain,
    82: CloudRain,
    // Snow showers
    85: CloudSnow,
    86: CloudSnow,
    // Thunderstorm
    95: CloudLightning,
    96: Zap,
    99: Zap,
  }

  return iconMap[weatherCode] ?? Cloud
}

export const getWeatherIconColor = (weatherCode: number): string => {
  const colorMap: Record<number, string> = {
    // Clear/sunny - yellow
    0: 'text-yellow-400',
    1: 'text-yellow-400',
    // Cloudy - gray
    2: 'text-gray-400',
    3: 'text-gray-400',
    // Fog - gray
    45: 'text-gray-500',
    48: 'text-gray-500',
    // Drizzle - light blue
    51: 'text-blue-300',
    53: 'text-blue-300',
    55: 'text-blue-300',
    56: 'text-blue-300',
    57: 'text-blue-300',
    // Rain - blue
    61: 'text-blue-400',
    63: 'text-blue-400',
    65: 'text-blue-400',
    66: 'text-blue-400',
    67: 'text-blue-400',
    // Snow - light blue/white
    71: 'text-blue-100',
    73: 'text-blue-100',
    75: 'text-blue-100',
    77: 'text-blue-100',
    // Rain showers - blue
    80: 'text-blue-400',
    81: 'text-blue-400',
    82: 'text-blue-400',
    // Snow showers - light blue
    85: 'text-blue-100',
    86: 'text-blue-100',
    // Thunderstorm - purple/yellow
    95: 'text-purple-400',
    96: 'text-yellow-300',
    99: 'text-yellow-300',
  }

  return colorMap[weatherCode] || 'text-gray-400'
}

export const weatherCodes: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime Fog',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  56: 'Drizzle',
  57: 'Drizzle',
  61: 'Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Freezing Rain',
  71: 'Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Rain',
  81: 'Moderate Rain',
  82: 'Heavy Rain',
  85: 'Snow',
  86: 'Snow',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
}

export const getWeatherDescription = (code: number) =>
  weatherCodes[code] || 'Unknown'

export const processWeatherData = (
  weatherData: WeatherData,
): Array<WeatherColumn> => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentBar = Math.floor(currentHour / 2)

  // Group hourly data into 2-hour intervals (12 bars for 24 hours)
  const columns: Array<WeatherColumn> = []
  const temperatures: Array<number> = []
  const precipitations: Array<boolean> = []

  // Take first 24 hours of data
  const hourlyTemps = weatherData.hourly.temperature_2m.slice(0, 24)
  const hourlyPrecip = weatherData.hourly.precipitation_probability.slice(0, 24)

  for (let i = 0; i < 24; i += 2) {
    const avgTemp =
      i === currentBar * 2
        ? Math.round(weatherData.current.temperature_2m)
        : Math.round((hourlyTemps[i] + hourlyTemps[i + 1]) / 2)

    const avgPrecip = (hourlyPrecip[i] + hourlyPrecip[i + 1]) / 2

    temperatures.push(avgTemp)
    precipitations.push(avgPrecip > 75)
  }

  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const tempRange = maxTemp - minTemp

  for (let i = 0; i < 12; i++) {
    const scale = tempRange > 0 ? (temperatures[i] - minTemp) / tempRange : 1

    columns.push({
      temperature: temperatures[i],
      scale,
      hasPrecipitation: precipitations[i],
      isCurrentColumn: i === currentBar,
    })
  }

  return columns
}

export const getTimeLabels = () => {
  return [
    '02:00',
    '04:00',
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
    '00:00',
  ]
}
