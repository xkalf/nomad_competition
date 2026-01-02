import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import CreateButtons, {
  redirectNextCreatePage,
} from '~/components/create-buttons'
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
import { CreateAgeGroupManyInput, createAgeGroupManySchema } from '~/utils/zod'

const DEFAULT_AGE_GROUP: CreateAgeGroupManyInput['data'][number] = {
  name: '',
  cubeTypes: [],
  start: 0,
  end: null,
}

const AGE_GROUP_SUFFIX = ' насны ангилал'

type CubeType = {
  id: number
  name: string
}

interface AgeGroupRowProps {
  index: number
  cubeTypes?: CubeType[]
  onRemove: () => void
  control: ReturnType<typeof useForm<CreateAgeGroupManyInput>>['control']
  onCalculateName: (index: number) => void
}

function AgeGroupRow({
  index,
  cubeTypes = [],
  onRemove,
  control,
  onCalculateName,
}: AgeGroupRowProps) {
  return (
    <div className="flex items-center gap-4">
      <FormField
        control={control}
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
                  onCalculateName(index)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`data.${index}.end`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Дуусах он</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={field.value ?? undefined}
                onChange={(e) => {
                  field.onChange(e.target.valueAsNumber)
                  onCalculateName(index)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
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
      <CubeTypeSelector control={control} index={index} cubeTypes={cubeTypes} />
      <Button variant="destructive" onClick={onRemove}>
        Устгах
      </Button>
    </div>
  )
}

interface CubeTypeSelectorProps {
  control: ReturnType<typeof useForm<CreateAgeGroupManyInput>>['control']
  index: number
  cubeTypes: CubeType[]
}

function CubeTypeSelector({
  control,
  index,
  cubeTypes,
}: CubeTypeSelectorProps) {
  return (
    <FormField
      control={control}
      name={`data.${index}.cubeTypes`}
      render={({ field }) => {
        const selectedCubeTypes = cubeTypes.filter((cubeType) =>
          field.value?.includes(cubeType.id),
        )
        const displayText = selectedCubeTypes
          .map((cubeType) => cubeType.name)
          .join(', ')

        const handleCheckedChange = (cubeTypeId: number, checked: boolean) => {
          const currentValue = field.value ?? []
          if (checked) {
            field.onChange([...currentValue, cubeTypeId])
          } else {
            field.onChange(currentValue.filter((id) => id !== cubeTypeId))
          }
        }

        return (
          <FormItem>
            <FormLabel>Төрөл</FormLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="block">
                  {displayText || 'Төрөл сонгох'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {cubeTypes.map((cubeType) => (
                  <DropdownMenuCheckboxItem
                    key={cubeType.id}
                    checked={field.value?.includes(cubeType.id) ?? false}
                    onCheckedChange={(checked) =>
                      handleCheckedChange(cubeType.id, checked)
                    }
                  >
                    {cubeType.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

function transformAgeGroupsData(
  current: Array<{
    name: string
    cubeTypeId: number
    start: number
    end: number | null
  }>,
): CreateAgeGroupManyInput['data'] {
  const grouped = current.reduce(
    (acc: Record<string, CreateAgeGroupManyInput['data'][number]>, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = {
          name: curr.name,
          start: curr.start,
          end: curr.end ?? null,
          cubeTypes: [],
        }
      }
      acc[curr.name]?.cubeTypes.push(curr.cubeTypeId)
      return acc
    },
    {},
  )

  return Object.values(grouped)
}

function calculateAgeGroupName(start: number, end: number | null): string {
  const currentYear = new Date().getFullYear()
  const startAge = currentYear - start
  const endAge = end ? currentYear - end : null

  if (!endAge) {
    return `${startAge}+${AGE_GROUP_SUFFIX}`
  }

  if (startAge === endAge) {
    return `${startAge}${AGE_GROUP_SUFFIX}`
  }

  return `${endAge} - ${startAge}${AGE_GROUP_SUFFIX}`
}

export default function AgeGroupsForm() {
  const router = useRouter()
  const competitionId = useGetCompetitionId()
  const utils = api.useUtils()

  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  )

  const { data: current } = api.ageGroup.getAll.useQuery(
    {
      competitionId,
    },
    {
      enabled: competitionId > 0,
    },
  )

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
  })

  const transformedData = useMemo(
    () => (current ? transformAgeGroupsData(current) : undefined),
    [current],
  )

  useEffect(() => {
    if (transformedData) {
      form.setValue('data', transformedData)
    }
  }, [transformedData, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'data',
  })

  const handleCalculateName = useCallback(
    (index: number) => {
      const start = form.getValues(`data.${index}.start`)
      const end = form.getValues(`data.${index}.end`) ?? null
      const name = calculateAgeGroupName(start, end)
      form.setValue(`data.${index}.name`, name)
    },
    [form],
  )

  const handleAdd = useCallback(() => {
    append(DEFAULT_AGE_GROUP)
  }, [append])

  const handleSubmit = useCallback(
    (values: CreateAgeGroupManyInput) => {
      mutate({
        ...values,
        competitionId,
      })
    },
    [mutate, competitionId],
  )

  return (
    <Layout>
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">Насны ангилал бүртгэх</h1>
        <Button type="button" onClick={handleAdd}>
          Нэмэх
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <AgeGroupRow
              key={field.id}
              index={index}
              cubeTypes={cubeTypes}
              onRemove={() => remove(index)}
              control={form.control}
              onCalculateName={handleCalculateName}
            />
          ))}
          <CreateButtons
            onSubmit={form.handleSubmit(handleSubmit)}
            isLoading={isLoading}
          />
        </form>
      </Form>
    </Layout>
  )
}
