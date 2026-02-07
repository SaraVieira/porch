import { describe, it, expect } from 'vitest'
import {
  Sun,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Eye,
  Zap,
} from 'lucide-react'
import {
  getWeatherDescription,
  getWeatherIcon,
  getWeatherIconColor,
  processWeatherData,
} from '../weather'
import type { WeatherData } from '../types'

describe('getWeatherDescription', () => {
  it('returns description for known codes', () => {
    expect(getWeatherDescription(0)).toBe('Clear Sky')
    expect(getWeatherDescription(3)).toBe('Overcast')
    expect(getWeatherDescription(61)).toBe('Rain')
    expect(getWeatherDescription(95)).toBe('Thunderstorm')
  })

  it('returns Unknown for unrecognized codes', () => {
    expect(getWeatherDescription(999)).toBe('Unknown')
  })
})

describe('getWeatherIcon', () => {
  it('returns Sun for clear sky', () => {
    expect(getWeatherIcon(0)).toBe(Sun)
    expect(getWeatherIcon(1)).toBe(Sun)
  })

  it('returns Cloud for cloudy', () => {
    expect(getWeatherIcon(2)).toBe(Cloud)
    expect(getWeatherIcon(3)).toBe(Cloud)
  })

  it('returns Eye for fog', () => {
    expect(getWeatherIcon(45)).toBe(Eye)
    expect(getWeatherIcon(48)).toBe(Eye)
  })

  it('returns CloudDrizzle for drizzle', () => {
    expect(getWeatherIcon(51)).toBe(CloudDrizzle)
    expect(getWeatherIcon(55)).toBe(CloudDrizzle)
  })

  it('returns CloudRain for rain', () => {
    expect(getWeatherIcon(61)).toBe(CloudRain)
    expect(getWeatherIcon(65)).toBe(CloudRain)
  })

  it('returns CloudSnow for snow', () => {
    expect(getWeatherIcon(71)).toBe(CloudSnow)
    expect(getWeatherIcon(75)).toBe(CloudSnow)
  })

  it('returns CloudLightning for thunderstorm', () => {
    expect(getWeatherIcon(95)).toBe(CloudLightning)
  })

  it('returns Zap for severe thunderstorm', () => {
    expect(getWeatherIcon(96)).toBe(Zap)
    expect(getWeatherIcon(99)).toBe(Zap)
  })

  it('defaults to Cloud for unknown code', () => {
    expect(getWeatherIcon(999)).toBe(Cloud)
  })
})

describe('getWeatherIconColor', () => {
  it('returns yellow for clear', () => {
    expect(getWeatherIconColor(0)).toBe('text-yellow-400')
  })

  it('returns gray for cloudy', () => {
    expect(getWeatherIconColor(2)).toBe('text-gray-400')
  })

  it('returns blue for rain', () => {
    expect(getWeatherIconColor(61)).toBe('text-blue-400')
  })

  it('defaults to gray for unknown', () => {
    expect(getWeatherIconColor(999)).toBe('text-gray-400')
  })
})

describe('processWeatherData', () => {
  function makeWeatherData(overrides?: Partial<WeatherData>): WeatherData {
    const temps = Array.from({ length: 24 }, (_, i) => 10 + i)
    const precip = Array.from({ length: 24 }, () => 20)
    return {
      current: {
        temperature_2m: 20,
        apparent_temperature: 18,
        weather_code: 0,
      },
      hourly: {
        time: Array.from(
          { length: 24 },
          (_, i) => `2024-01-01T${String(i).padStart(2, '0')}:00`,
        ),
        temperature_2m: temps,
        precipitation_probability: precip,
        weather_code: Array.from({ length: 24 }, () => 0),
      },
      ...overrides,
    }
  }

  it('returns 12 columns', () => {
    const result = processWeatherData(makeWeatherData())
    expect(result).toHaveLength(12)
  })

  it('each column has required fields', () => {
    const result = processWeatherData(makeWeatherData())
    for (const col of result) {
      expect(col).toHaveProperty('temperature')
      expect(col).toHaveProperty('scale')
      expect(col).toHaveProperty('hasPrecipitation')
      expect(col).toHaveProperty('isCurrentColumn')
      expect(typeof col.temperature).toBe('number')
      expect(typeof col.scale).toBe('number')
      expect(typeof col.hasPrecipitation).toBe('boolean')
      expect(typeof col.isCurrentColumn).toBe('boolean')
    }
  })

  it('exactly one column is current', () => {
    const result = processWeatherData(makeWeatherData())
    const currentCols = result.filter((c) => c.isCurrentColumn)
    expect(currentCols).toHaveLength(1)
  })

  it('flags precipitation when probability > 75%', () => {
    const precip = Array.from({ length: 24 }, () => 90)
    const result = processWeatherData(
      makeWeatherData({
        hourly: {
          time: Array.from(
            { length: 24 },
            (_, i) => `2024-01-01T${String(i).padStart(2, '0')}:00`,
          ),
          temperature_2m: Array.from({ length: 24 }, () => 15),
          precipitation_probability: precip,
          weather_code: Array.from({ length: 24 }, () => 0),
        },
      }),
    )
    expect(result.every((c) => c.hasPrecipitation)).toBe(true)
  })

  it('no precipitation when probability is low', () => {
    const precip = Array.from({ length: 24 }, () => 10)
    const result = processWeatherData(
      makeWeatherData({
        hourly: {
          time: Array.from(
            { length: 24 },
            (_, i) => `2024-01-01T${String(i).padStart(2, '0')}:00`,
          ),
          temperature_2m: Array.from({ length: 24 }, () => 15),
          precipitation_probability: precip,
          weather_code: Array.from({ length: 24 }, () => 0),
        },
      }),
    )
    expect(result.every((c) => !c.hasPrecipitation)).toBe(true)
  })
})
