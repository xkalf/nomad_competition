import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import CreateButtons, {
  redirectNextCreatePage,
} from '~/components/create-buttons'
import CreateLinks from '~/components/create-links'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
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
import { api } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'
import { CreateRoundManyInput, createRoundManySchema } from '~/utils/zod'

export default function RoundsForm() {
  const router = useRouter()
  const competitionId = useGetCompetitionId()

  const { data: current } = api.round.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  )
  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  )
  const { mutate, isLoading } = api.round.createMany.useMutation({
    onSuccess: () => {
      redirectNextCreatePage(router)
      toast({
        title: 'Амжилттаи бүртгэгдлээ.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Алдаа гарлаа',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const form = useForm<CreateRoundManyInput>({
    resolver: zodResolver(
      createRoundManySchema.omit({
        competitionId: true,
      }),
    ),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'data',
  })

  useEffect(() => {
    if (current) {
      const newData = current.reduce(
        (base: Record<string, CreateRoundManyInput['data'][number]>, curr) => {
          if (!base[curr.name]) {
            base[curr.name] = {
              ...curr,
              cubeTypes: [],
            }
          }

          base[curr.name]?.cubeTypes.push(curr.cubeTypeId)

          return base
        },
        {},
      )

      form.setValue('data', Object.values(newData))
    }
  }, [current])

  const onSubmit = (input: CreateRoundManyInput) => {
    mutate({
      ...input,
      competitionId,
    })
  }

  return (
    <Layout>
      <CreateLinks />
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">Раунд бүртгэх</h1>
        <Button
          type="button"
          onClick={() =>
            append({
              name: '',
              cubeTypes: [],
              nextCompetitor: 0,
              perGroupCount: 20,
            })
          }
        >
          Нэмэх
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => (
            <div className="flex items-center gap-4" key={field.id}>
              <FormField
                control={form.control}
                name={`data.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нэр</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`data.${index}.cubeTypes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Шооны төрөл</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="block">
                          {field.value
                            ? cubeTypes
                                ?.filter((cubeType) =>
                                  field.value.includes(cubeType.id),
                                )
                                .map((cubeType) => cubeType.name)
                                .join(', ')
                            : 'Төрөл сонгох'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {cubeTypes?.map((cubeType) => (
                          <DropdownMenuCheckboxItem
                            key={cubeType.id}
                            checked={field.value?.includes(cubeType.id)}
                            onCheckedChange={(value) => {
                              if (!field.value) {
                                field.value = []
                              }

                              if (value && !field.value.includes(cubeType.id)) {
                                field.onChange([...field.value, cubeType.id])
                              } else if (
                                !value &&
                                field.value.includes(cubeType.id)
                              ) {
                                field.onChange(
                                  field.value.filter(
                                    (id) => id !== cubeType.id,
                                  ),
                                )
                              }
                            }}
                          >
                            {cubeType.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`data.${index}.nextCompetitor`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дараагийн раундэд үлдэх тамирчин</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? undefined}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`data.${index}.perGroupCount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Группын тоо</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? undefined}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant={'destructive'} onClick={() => remove(index)}>
                Устгах
              </Button>
            </div>
          ))}
        </form>
        <CreateButtons
          isLoading={isLoading}
          onSubmit={form.handleSubmit(onSubmit)}
        />
      </Form>
    </Layout>
  )
}
