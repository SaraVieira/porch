import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { computeStreaks, computeStats } from '../github'
import type { GitHubContributionDay, GitHubContributionWeek } from '../types'

function makeDay(date: string, count: number): GitHubContributionDay {
  return {
    date,
    contributionCount: count,
    contributionLevel: count > 0 ? 'FIRST_QUARTILE' : 'NONE',
    color: count > 0 ? '#0e4429' : '#161b22',
  }
}

describe('computeStreaks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for empty array', () => {
    const result = computeStreaks([])
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
  })

  it('computes current streak from today', () => {
    const days = [
      makeDay('2024-03-15', 5),
      makeDay('2024-03-14', 3),
      makeDay('2024-03-13', 2),
      makeDay('2024-03-12', 0),
    ]
    const result = computeStreaks(days)
    expect(result.currentStreak).toBe(3)
  })

  it('allows today to be 0 if yesterday contributed', () => {
    const days = [
      makeDay('2024-03-15', 0),
      makeDay('2024-03-14', 3),
      makeDay('2024-03-13', 2),
      makeDay('2024-03-12', 0),
    ]
    const result = computeStreaks(days)
    expect(result.currentStreak).toBe(2)
  })

  it('computes longest streak', () => {
    const days = [
      makeDay('2024-03-10', 1),
      makeDay('2024-03-11', 2),
      makeDay('2024-03-12', 3),
      makeDay('2024-03-13', 4),
      makeDay('2024-03-14', 0),
      makeDay('2024-03-15', 1),
    ]
    const result = computeStreaks(days)
    expect(result.longestStreak).toBe(4)
  })

  it('handles single day contribution', () => {
    const days = [makeDay('2024-03-15', 1)]
    const result = computeStreaks(days)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })
})

describe('computeStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes today count', () => {
    const weeks: Array<GitHubContributionWeek> = [
      {
        contributionDays: [
          makeDay('2024-03-15', 7),
          makeDay('2024-03-14', 3),
        ],
      },
    ]
    const result = computeStats(weeks)
    expect(result.todayCount).toBe(7)
  })

  it('computes this week count', () => {
    // March 15, 2024 is a Friday. Week starts Sunday March 10.
    const weeks: Array<GitHubContributionWeek> = [
      {
        contributionDays: [
          makeDay('2024-03-10', 1), // Sunday
          makeDay('2024-03-11', 2), // Monday
          makeDay('2024-03-12', 3), // Tuesday
          makeDay('2024-03-15', 4), // Friday
        ],
      },
    ]
    const result = computeStats(weeks)
    expect(result.thisWeekCount).toBe(10)
  })

  it('computes this month count', () => {
    const weeks: Array<GitHubContributionWeek> = [
      {
        contributionDays: [
          makeDay('2024-03-01', 1),
          makeDay('2024-03-05', 2),
          makeDay('2024-03-15', 3),
          makeDay('2024-02-28', 10), // Previous month — excluded
        ],
      },
    ]
    const result = computeStats(weeks)
    expect(result.thisMonthCount).toBe(6)
  })

  it('returns 0 for empty weeks', () => {
    const result = computeStats([])
    expect(result.todayCount).toBe(0)
    expect(result.thisWeekCount).toBe(0)
    expect(result.thisMonthCount).toBe(0)
  })
})
