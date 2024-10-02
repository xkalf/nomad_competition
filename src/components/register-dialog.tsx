import { useForm } from 'react-hook-form'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { z } from 'zod'
import { registerSchema } from '~/utils/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormFieldCustom } from './ui/form'
import { api } from '~/utils/api'
import { Input } from './ui/input'
import { useState } from 'react'
import { toast } from './ui/use-toast'
import { Switch } from './ui/switch'
import { Label } from './ui/label'

const defaultValues: z.infer<typeof registerSchema> = {
  firstname: '',
  lastname: '',
  email: '',
  phone: 0,
  birthDate: '',
  password: '',
  isMale: true,
}

export default function RegisterDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: register, isLoading } = api.auth.register.useMutation({
    onSuccess: () => {
      toast({
        title: 'Амжилттай бүртгэгдлээ.',
        description:
          'Имэйл хаяг баталгаажуулах хугацаа 20 минут. Та амжиж баталгаажуулна уу.',
      })
      setIsOpen(false)
    },
    onError: (error) => {
      toast({
        title: 'Алдаа гарлаа',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  })

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    register(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Бүртгүүлэх</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Бүртгүүлэх</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-x-8 gap-y-4"
          >
            <FormFieldCustom
              control={form.control}
              name="email"
              label="Мэйл хаяг"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="password"
              label="Нууц үг"
              render={({ field }) => <Input type="password" {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="lastname"
              label="Овог"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="firstname"
              label="Нэр"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="wcaId"
              label="WCA ID"
              render={({ field }) => (
                <Input value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="phone"
              label="Утасны дугаар"
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="birthDate"
              label="Төрсөн өдөр"
              render={({ field }) => <Input type="date" {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="isMale"
              label="Хүйс"
              render={({ field }) => (
                <div className="flex gap-2 items-center">
                  <Label>Эмэгтэй</Label>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label>Эрэгтэй</Label>
                </div>
              )}
            />
            <Button
              type="submit"
              className="col-span-2"
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isLoading ? 'Уншиж байна...' : 'Бүртгүүлэх'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
