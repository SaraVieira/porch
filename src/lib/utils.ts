import { clsx } from 'clsx'
import * as tailwindMerge from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return tailwindMerge.twMerge(clsx(inputs))
}

export const get = (url: string) => fetch(url).then((rsp) => rsp.json())
export const deleteMethod = (url: string) =>
  fetch(url, { method: 'DELETE' }).then((rsp) => rsp.json())
export const post = (url: string, body: unknown) =>
  fetch(url, { method: 'POST', body: JSON.stringify(body) }).then((rsp) =>
    rsp.json(),
  )
export const put = (url: string, body: unknown) =>
  fetch(url, { method: 'PUT', body: JSON.stringify(body) }).then((rsp) =>
    rsp.json(),
  )

export function getCountryCode(language: string): string {
  switch (language.toLowerCase()) {
    case 'english':
      return 'gb'
    case 'español':
      return 'es'
    case 'french':
      return 'fr'
    case 'german':
      return 'de'
    case 'polski':
      return 'pl'
    case 'português':
      return 'pt'
    case 'dutch':
      return 'nl'
    // Add more as needed
    default:
      return 'us'
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}