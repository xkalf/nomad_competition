import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
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
import { CreateAgeGroupManyInput, createAgeGroupManySchema } from '~/utils/zod'

export default function AgeGroupsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const competitionId = +(searchParams.get('competitionId') || '0')
  const utils = api.useUtils()

  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  )

  const { data: current } = api.ageGroup.getAll.useQuery(competitionId, {
    enabled: competitionId > 0,
  })

  const { mutate, isLoading } = api.ageGroup.createMany.useMutation({
    onSuccess: () => {
      utils.ageGroup.getAll.invalidate()
      redirectNextCreatePage(router)
      toast({
        title: 'Амжилттай бүртгэгдлээ.',
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

  const form = useForm<CreateAgeGroupManyInput>({
    resolver: zodResolver(
      createAgeGroupManySchema.omit({
        competitionId: true,
      }),
    ),
    defaultValues: {
      competitionId: competitionId,
      data: Object.values(
        current?.reduce(
          (
            base: Record<string, CreateAgeGroupManyInput['data'][number]>,
            curr,
          ) => {
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
        ) ?? {},
      ),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'data',
  })

  const onSubmit = (values: CreateAgeGroupManyInput) => {
    mutate({
      ...values,
      competitionId,
    })
  }

  const calculateName = (index: number) => {
    const start = form.getValues(`data.${index}.start`)
    const end = form.getValues(`data.${index}.end`)
    const nowYear = new Date().getFullYear()
    const startAge = nowYear - start
    const endAge = nowYear - (end ?? 0)

    const text = `${!end ? `${startAge}+` : startAge === endAge ? startAge : `${endAge} - ${startAge}`} насны ангилал`

    form.setValue(`data.${index}.name`, text)
  }

  return (
    <Layout>
      <CreateLinks />
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">Насны ангилал бүртгэх</h1>
        <Button
          type="button"
          onClick={() =>
            append({
              name: '',
              cubeTypes: [],
              start: 0,
              end: 0,
            })
          }
        >
          Нэмэх
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div className="flex items-center gap-4" key={field.id}>
              <FormField
                control={form.control}
                name={`data.${index}.start`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Эхлэх он</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber)
                          calculateName(index)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`data.${index}.end`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дуусах он</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || undefined}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber)
                          calculateName(index)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>Төрөл</FormLabel>
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
                      <DropdownMenuContent>
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
              <Button variant={'destructive'} onClick={() => remove(index)}>
                Устгах
              </Button>
            </div>
          ))}
          <CreateButtons
            onSubmit={form.handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </form>
      </Form>
    </Layout>
  )
}
