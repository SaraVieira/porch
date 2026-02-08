import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { generateSalt, hashPassword } from '@/lib/utils'
import { useAppSession } from '@/lib/hooks/useSession'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'
import { Auth } from '@/components/Auth'
import { useMutation } from '@/lib/hooks/useMutation'

const signupFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { password: string; redirectUrl?: string }) => d)
  .handler(async ({ data }) => {
    const found = await db!
      .select()
      .from(userSchema)
      .then((res) => res[0])

    // Create a session
    const session = await useAppSession()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (found?.id) {
      // User already exists — verify password and log them in
      const salt = found.salt ?? 'salt'
      const password = await hashPassword(data.password, salt)

      if (found.password !== password) {
        return {
          error: true,
          userExists: true,
          message: 'User already exists',
        }
      }

      await session.update({
        id: found.id,
      })

      throw redirect({
        href: data.redirectUrl || '/',
      })
    }

    // Create the user with a random salt
    const salt = generateSalt()
    const password = await hashPassword(data.password, salt)

    const user = await db!
      .insert(userSchema)
      .values({
        password,
        salt,
      })
      .returning()
      .then((res) => res[0])

    await session.update({
      id: user.id,
    })

    throw redirect({
      href: data.redirectUrl || '/',
    })
  })

export const Route = createFileRoute('/signup')({
  component: SignupComp,
})

function SignupComp() {
  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
  })

  return (
    <Auth
      actionText="Sign Up"
      status={signupMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        signupMutation.mutate({
          data: {
            password: formData.get('password') as string,
          },
        })
      }}
      afterSubmit={
        signupMutation.data?.error ? (
          <>
            <div className="text-red-400">{signupMutation.data.message}</div>
          </>
        ) : null
      }
    />
  )
}
