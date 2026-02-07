import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import type { CoolifyAPI } from '@/lib/types'

const getCoolifyData = async () => {
  const data = { services: [], applications: [] }
  try {
    const services = await fetch(
      'https://dashboard.iamsaravieira.com/api/v1/services',
      {
        headers: {
          Authorization:
            'Bearer PdJbg179g75Ub9h0pqOqiXdJfe7xVxTzF0Ktzj0Ua8458203',
        },
      },
    ).then((rsp) => rsp.json())
    data.services = services
    const applications = await fetch(
      'https://dashboard.iamsaravieira.com/api/v1/applications',
      {
        headers: {
          Authorization:
            'Bearer PdJbg179g75Ub9h0pqOqiXdJfe7xVxTzF0Ktzj0Ua8458203',
        },
      },
    ).then((rsp) => rsp.json())
    data.applications = applications
    return data as CoolifyAPI
  } catch (error) {
    console.error('Error fetching Coolify data:', error)
  }
}

export const Coolify = () => {
  const [coolifyData, setCoolifyData] = useState<CoolifyAPI>({
    services: [],
    applications: [],
  })
  useEffect(() => {
    getCoolifyData().then((data) => {
      if (data) setCoolifyData(data)
    })
  }, [])

  const getStatusEl = (status: string) => {
    const [a, b] = status.split(':')
    const isHealthy = b.trim() === 'healthy'
    const isRunning = a.trim() === 'running'

    return (
      <>
        <div
          className={clsx(
            'rounded-full w-4 h-4',
            isRunning ? 'bg-green-400' : 'bg-red-400',
          )}
        />
        <div
          className={clsx(
            'rounded-full w-4 h-4',
            isHealthy ? 'bg-green-400' : 'bg-yellow-400',
          )}
        />
      </>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coolify</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="applications">
            <AccordionTrigger>Applications</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              {coolifyData.applications.map((app) => (
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>{app.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Tooltip>
                      <TooltipTrigger className="flex gap-1">
                        {getStatusEl(app.status)}
                      </TooltipTrigger>
                      <TooltipContent>{app.status}</TooltipContent>
                    </Tooltip>
                    <a
                      href={app.fqdn}
                      className="text-orange-accent"
                      target="_blank"
                    >
                      <ArrowUpRight />
                    </a>
                  </ItemActions>
                </Item>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="services">
            <AccordionTrigger>Services</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              {coolifyData.services.map((app) => (
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle className="flex items-center justify-between">
                      {app.name}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Tooltip>
                      <TooltipTrigger className="flex gap-1">
                        {getStatusEl(app.status)}
                      </TooltipTrigger>
                      <TooltipContent>{app.status}</TooltipContent>
                    </Tooltip>
                    <a
                      href={app.applications.find((a) => a.fqdn)?.fqdn || '#'}
                      className="text-orange-accent"
                      target="_blank"
                    >
                      <ArrowUpRight />
                    </a>
                  </ItemActions>
                </Item>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
