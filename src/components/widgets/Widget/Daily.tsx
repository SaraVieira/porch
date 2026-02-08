import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { DailyWeather as DailyWeatherType, WeatherData } from '@/lib/types'
import { CarouselItem } from '@/components/ui/carousel'
import {
  getWeatherDescription,
  getWeatherIcon,
  getWeatherIconColor,
} from '@/lib/weather'
import { cn } from '@/lib/utils'

export const DailyWeather = () => {
  const lat = import.meta.env.VITE_WEATHER_LATITUDE || '51.5074'
  const lon = import.meta.env.VITE_WEATHER_LONGITUDE || '-0.1278'
  const tz = import.meta.env.VITE_WEATHER_TIMEZONE || 'Europe/London'
  const locationName =
    import.meta.env.VITE_WEATHER_LOCATION || 'London, United Kingdom'

  // Daily forecast query
  const { data: dailyForecast, isLoading: isDailyLoading } = useQuery({
    queryKey: ['daily-weather'],
    queryFn: async () => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=${tz}`,
      )
      return response.json() as Promise<WeatherData>
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  const processDailyData = (data: WeatherData): Array<DailyWeatherType> => {
    if (!data.daily) return []

    return data.daily.time.slice(1, 5).map((date, index) => ({
      date,
      weatherCode: data.daily!.weather_code[index + 1],
      maxTemp: Math.round(data.daily!.temperature_2m_max[index + 1]),
      minTemp: Math.round(data.daily!.temperature_2m_min[index + 1]),
      precipitationProbability:
        data.daily!.precipitation_probability_max[index + 1],
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }
  return (
    <CarouselItem>
      <div className="space-y-6">
        <div className="text-center">
          <div className="font-light text-highlight">4-Day Forecast</div>
          <div className="text-base-muted text-sm">{locationName}</div>
        </div>

        {isDailyLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-base-muted" />
          </div>
        ) : (
          <div className="space-y-3">
            {processDailyData(dailyForecast!).map((day, index) => {
              const WeatherIcon = getWeatherIcon(day.weatherCode)
              const iconColor = getWeatherIconColor(day.weatherCode)

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md bg-widget-background-highlight hover:bg-progress-value transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <WeatherIcon className={cn('w-5 h-5', iconColor)} />
                    <div>
                      <div className="text-sm font-medium text-highlight">
                        {formatDate(day.date)}
                      </div>
                      <div className="text-xs text-base-muted">
                        {getWeatherDescription(day.weatherCode)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {day.precipitationProbability > 20 && (
                      <div className="text-xs text-blue-400">
                        {day.precipitationProbability}%
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium text-highlight">
                        {day.maxTemp}°
                      </div>
                      <div className="text-xs text-base-muted">
                        {day.minTemp}°
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </CarouselItem>
  )
}
