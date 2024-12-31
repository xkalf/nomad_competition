import { zodResolver } from '@hookform/resolvers/zod'
import { ColumnDef } from '@tanstack/react-table'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CreateButtons from '~/components/create-buttons'
import CreateLinks from '~/components/create-links'
import DataTable from '~/components/data-table/data-table'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, FormFieldCustom } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from '~/components/ui/use-toast'
import { api, RouterInputs, RouterOutputs } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'
import { displayTime, formatCustomTime } from '~/utils/timeUtils'
import { createResultSchema } from '~/utils/zod'

type Result = RouterOutputs['result']['findByRound'][number]
type Filter = RouterInputs['result']['findByRound']

const columns: ColumnDef<Result>[] = [
  {
    accessorKey: 'order',
    header: '№',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'competitor.verifiedId',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Нэр',
    cell: ({ row }) =>
      `${row.original.competitor?.user.lastname?.[0]}.${row.original.competitor?.user.firstname}`,
  },
  {
    accessorKey: 'average',
    header: 'Дундаж',
    cell: ({ row }) => displayTime(row.original.average),
  },
  {
    accessorKey: 'best',
    header: 'Синглэ',
    cell: ({ row }) => displayTime(row.original.best),
  },
  {
    accessorKey: 'solve1',
    header: 'Эвлүүлэлт 1',
    cell: ({ row }) => displayTime(row.original.solve1),
  },
  {
    accessorKey: 'solve2',
    header: 'Эвлүүлэлт 2',
    cell: ({ row }) => displayTime(row.original.solve2),
  },
  {
    accessorKey: 'solve3',
    header: 'Эвлүүлэлт 3',
    cell: ({ row }) => displayTime(row.original.solve3),
  },
  {
    accessorKey: 'solve4',
    header: 'Эвлүүлэлт 4',
    cell: ({ row }) => displayTime(row.original.solve4),
  },
  {
    accessorKey: 'solve5',
    header: 'Эвлүүлэлт 5',
    cell: ({ row }) => displayTime(row.original.solve5 ?? 0),
  },
]

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      id: Number(context.query.id),
    },
  }
}

