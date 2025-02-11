import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '~/utils/api'
import { getImageUrl, handleFileUpload } from '~/utils/supabase'
import { updateProfileSchema } from '~/utils/zod'
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
  FormFieldCustom,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { toast } from './ui/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '~/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export default function UpdateProfile() {
  const { data: me } = api.auth.profile.useQuery()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      ...me,
      wcaId: me?.wcaId ?? undefined,
      image: me?.image ?? undefined,
      provinceId: me?.provinceId ?? undefined,
      districtId: me?.districtId ?? undefined,
    },
  })

  const { data: provinces } = api.competitor.getProvinces.useQuery()
  const { data: districts } = api.competitor.getDistricts.useQuery(
    form.watch('provinceId') ?? '',
    {
      enabled: !!form.watch('provinceId'),
    },
  )

  const [isOpen, setIsOpen] = useState(false)

  const { mutate, isLoading } = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      setIsOpen(false)
      toast({
        title: 'Амжилттаи засагдлаа.',
      })
    },
    onError: (err) => {
      toast({
        title: 'Алдаа гарлаа',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (input: UpdateProfileInput) => {
    mutate(input)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Бүртгэл засах</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Бүртгэл засах</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid grid-cols-2 gap-x-8 gap-y-4 items-center"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormFieldCustom
              control={form.control}
              name="lastname"
              render={({ field }) => <Input {...field} />}
              label="Овог"
            />
            <FormFieldCustom
              control={form.control}
              name="firstname"
              render={({ field }) => <Input {...field} />}
              label="Нэр"
            />
            <FormFieldCustom
              control={form.control}
              name="phone"
              render={({ field }) => <Input {...field} />}
              label="Утас"
            />
            <FormFieldCustom
              control={form.control}
              name="wcaId"
              render={({ field }) => (
                <Input {...field} value={field.value ?? undefined} />
              )}
              label="WCA ID"
            />
            <FormFieldCustom
              control={form.control}
              name="birthDate"
              render={({ field }) => <Input type="date" {...field} />}
              label="Төрсөн өдөр"
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
              {isLoading ? 'Уншиж байна...' : 'Засах'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
