import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { toast } from '~/components/ui/use-toast'
import { cubeTypes } from '~/server/db/schema'
import { api } from '~/utils/api'
import { handleFileUpload } from '~/utils/supabase'
import { createCubeTypeSchema } from '~/utils/zod'

interface Props {
  current?: typeof cubeTypes.$inferSelect
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  reset: () => void
}

const defaultValues: z.infer<typeof createCubeTypeSchema> = {
  name: '',
}

export default function CubeTypeForm({
  current,
  isOpen,
  setIsOpen,
  reset,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const utils = api.useUtils()
  const { mutate: create, isLoading: createLoading } =
    api.cubeTypes.create.useMutation({
      onSuccess: () => {
        utils.cubeTypes.getAll.invalidate()
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
  const { mutate: update, isLoading: updateLoading } =
    api.cubeTypes.update.useMutation({
      onSuccess: () => {
        utils.cubeTypes.getAll.invalidate()
        toast({
          title: 'Амжилттай шинэчлэгдлээ.',
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

  const form = useForm<z.infer<typeof createCubeTypeSchema>>({
    resolver: zodResolver(createCubeTypeSchema),
    defaultValues,
  })

  const onSubmit = async (values: z.infer<typeof createCubeTypeSchema>) => {
    current ? update({ id: current.id, ...values }) : create(values)
  }

  useEffect(() => {
    form.reset(current || defaultValues)
  }, [form, current])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setIsOpen(true)
            reset()
          }}
        >
          Шооны төрөл
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Төрлийн нэр</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дараалал</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Зураг</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        setIsLoading(true)
                        const { data, error } = await handleFileUpload(
                          e,
                          'cube-types',
                        )

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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createLoading || updateLoading || isLoading}
            >
              Хадгалах
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