export default function ResultsPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const competitionId = useGetCompetitionId()

  const form = useForm<z.infer<typeof createResultSchema>>({
    resolver: zodResolver(createResultSchema.omit({ roundId: true })),
    defaultValues: {
      roundId: id,
      verifiedId: undefined,
      solve1: undefined,
      solve2: undefined,
      solve3: undefined,
      solve4: undefined,
      solve5: undefined,
    },
  })

  const utils = api.useUtils()
  const [filter, setFilter] = useState<Filter>({
    roundId: id,
  })

  useEffect(() => {
    if (router.query.id) {
      setFilter((prev) => ({ ...prev, roundId: Number(router.query.id) }))
    }
  }, [router.query.id])

  useEffect(() => {
    setFilter((curr) => ({
      ...curr,
      verifiedId: isNaN(form.watch('verifiedId'))
        ? undefined
        : form.watch('verifiedId'),
    }))
  }, [form.watch('verifiedId')])

  const { mutate, isLoading } = api.result.create.useMutation({
    onSuccess: () => {
      utils.result.findByRound.invalidate()
      toast({
        title: 'Амжилттай хадгаллаа.',
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
  const { mutate: generate, isLoading: generateLoading } =
    api.result.generate.useMutation({
      onSuccess: () => {
        utils.result.findByRound.invalidate()
        toast({
          title: 'Амжилттай хадгаллаа.',
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

  const { data } = api.result.findByRound.useQuery(filter, {
    queryKey: ['result.findByRound', filter],
    enabled: !!filter.roundId,
  })
  const { data: rounds } = api.round.getAll.useQuery(
    {
      competitionId,
      id: filter.roundId,
    },
    {
      enabled: !!competitionId && !!filter.roundId,
    },
  )
  const { data: ageGroups } = api.ageGroup.getAll.useQuery(
    {
      competitionId: competitionId,
      cubeTypeId: rounds?.[0]?.cubeTypeId,
    },
    {
      enabled: !!competitionId && !!rounds?.[0]?.cubeTypeId,
    },
  )
  const { data: schools } = api.competitor.getSchools.useQuery()
  const { data: round } = api.round.getAll.useQuery(
    {
      competitionId: competitionId,
      id: filter.roundId,
    },
    {
      enabled: !!competitionId && !!filter.roundId,
    },
  )

  const onSubmit = (input: z.infer<typeof createResultSchema>) => {
    mutate({
      ...input,
      roundId: filter.roundId,
    })
  }

  return (
    <Layout>
      <CreateLinks />
      <div className="flex gap-4">
        <h1 className="text-3xl text-bold">
          Үзүүлэлт шивэх ({round?.[0]?.cubeType.name} : {round?.[0]?.name})
        </h1>
        <Button
          type="button"
          disabled={generateLoading}
          onClick={() => generate(filter.roundId)}
        >
          Групп-ийн хуваарилалт
        </Button>
      </div>
      <div className="grid grid-cols-12 gap-x-4">
        <div className="col-span-4">
          <Form {...form}>
            <FormFieldCustom
              control={form.control}
              name="verifiedId"
              label="Тамирчны ID"
              render={({ field }) => (
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="solve1"
              label="Эвлүүлэлт 1"
              render={({ field }) => (
                <div className="flex gap-4 items-center">
                  <Input
                    onChange={(e) => {
                      field.onChange(formatCustomTime(e.target.value))
                    }}
                  />
                  <span>{displayTime(field.value)}</span>
                </div>
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="solve2"
              label="Эвлүүлэлт 2"
              render={({ field }) => (
                <div className="flex gap-4 items-center">
                  <Input
                    onChange={(e) => {
                      field.onChange(formatCustomTime(e.target.value))
                    }}
                  />
                  <span>{displayTime(field.value)}</span>
                </div>
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="solve3"
              label="Эвлүүлэлт 3"
              render={({ field }) => (
                <div className="flex gap-4 items-center">
                  <Input
                    onChange={(e) => {
                      field.onChange(formatCustomTime(e.target.value))
                    }}
                  />
                  <span>{displayTime(field.value)}</span>
                </div>
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="solve4"
              label="Эвлүүлэлт 4"
              render={({ field }) => (
                <div className="flex gap-4 items-center">
                  <Input
                    onChange={(e) => {
                      field.onChange(formatCustomTime(e.target.value))
                    }}
                  />
                  <span>{displayTime(field.value)}</span>
                </div>
              )}
            />
            <FormFieldCustom
              control={form.control}
              name="solve5"
              label="Эвлүүлэлт 5"
              render={({ field }) => (
                <div className="flex gap-4 items-center">
                  <Input
                    onChange={(e) => {
                      field.onChange(formatCustomTime(e.target.value))
                    }}
                  />
                  <span>{displayTime(field.value)}</span>
                </div>
              )}
            />
            <CreateButtons
              isLoading={isLoading}
              onSubmit={form.handleSubmit(onSubmit)}
            />
          </Form>
        </div>
        <div className="col-span-8">
          <div className="flex gap-4">
            <Select
              onValueChange={(value) =>
                setFilter((curr) => ({
                  ...curr,
                  ageGroupId: Number(value),
                }))
              }
              value={filter.ageGroupId?.toString() ?? ''}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Насны ангилал" />
              </SelectTrigger>
              <SelectContent>
                {ageGroups?.map((a) => (
                  <SelectItem value={a.id.toString()} key={`age-${a.id}`}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.province}
              onValueChange={(value) => {
                setFilter((curr) => ({ ...curr, province: value }))
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Хот/Аймаг сонгох" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(schools?.map((i) => i.province))).map(
                  (i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Select
              value={filter.district}
              onValueChange={(value) =>
                setFilter((curr) => ({ ...curr, district: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Дүүрэг/Сум сонгох" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set(
                    schools
                      ?.filter((i) => i.province === filter.province)
                      .map((i) => i.district),
                  ),
                ).map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.school}
              onValueChange={(value) =>
                setFilter((curr) => ({ ...curr, school: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сургууль сонгох" />
              </SelectTrigger>
              <SelectContent>
                {schools
                  ?.filter((i) => i.district === filter.district)
                  .map((i) => (
                    <SelectItem key={i.school} value={i.school}>
                      {i.school}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Label htmlFor="isOther">Бусад эсэх</Label>
              <Checkbox
                checked={filter.isOther}
                onCheckedChange={(value) =>
                  setFilter((curr) => ({ ...curr, isOther: !!value }))
                }
                id="isOther"
              />
            </div>
          </div>
          <DataTable className="mt-4" columns={columns} data={data ?? []} />
        </div>
      </div>
    </Layout>
  )
}
