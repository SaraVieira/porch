import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '../../ui/carousel'
import { CurrentWeather } from './Current'
import { DailyWeather } from './Daily'
import LocationWeather from './Locatiion'
import type { WeatherData } from '@/lib/types'

export function Weather({ weatherData }: { weatherData: WeatherData }) {
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
