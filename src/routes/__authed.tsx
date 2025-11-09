import { eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'
import { hashPassword } from '@/lib/utils'
import { useAppSession } from '@/lib/hooks/useSession'
import { Login } from '@/components/Login'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const hashedPassword = await hashPassword(data.password)
    const user = await db!
      .select()
      .from(userSchema)
      .where(eq(userSchema.password, hashedPassword))
      .then((res) => res[0])

    // Check if the user exists
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!user?.id) {
      return {
        error: true,
        userNotFound: true,
        message: 'User not found',
      }
    }

    if (user.password !== hashedPassword) {
      return {
        error: true,
        message: 'Incorrect password',
      }
    }

    // Create a session
    const session = await useAppSession()

    // Store the user's email in the session
    await session.update({
      id: user.id,
    })
  })

export const Route = createFileRoute('/__authed')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <Login />
    }

    throw error
  },
})
