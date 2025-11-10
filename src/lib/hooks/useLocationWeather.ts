import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  PlaceResult,
  PlacesResponse,
  SearchedLocationWeather,
} from '../types'

export const useLocationWeather = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<PlaceResult | null>(
    null,
  )

  // Places search query
  const { data: places, isLoading: isSearchLoading } = useQuery({
    queryKey: ['places', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { results: [] }
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchQuery,
        )}&count=5&language=en&format=json`,
      ).then((res) => res.json())
      return response as PlacesResponse
    },
    enabled: searchQuery.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Weather for selected location
  const {
    data: locationWeather,
    isLoading: isLocationLoading,
    refetch,
  } = useQuery({
    queryKey: ['location-weather', selectedLocation?.name],
    queryFn: async () => {
      if (!selectedLocation) return null
      console.log('Fetching weather for:', selectedLocation)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.latitude}&longitude=${selectedLocation.longitude}&current=temperature_2m,apparent_temperature,weather_code&timezone=${selectedLocation.timezone}`,
      )
      const weather = await response.json()
      return {
        location: selectedLocation,
        current: weather.current,
      } as SearchedLocationWeather
    },
    enabled: !!selectedLocation,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const onLocationSelect = async (place: PlaceResult) => {
    setSelectedLocation(place)
    setSearchQuery('')
    await refetch()
  }

  return {
    onLocationSelect,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    isSearchLoading,
    places,
    locationWeather,
    isLocationLoading,
  }
}
