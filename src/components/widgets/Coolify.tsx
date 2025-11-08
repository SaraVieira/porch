import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const getCoolifyData = async () => {
  const data = { services: [], applications: [] }
  try {
    const services = await fetch(
      'https://d.iamsaravieira.com/api/v1/services',
      {
        headers: {
          Authorization:
            'Bearer PdJbg179g75Ub9h0pqOqiXdJfe7xVxTzF0Ktzj0Ua8458203',
        },
      },
    ).then((rsp) => rsp.json())
    data.services = services
    const applications = await fetch(
      'https://d.iamsaravieira.com/api/v1/applications',
      {
        headers: {
          Authorization:
            'Bearer PdJbg179g75Ub9h0pqOqiXdJfe7xVxTzF0Ktzj0Ua8458203',
        },
      },
    ).then((rsp) => rsp.json())
    data.applications = applications
    return data
  } catch (error) {
    console.error('Error fetching Coolify data:', error)
  }
}

export const Coolify = () => {
  const [coolifyData, setCoolifyData] = useState<{
    services: Array<any>
    applications: Array<any>
  }>({ services: [], applications: [] })
  useEffect(() => {
    getCoolifyData().then(setCoolifyData)
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coolify</CardTitle>
      </CardHeader>
      <CardContent>{JSON.stringify(coolifyData, null, 2)}</CardContent>
    </Card>
  )
}
