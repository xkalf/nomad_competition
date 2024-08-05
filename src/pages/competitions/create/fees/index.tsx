import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { CreateFeeManyInput, createFeeManySchema } from '~/utils/zod'

export default function FeesForm() {
  const searchParams = useSearchParams()
  const competitionId = +(searchParams.get('competitionId') || '0')

  const { data: current } = api.fee.getByCompetitionId.useQuery(competitionId, {
    enabled: competitionId > 0,
  })
  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  )

  const { mutate, isLoading } = api.fee.createMany.useMutation({
    onSuccess: () => {
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

  const form = useForm<CreateFeeManyInput>({
    resolver: zodResolver(createFeeManySchema.omit({ competitionId: true })),
    defaultValues: {
      data:
        current ??
        cubeTypes?.map((i) => ({
          amount: '0',
          cubeTypeId: i.id,
        })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'data',
  })

  const onSubmit = (input: CreateFeeManyInput) => {
    mutate({
      ...input,
      competitionId,
    })
  }

  return (
    <Layout>
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">Төлбөриин бүртгэл</h1>
        <Button
          type="button"
          onClick={() =>
            append({
              amount: '0',
              cubeTypeId: 0,
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
                name={`data.${index}.cubeTypeId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Шооны төрөл</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="block">Төрөл сонгох</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {cubeTypes?.map((cubeType) => (
                          <DropdownMenuCheckboxItem
                            checked={field.value === cubeType.id}
                            onCheckedChange={(checked) =>
                              checked
                                ? field.onChange(cubeType.id)
                                : field.onChange(0)
                            }
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
                name={`data.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Үнийн дүн</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="button" onClick={() => remove(index)}>
                Устгах
              </Button>
            </div>
          ))}
        </form>
        <div className="space-x-2">
          <Button type="button" variant={'outline'} asChild>
            <Link
              href={{
                pathname: '/competitions/create/round',
                query: {
                  competitionId,
                },
              }}
            >
              Буцах
            </Link>
          </Button>
          {/* <Button type="button" variant={"secondary"} asChild> */}
          {/*   <Link */}
          {/*     href={{ */}
          {/*       pathname: "/competitions/create/fees", */}
          {/*       query: { */}
          {/*         competitionId, */}
          {/*       }, */}
          {/*     }} */}
          {/*   > */}
          {/*     Дараах */}
          {/*   </Link> */}
          {/* </Button> */}
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            Хадгалах
          </Button>
        </div>
      </Form>
    </Layout>
  )
}
