import { Card, CardContent } from '../ui/card'
import type { WeatherData } from '@/lib/types'
import {
  getTimeLabels,
  getWeatherDescription,
  processWeatherData,
} from '@/lib/weather'
import { cn } from '@/lib/utils'

export function Weather({ weatherData }: { weatherData: WeatherData }) {
  const weatherCondition = getWeatherDescription(
    weatherData.current.weather_code,
  )
  const feelsLike = Math.round(weatherData.current.apparent_temperature)
  const columns = processWeatherData(weatherData)
  const timeLabels = getTimeLabels()

  return (
    <Card className="animate-fade-in">
      <CardContent className="px-6">
        <div className="text-center space-y-2 mb-6">
          <div className="text-lg font-light">{weatherCondition}</div>
          <div className="text-base text-sm">Feels like {feelsLike}°C</div>
        </div>

        <div className="weather-columns flex justify-center mt-4">
          {columns.map((column, index) => (
            <div
              key={index}
              className={cn(
                'weather-column relative flex items-center justify-end flex-col pt-1 w-1/12',
                column.isCurrentColumn && 'weather-column-current',
              )}
              style={{ width: 'calc(100% / 12)' }}
            >
              {column.hasPrecipitation && (
                <div className="weather-column-rain" />
              )}

              <div
                className={cn(
                  'weather-column-value',
                  column.temperature < 0 && 'weather-column-value-negative',
                )}
              >
                {Math.abs(column.temperature)}
              </div>

              <div
                className="weather-bar"
                style={
                  {
                    '--weather-bar-height': column.scale.toString(),
                  } as React.CSSProperties
                }
              />

              <div className="weather-column-time text-sm">
                {timeLabels[index]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
