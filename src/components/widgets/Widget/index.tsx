import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { Card, CardContent } from '../../ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '../../ui/carousel'
import { Skeleton } from '../../ui/skeleton'
import { CurrentWeather } from './Current'
import { DailyWeather } from './Daily'
import LocationWeather from './Locatiion'
import { get } from '@/lib/utils'
import type { WeatherData } from '@/lib/types'

const getWeather = createServerFn({
  method: 'GET',
}).handler(() =>
  get(
    'https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,apparent_temperature,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Europe/London',
  ),
)

export function Weather() {
  const { data: weatherData, isLoading } = useQuery<WeatherData>({
    queryKey: ['weather'],
    staleTime: 300000,
    queryFn: () => getWeather(),
  })

  if (isLoading || !weatherData) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="px-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="px-6">
        <Carousel className="w-full">
          <CarouselContent>
            <CurrentWeather weatherData={weatherData} />
            <DailyWeather />
            <LocationWeather />
          </CarouselContent>

          <div className="flex justify-center mt-4 gap-2">
            <CarouselPrevious className="static translate-y-0 w-8 h-8 bg-widget-background-highlight hover:bg-progress-value border-widget-content-border">
              <ChevronLeft className="w-4 h-4" />
            </CarouselPrevious>
            <CarouselNext className="static translate-y-0 w-8 h-8 bg-widget-background-highlight hover:bg-progress-value border-widget-content-border">
              <ChevronRight className="w-4 h-4" />
            </CarouselNext>
          </div>
        </Carousel>
      </CardContent>
    </Card>
  )
}
