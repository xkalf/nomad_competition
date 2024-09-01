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
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { CreateRoundManyInput, createRoundManySchema } from '~/utils/zod'

export default function RoundsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const competitionId = +(searchParams.get('competitionId') || '0')

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
    defaultValues: {
      competitionId,
      data: current,
    },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'data',
  })

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
              cubeTypeId: 0,
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
                name={`data.${index}.cubeTypeId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Шооны төрөл</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="block">
                          {field.value
                            ? cubeTypes?.find(
                                (cubeType) => cubeType.id === field.value,
                              )?.name
                            : 'Төрөл сонгох'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(+value)}
                        >
                          {cubeTypes?.map((cubeType) => (
                            <DropdownMenuRadioItem
                              value={cubeType.id.toString()}
                            >
                              {cubeType.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
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
