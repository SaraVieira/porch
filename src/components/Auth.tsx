import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Field, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'

export function Auth({
  actionText,
  onSubmit,
  status,
  afterSubmit,
}: {
  actionText: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: 'pending' | 'idle' | 'success' | 'error'
  afterSubmit?: React.ReactNode
}) {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card className="min-w-sm mx-auto shrink-0 ">
        <CardHeader>
          <CardTitle>{actionText}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(e)
            }}
          >
            <FieldGroup>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input type="password" name="password" id="password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={status === 'pending'}>
                  {status === 'pending' ? '...' : actionText}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        {afterSubmit ? afterSubmit : null}
      </Card>
    </div>
  )
}
