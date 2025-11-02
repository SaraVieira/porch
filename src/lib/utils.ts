import { clsx } from 'clsx'
import * as tailwindMerge from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return tailwindMerge.twMerge(clsx(inputs))
}

export const get = (url: string) => fetch(url).then((rsp) => rsp.json())
