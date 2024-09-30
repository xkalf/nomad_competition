import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from './ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { api } from '~/utils/api'

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default function LoginDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  const { mutate: sendPasswordResetEmail } =
    api.auth.sendPasswordResetEmail.useMutation({
      onError: (err) => {
        setError(err.message)
      },
      onSuccess: () => {
        toast({
          title: '',
        })
      },
    })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const res = await signIn('credentials', {
      redirect: false,
      ...values,
    })

    if (res?.ok) {
      toast({
        title: 'Амжилттай нэвтэрлээ.',
      })
      setIsOpen(false)
      return
    }

    setError(res?.error ?? '')
  }

  const onPasswordResetClick = () => {
    const email = form.getValues('email')

    const parsed = z.string().email().safeParse(email)
    if (parsed.success) {
      sendPasswordResetEmail(parsed.data)
    } else {
      setError('Имэйл хаяг оруулна уу.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Нэвтрэх</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Нэвтрэх</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Мэйл хаяг</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нууц үг</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <Button
                type="button"
                onClick={async () => {
                  await signIn('wca')
                }}
              >
                WCA
              </Button>
              <Button
                variant={'link'}
                className="block text-gray-500 px-0"
                type="button"
                onClick={() => onPasswordResetClick()}
              >
                Нууц үг сэргээх
              </Button>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                Нэвтрэх
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
