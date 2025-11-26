import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '~/utils/api'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { toast } from './ui/use-toast'

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
          title: 'Нууц үг сэргээх имэйл илгээгдлээ.',
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
            <div className="">
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
                  variant={'link'}
                  className="block text-gray-500 px-0"
                  type="button"
                  onClick={() => onPasswordResetClick()}
                >
                  Нууц үг сэргээх
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={'outline'}
                  type="button"
                  className="flex justify-center items-center p-4"
                  onClick={async () => {
                    await signIn('wca')
                  }}
                >
                  <Image
                    src="/wca-logo.svg"
                    alt="WCA Logo"
                    width={30}
                    height={30}
                  />
                </Button>
              </div>
              <Button
                type="submit"
                className="mt-4"
                onClick={form.handleSubmit(onSubmit)}
              >
                Нэвтрэх
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
