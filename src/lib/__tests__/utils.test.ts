import { describe, it, expect } from 'vitest'
import { formatBytes, getCountryCode, formatDate } from '../utils'

describe('formatBytes', () => {
  it('returns "0 Bytes" for 0', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('formats bytes correctly', () => {
    expect(formatBytes(500)).toBe('500 Bytes')
  })

  it('formats KiB', () => {
    expect(formatBytes(1024)).toBe('1 KiB')
  })

  it('formats MiB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MiB')
  })

  it('formats GiB', () => {
    expect(formatBytes(1024 ** 3)).toBe('1 GiB')
  })

  it('respects decimal places', () => {
    expect(formatBytes(1536, 1)).toBe('1.5 KiB')
  })

  it('handles negative decimals as 0', () => {
    expect(formatBytes(1536, -1)).toBe('2 KiB')
  })
})

describe('getCountryCode', () => {
  it('returns gb for english', () => {
    expect(getCountryCode('english')).toBe('gb')
    expect(getCountryCode('English')).toBe('gb')
  })

  it('returns es for español', () => {
    expect(getCountryCode('Español')).toBe('es')
  })

  it('returns fr for french', () => {
    expect(getCountryCode('French')).toBe('fr')
  })

  it('returns de for german', () => {
    expect(getCountryCode('German')).toBe('de')
  })

  it('returns pl for polski', () => {
    expect(getCountryCode('Polski')).toBe('pl')
  })

  it('returns pt for português', () => {
    expect(getCountryCode('Português')).toBe('pt')
  })

  it('returns nl for dutch', () => {
    expect(getCountryCode('Dutch')).toBe('nl')
  })

  it('defaults to us for unknown', () => {
    expect(getCountryCode('klingon')).toBe('us')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-03-15')
    expect(result).toContain('15')
    expect(result).toContain('3')
    expect(result).toContain('2024')
  })

  it('includes time when requested', () => {
    const result = formatDate('2024-03-15T14:30:00', true)
    expect(result).toContain('14')
    expect(result).toContain('30')
  })

  it('handles Date objects', () => {
    const result = formatDate(new Date(2024, 2, 15))
    expect(result).toContain('15')
    expect(result).toContain('3')
    expect(result).toContain('2024')
  })

  it('handles timestamps', () => {
    const result = formatDate(new Date(2024, 0, 1).getTime())
    expect(result).toContain('1')
    expect(result).toContain('2024')
  })
})
