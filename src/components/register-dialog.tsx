import { useForm } from 'react-hook-form'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { getImageUrl, handleFileUpload } from '~/utils/supabase'
import Image from 'next/image'

const defaultValues: z.infer<typeof registerSchema> = {
  firstname: '',
  lastname: '',
  email: '',
  phone: 0,
  birthDate: '',
  password: '',
}

export default function RegisterDialog() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: register } = api.auth.register.useMutation({
    onSuccess: () => {
      toast({
        title: 'Амжилттай бүртгэгдлээ.',
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
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="image"
              label="Зураг"
              description="Иргэний үнэмлэх болон төрсний гэрчилгээний зураг оруулна уу"
              render={({ field }) => (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      setIsLoading(true)
                      const { data, error } = await handleFileUpload(e, 'users')

                      if (data) {
                        field.onChange(data.path)
                      } else if (error) {
                        toast({
                          title: 'Алдаа гарлаа',
                          description: error.message,
                          variant: 'destructive',
                        })
                      }

                      setIsLoading(false)
                    }}
                  />
                  {field.value && (
                    <Image
                      src={getImageUrl(field.value)}
                      alt="Зураг"
                      width={100}
                      height={100}
                    />
                  )}
                </>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            Бүртгүүлэх
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
