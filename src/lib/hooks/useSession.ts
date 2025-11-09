import { useSession } from '@tanstack/react-start/server'
import type { user } from '@/db/schema'

type SessionUser = {
  id: (typeof user.$inferSelect)['id']
}

export function useAppSession() {
  return useSession<SessionUser>({
    password: 'ChangeThisBeforeShippingToProdOrYouWillBeFired',
  })
}
