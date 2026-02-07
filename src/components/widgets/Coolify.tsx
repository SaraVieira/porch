import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { WidgetShell } from '../WidgetShell'
import { useCoolify } from '@/hooks/useCoolify'

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

export const Coolify = () => {
  const { data: coolifyData } = useCoolify()

  return (
    <WidgetShell title="Coolify" contentClassName="flex flex-col gap-4">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="applications">
          <AccordionTrigger>Applications</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            {coolifyData.applications.map((app) => (
              <Item variant="outline" key={app.name}>
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
              <Item variant="outline" key={app.name}>
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
    </WidgetShell>
  )
}
