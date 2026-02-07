export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  const paddedSeconds = seconds.toString().padStart(2, '0')

  if (hours > 0) {
    const paddedMinutes = minutes.toString().padStart(2, '0')
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}

export function formatViewCount(count: string): string {
  const num = parseInt(count, 10)
  if (isNaN(num)) return count

  if (num >= 1_000_000) {
    const val = num / 1_000_000
    return val >= 10
      ? `${Math.round(val)}M`
      : `${val.toFixed(1).replace(/\.0$/, '')}M`
  }

  if (num >= 1_000) {
    const val = num / 1_000
    return val >= 10
      ? `${Math.round(val)}K`
      : `${val.toFixed(1).replace(/\.0$/, '')}K`
  }

  return num.toLocaleString()
}
