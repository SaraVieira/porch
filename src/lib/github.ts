import type {
  GitHubContributionDay,
  GitHubContributionsData,
  GitHubContributionWeek,
} from './types'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

let cachedData: GitHubContributionsData | null = null
let cacheTimestamp = 0
let fetchInProgress: Promise<GitHubContributionsData | null> | null = null

const CONTRIBUTION_COLORS: Record<string, string> = {
  NONE: '#161b22',
  FIRST_QUARTILE: '#0e4429',
  SECOND_QUARTILE: '#006d32',
  THIRD_QUARTILE: '#26a641',
  FOURTH_QUARTILE: '#39d353',
}

const query = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
            color
          }
        }
      }
    }
  }
}
`

export function computeStreaks(days: Array<GitHubContributionDay>): {
  currentStreak: number
  longestStreak: number
} {
  let currentStreak = 0
  let longestStreak = 0
  let streak = 0

  // For current streak, walk backwards from today
  const today = new Date().toISOString().split('T')[0]
  const sortedDays = [...days].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  for (const day of sortedDays) {
    // Skip future days
    if (day.date > today) continue
    if (day.contributionCount > 0) {
      currentStreak++
    } else {
      // Allow today to be 0 if the streak was going yesterday
      if (day.date === today) continue
      break
    }
  }

  // For longest streak, scan forward through all days
  const chronological = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  for (const day of chronological) {
    if (day.contributionCount > 0) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 0
    }
  }

  return { currentStreak, longestStreak }
}

export function computeStats(weeks: Array<GitHubContributionWeek>): {
  todayCount: number
  thisWeekCount: number
  thisMonthCount: number
} {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Get the start of the current week (Sunday)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const weekStart = startOfWeek.toISOString().split('T')[0]

  let todayCount = 0
  let thisWeekCount = 0
  let thisMonthCount = 0

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.date === today) {
        todayCount = day.contributionCount
      }
      if (day.date >= weekStart) {
        thisWeekCount += day.contributionCount
      }
      const d = new Date(day.date)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        thisMonthCount += day.contributionCount
      }
    }
  }

  return { todayCount, thisWeekCount, thisMonthCount }
}

async function fetchContributions(): Promise<GitHubContributionsData | null> {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME

  if (!token || !username) {
    return null
  }

  const response = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { username } }),
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const json = await response.json()
  const calendar = json.data.user.contributionsCollection.contributionCalendar

  const weeks: Array<GitHubContributionWeek> = calendar.weeks.map(
    (week: any) => ({
      contributionDays: week.contributionDays.map((day: any) => ({
        date: day.date,
        contributionCount: day.contributionCount,
        contributionLevel: day.contributionLevel,
        color: CONTRIBUTION_COLORS[day.contributionLevel] || day.color,
      })),
    }),
  )

  const allDays = weeks.flatMap((w) => w.contributionDays)
  const { currentStreak, longestStreak } = computeStreaks(allDays)
  const { todayCount, thisWeekCount, thisMonthCount } = computeStats(weeks)

  return {
    totalContributions: calendar.totalContributions,
    weeks,
    currentStreak,
    longestStreak,
    todayCount,
    thisWeekCount,
    thisMonthCount,
  }
}

export async function getGitHubContributions(): Promise<GitHubContributionsData | null> {
  const now = Date.now()

  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return cachedData
  }

  if (fetchInProgress) {
    return fetchInProgress
  }

  fetchInProgress = fetchContributions()
    .then((data) => {
      cachedData = data
      cacheTimestamp = Date.now()
      fetchInProgress = null
      return data
    })
    .catch((error) => {
      fetchInProgress = null
      if (cachedData) return cachedData
      throw error
    })

  return fetchInProgress
}
