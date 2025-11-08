import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { SearchSelect } from './SearchSelect'
import { countries as countriesData } from '@/lib/countries'

export const AddCountryModal = () => {
  const [open, setOpen] = useState(false)
  const [currentCountry, setCurrentCountry] = useState<any>()
  const queryClient = useQueryClient()
  const onChange = async (name: string) => {
    const data = await fetch(
      `https://restcountries.com/v3.1/alpha/${name}`,
    ).then((rsp) => rsp.json())

    setCurrentCountry({
      name: data[0].name.common,
      region: data[0].region,
      flag: data[0].flags.png,
      location: data[0].latlng,
      subregion: data[0].subregion,
      currency: (Object.values(data[0].currencies)[0] as any).name,
      id: uuidv4(),
    })
  }

  const onAddCountry = async () => {
    await fetch(`/api/countries`, {
      method: 'POST',
      body: JSON.stringify(currentCountry),
    })
    queryClient.invalidateQueries({ queryKey: ['countries'] })
    setOpen(false)
  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add Country</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a country</DialogTitle>
            <div className="pt-4">
              <SearchSelect
                data={countriesData.map((c) => ({
                  value: c.code,
                  label: c.name,
                }))}
                onChange={onChange}
              />
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button disabled={!currentCountry} onClick={onAddCountry}>
              Add country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
