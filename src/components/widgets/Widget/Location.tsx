import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CarouselItem } from '@/components/ui/carousel'
import { Input } from '@/components/ui/input'
import {
  getWeatherDescription,
  getWeatherIcon,
  getWeatherIconColor,
} from '@/lib/weather'
import { cn } from '@/lib/utils'
import { useLocationWeather } from '@/lib/hooks/useLocationWeather'

export default () => {
  const {
    onLocationSelect,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    isSearchLoading,
    places,
    locationWeather,
    isLocationLoading,
  } = useLocationWeather()

  return (
    <CarouselItem>
      <div className="space-y-6">
        <div className="text-center">
          <div className="font-light text-highlight">Search Location</div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-muted" />
          <Input
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-widget-background-highlight border-widget-content-border text-highlight placeholder:text-base-muted"
          />
        </div>

        {isSearchLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-base-muted" />
          </div>
        )}

        {places?.results && places.results.length > 0 && (
          <div className="space-y-2">
            {places.results.map((place) => (
              <Button
                key={place.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 bg-widget-background-highlight hover:bg-progress-value transition-colors duration-200"
                onClick={() => onLocationSelect(place)}
              >
                <div>
                  <div className="text-sm font-medium text-highlight">
                    {place.name}
                  </div>
                  <div className="text-xs text-base-muted">
                    {place.admin1 && `${place.admin1}, `}
                    {place.country}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Selected Location Weather */}
        {selectedLocation && (
          <div className="mt-6 p-4 rounded-md bg-widget-background-highlight">
            {isLocationLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-base-muted" />
              </div>
            ) : locationWeather ? (
              <div className="text-center space-y-3">
                <div>
                  <div className="text-lg font-medium text-highlight">
                    {locationWeather.location.name}
                  </div>
                  <div className="text-xs text-base-muted">
                    {locationWeather.location.admin1 &&
                      `${locationWeather.location.admin1}, `}
                    {locationWeather.location.country}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {(() => {
                    const WeatherIcon = getWeatherIcon(
                      locationWeather.current.weather_code,
                    )

                    return (
                      <WeatherIcon
                        className={cn(
                          'w-8 h-8',
                          getWeatherIconColor(
                            locationWeather.current.weather_code,
                          ),
                        )}
                      />
                    )
                  })()}

                  <div>
                    <div className="text-2xl font-light text-highlight">
                      {Math.round(locationWeather.current.temperature_2m)}
                      °C
                    </div>
                    <div className="text-xs text-base-muted">
                      Feels like{' '}
                      {Math.round(locationWeather.current.apparent_temperature)}
                      °C
                    </div>
                  </div>
                </div>

                <div className="text-sm text-base">
                  {getWeatherDescription(locationWeather.current.weather_code)}
                </div>
              </div>
            ) : (
              <div className="text-center text-base-muted text-sm">
                Failed to load weather data
              </div>
            )}
          </div>
        )}

        {searchQuery.length > 0 && searchQuery.length <= 2 && (
          <div className="text-center text-base-muted text-xs">
            Type at least 3 characters to search
          </div>
        )}
      </div>
    </CarouselItem>
  )
}
