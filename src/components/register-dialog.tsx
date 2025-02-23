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
import {
  Form,
  FormControl,
  FormField,
  FormFieldCustom,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { api } from '~/utils/api'
import { Input } from './ui/input'
import { useState } from 'react'
import { toast } from './ui/use-toast'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@radix-ui/react-popover'
import { CommandInput, CommandList, CommandGroup, CommandItem } from 'cmdk'
import { ChevronsUpDown, Command, Check } from 'lucide-react'
import { cn } from '~/lib/utils'
import { handleFileUpload, getImageUrl } from '~/utils/supabase'
import Image from 'next/image'

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

  const { data: provinces } = api.competitor.getProvinces.useQuery()
  const { data: districts } = api.competitor.getDistricts.useQuery(
    form.watch('provinceId') ?? '',
    {
      enabled: !!form.watch('provinceId'),
    },
  )

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    register(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Бүртгүүлэх</Button>
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
            <FormField
              control={form.control}
              name="provinceId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Хот/Аймаг</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-[200px] justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? provinces?.find((p) => p.id === field.value)?.name
                            : 'Хот/Аймаг сонгох'}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Хот/Аймаг сонгох"
                          className="h-9"
                        />
                        <CommandList>
                          <CommandGroup>
                            {provinces?.map((p) => (
                              <CommandItem
                                value={`${p.name} ${p.id}`}
                                key={p.id}
                                onSelect={(currentValue) => {
                                  form.setValue(
                                    'provinceId',
                                    currentValue.split(' ')[1],
                                  )
                                }}
                              >
                                {p.name}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    p.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="districtId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дүүрэг сум</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-[200px] justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? districts?.find((p) => p.id === field.value)?.name
                            : 'Дүүрэг/Сум сонгох'}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Хот/Аймаг сонгох"
                          className="h-9"
                        />
                        <CommandList>
                          <CommandGroup>
                            {districts?.map((p) => (
                              <CommandItem
                                value={`${p.name} ${p.id}`}
                                key={p.id}
                                onSelect={(currentValue) => {
                                  form.setValue(
                                    'districtId',
                                    currentValue.split(' ')[1],
                                  )
                                }}
                              >
                                {p.name}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    p.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="image"
              label="Профайл зураг"
              className="col-span-2"
              render={({ field }) => (
                <div className="grid grid-cols-2 justify-between">
                  <Input
                    type="file"
                    onChange={async (e) => {
                      const { data, error } = await handleFileUpload(
                        e,
                        '/avatar',
                      )

                      if (error) {
                        toast({
                          title: 'Алдаа гарлаа',
                          description: error.message,
                          variant: 'destructive',
                        })
                      } else if (data) {
                        field.onChange(data.path)
                      }
                    }}
                  />
                  {field.value && (
                    <Image
                      src={getImageUrl(field.value)}
                      alt="Зураг"
                      width={150}
                      height={150}
                    />
                  )}
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
