import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { SearchSelect } from './SearchSelect'
import { countries as countryInfo } from '@/lib/countries'

export const AddConferenceModal = () => {
  const [notes, setNotes] = useState('')
  const [open, setIsOpen] = useState(false)
  const [country, setCountry] = useState({})
  const [city, setCity] = useState('')
  const [link, setLink] = useState('')
  const [name, setName] = useState('')
  const queryClient = useQueryClient()
  const onAddConference = async () => {
    await fetch(`/api/conferences`, {
      method: 'POST',
      body: JSON.stringify({
        id: uuidv4(),
        name,
        notes,
        country,
        city,
        link,
      }),
    })
    setNotes('')
    setIsOpen(false)
    setCountry({})
    setCity('')
    setLink('')
    setName('')
    queryClient.invalidateQueries({ queryKey: ['conferences'] })
  }

  const onChange = async (countryName: string) => {
    const data = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryName}`,
    ).then((rsp) => rsp.json())
    setCountry({
      name: data[0].name.common,
      region: data[0].region,
      flag: data[0].flags.png,
      location: data[0].latlng,
      subregion: data[0].subregion,
    })
  }
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Conference</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a conference</DialogTitle>
          <div className="pt-4 flex flex-col gap-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Conference Name"
            />
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Conference Website"
            />
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Conference City"
            />
            <SearchSelect
              data={countryInfo.map((c) => ({
                value: c.code,
                label: c.name,
              }))}
              onChange={onChange}
            />
            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={!name || !city} onClick={onAddConference}>
            Add Conference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
