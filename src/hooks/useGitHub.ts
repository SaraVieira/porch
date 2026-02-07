import { useQuery } from '@tanstack/react-query'
import type { GitHubContributionsData } from '@/lib/types'

const fetchContributions = () =>
  fetch('/api/github').then((r) => r.json()) as Promise<GitHubContributionsData>

export function useGitHub() {
  const { data, isLoading } = useQuery({
    queryKey: ['github', 'contributions'],
    queryFn: fetchContributions,
    staleTime: 30 * 60 * 1000,
  })
  return { data, isLoading }
}
