import type { WeatherColumn, WeatherData } from './types'

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
