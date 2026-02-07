import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { hashPassword } from '@/lib/utils'
import { useAppSession } from '@/lib/hooks/useSession'
import { db } from '@/db'
import { user as userSchema } from '@/db/schema'
import { Auth } from '@/components/Auth'
import { useMutation } from '@/lib/hooks/useMutation'

const signupFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { password: string; redirectUrl?: string }) => d)
  .handler(async ({ data }) => {
    // Encrypt the password using Sha256 into plaintext
    const password = await hashPassword(data.password)
    const found = await db!
      .select()
      .from(userSchema)
      .where(eq(userSchema.password, password))
      .then((res) => res[0])

    // Create a session
    const session = await useAppSession()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (found?.id) {
      if (found.password !== password) {
        return {
          error: true,
          userExists: true,
          message: 'User already exists',
        }
      }

      // Store the user's email in the session
      await session.update({
        id: found.id,
      })

      // Redirect to the prev page stored in the "redirect" search param
      throw redirect({
        href: data.redirectUrl || '/',
      })
    }

    // Create the user

    const user = await db!
      .insert(userSchema)
      .values({
        password,
      })
      .returning()
      .then((res) => res[0])

    // Store the user's name in the session
    await session.update({
      id: user.id,
    })

    // Redirect to the prev page stored in the "redirect" search param
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
