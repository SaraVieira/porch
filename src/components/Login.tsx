import { useRouter } from '@tanstack/react-router'
import { Auth } from './Auth'
import { loginFn } from '@/routes/__authed'
import { useMutation } from '@/lib/hooks/useMutation'

export function Login() {
  const router = useRouter()

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate()
        router.navigate({ to: '/' })
        return
      }
    },
  })

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        loginMutation.mutate({
          data: {
            password: formData.get('password') as string,
          },
        })
      }}
      afterSubmit={
        loginMutation.data ? (
          <div className="text-red-400 text-center">
            {loginMutation.data.message}
          </div>
        ) : null
      }
    />
  )
}
