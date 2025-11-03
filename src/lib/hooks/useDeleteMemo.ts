import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useCallback } from "react"
import { toast } from "sonner"


export async function deleteMemo(id: number): Promise<void> {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete memo')
}

export const useDeleteMemo = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const deleteMemoMutation = useMutation({
    mutationFn: deleteMemo,
    onSuccess: () => {
      router.invalidate()
      queryClient.invalidateQueries()
      toast.success('Memo deleted successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to delete memo: ${error.message}`)
    },
  })

  const handleDeleteMemo = useCallback(({id}: {id: number}) => {
    deleteMemoMutation.mutate(id)
  }, [deleteMemoMutation])

  return { handleDeleteMemo }
}
