import type { WeatherData } from '@/lib/types'
import { CarouselItem } from '@/components/ui/carousel'
import {
  getTimeLabels,
  getWeatherDescription,
  processWeatherData,
} from '@/lib/weather'
import { cn } from '@/lib/utils'

export const CurrentWeather = ({
  weatherData,
}: {
  weatherData: WeatherData
}) => {
  const weatherCondition = getWeatherDescription(
    weatherData.current.weather_code,
  )
  const feelsLike = Math.round(weatherData.current.apparent_temperature)
  const columns = processWeatherData(weatherData)
  const timeLabels = getTimeLabels()

  return (
    <CarouselItem>
      <div className="space-y-3">
        {/* Current Weather */}
        <div className="text-center space-y-1">
          <div className="font-light text-highlight">{weatherCondition}</div>
          <div className="text-base text-sm">Feels like {feelsLike}°C</div>
        </div>

        {/* Weather Columns */}
        <div className="weather-columns flex justify-center">
          {columns.map((column, index) => (
            <div
              key={index}
              className={cn(
                'weather-column relative flex items-center justify-end flex-col pt-1',
                column.isCurrentColumn && 'weather-column-current',
              )}
              style={{ width: 'calc(100% / 12)' }}
            >
              {/* Rain Effect */}
              {column.hasPrecipitation && (
                <div className="weather-column-rain" />
              )}

              {/* Temperature Value */}
              <div
                className={cn(
                  'weather-column-value',
                  column.temperature < 0 && 'weather-column-value-negative',
                )}
              >
                {Math.abs(column.temperature)}
              </div>

              {/* Temperature Bar */}
              <div
                className="weather-bar"
                style={
                  {
                    '--weather-bar-height': column.scale.toString(),
                  } as React.CSSProperties
                }
              />

              {/* Time Label */}
              <div className="weather-column-time">{timeLabels[index]}</div>
            </div>
          ))}
        </div>
      </div>
    </CarouselItem>
  )
}
