import { zodResolver } from '@hookform/resolvers/zod'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CreateButtons from '~/components/create-buttons'
import CreateLinks from '~/components/create-links'
import DataTable from '~/components/data-table/data-table'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import { Form, FormFieldCustom } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from '~/components/ui/use-toast'
import { api, RouterInputs, RouterOutputs } from '~/utils/api'
import { displayTime, formatCustomTime } from '~/utils/timeUtils'
import { createResultSchema } from '~/utils/zod'

type Result = RouterOutputs['result']['findByRound'][number]
type Filter = RouterInputs['result']['findByRound']

const columns: ColumnDef<Result>[] = [
  {
    accessorKey: 'competitor.verifiedId',
    header: 'ID',
  },
  {
    accessorKey: 'competitor.firstname',
    header: 'Нэр',
    cell: ({ row }) =>
      `${row.original.competitor.user.lastname[0]}.${row.original.competitor.user.firstname}`,
  },
  {
    accessorKey: 'average',
    header: 'Дундаж',
    cell: ({ row }) => displayTime(row.original.average ?? 0),
  },
  {
    accessorKey: 'best',
    header: 'Синглэ',
    cell: ({ row }) => displayTime(row.original.best ?? 0),
  },
  {
    accessorKey: 'solve1',
    header: 'Эвлүүлэлт 1',
    cell: ({ row }) => displayTime(row.original.solve1 ?? 0),
  },
  {
    accessorKey: 'solve2',
    header: 'Эвлүүлэлт 2',
    cell: ({ row }) => displayTime(row.original.solve2 ?? 0),
  },
  {
    accessorKey: 'solve3',
    header: 'Эвлүүлэлт 3',
    cell: ({ row }) => displayTime(row.original.solve3 ?? 0),
  },
  {
    accessorKey: 'solve4',
    header: 'Эвлүүлэлт 4',
    cell: ({ row }) => displayTime(row.original.solve4 ?? 0),
  },
  {
    accessorKey: 'solve5',
    header: 'Эвлүүлэлт 5',
    cell: ({ row }) => displayTime(row.original.solve5 ?? 0),
  },
]

export default function ResultsPage() {
  const router = useRouter()

  const utils = api.useUtils()
  const [filter, setFilter] = useState<Filter>({
    roundId: 0,
  })

  useEffect(() => {
    if (router.query.id) {
      setFilter((prev) => ({ ...prev, roundId: Number(router.query.id) }))
    }
  }, [router.query.id])

  const form = useForm<z.infer<typeof createResultSchema>>({
    resolver: zodResolver(createResultSchema.omit({ roundId: true })),
  })

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

  const { data: ageGroups } = api.ageGroup.getAll.useQuery(
    {
      competitionId: data?.[0]?.competitionId ?? 0,
      cubeTypeId: data?.[0]?.cubeTypeId ?? 0,
    },
    {
      enabled: !!data?.[0]?.competitionId && !!data?.[0]?.cubeTypeId,
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
        <h1 className="text-3xl text-bold">Үзүүлэлт шивэх</h1>
        <Button
          type="button"
          disabled={generateLoading}
          onClick={() => generate(filter.roundId)}
        >
          Групп-ийн хуваарьлалт
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
                  <span>{displayTime(field.value ?? 0)}</span>
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
                  <span>{displayTime(field.value ?? 0)}</span>
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
                  <span>{displayTime(field.value ?? 0)}</span>
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
                  <span>{displayTime(field.value ?? 0)}</span>
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
                  <span>{displayTime(field.value ?? 0)}</span>
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
          </div>
          <DataTable columns={columns} data={data ?? []} />
        </div>
      </div>
    </Layout>
  )
}
