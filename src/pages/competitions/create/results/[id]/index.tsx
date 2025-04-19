import { zodResolver } from '@hookform/resolvers/zod'
import { ColumnDef } from '@tanstack/react-table'
import { Check, ChevronsUpDown } from 'lucide-react'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CreateButtons from '~/components/create-buttons'
import DataTable from '~/components/data-table/data-table'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from '~/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormFieldCustom,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from '~/components/ui/use-toast'
import { cn } from '~/lib/utils'
import { RouterInputs, RouterOutputs, api } from '~/utils/api'
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
    cell: ({ row }) => (
      <span className="text-green-500">
        {displayTime(row.original.average)}
      </span>
    ),
  },
  {
    accessorKey: 'best',
    header: 'Синглэ',
    cell: ({ row }) => (
      <span className="text-green-500">{displayTime(row.original.best)}</span>
    ),
  },
  {
    accessorKey: 'solve1',
    header: '1',
    cell: ({ row }) => displayTime(row.original.solve1),
  },
  {
    accessorKey: 'solve2',
    header: '2',
    cell: ({ row }) => displayTime(row.original.solve2),
  },
  {
    accessorKey: 'solve3',
    header: '3',
    cell: ({ row }) => displayTime(row.original.solve3),
  },
  {
    accessorKey: 'solve4',
    header: '4',
    cell: ({ row }) => displayTime(row.original.solve4),
  },
  {
    accessorKey: 'solve5',
    header: '5',
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
  const [isMainMedal, setIsMainMedal] = useState(false)
  const [isAgeGroupMedal, setIsAgeGroupMedal] = useState(false)
  const [nextRoundId, setNextRoundId] = useState(0)

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
      form.reset({
        roundId: id,
        verifiedId: undefined,
        solve1: undefined,
        solve2: undefined,
        solve3: undefined,
        solve4: undefined,
        solve5: undefined,
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
  const { mutate: lock, isLoading: lockLoading } = api.round.lock.useMutation({
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
      competitionId: competitionId,
    },
    {
      enabled: !!competitionId,
    },
  )
  const { data: competitors } = api.competitor.getByCompetitionId.useQuery({
    competitionId: competitionId,
  })

  const round = useMemo(() => {
    return rounds?.find((round) => round.id === filter.roundId)
  }, [rounds, filter.roundId])
  const { data: ageGroups } = api.ageGroup.getAll.useQuery(
    {
      competitionId: competitionId,
      cubeTypeId: round?.cubeTypeId,
    },
    {
      enabled: !!competitionId && !!round?.cubeTypeId,
    },
  )

  const { data: provinces } = api.competitor.getProvinces.useQuery()
  const { data: districts } = api.competitor.getDistricts.useQuery(
    filter.provinceId ?? '',
    {
      enabled: !!filter.provinceId,
    },
  )
  const { data: schools } = api.competitor.getSchools.useQuery(
    filter.districtId ?? '',
    {
      enabled: !!filter.districtId,
    },
  )

  const onSubmit = (input: z.infer<typeof createResultSchema>) => {
    mutate({
      ...input,
      roundId: filter.roundId,
    })
  }

  const getUser = useCallback(
    (verifiedId?: number) => {
      if (!verifiedId) return 'Тамирчин сонгох'
      const user = competitors?.find((c) => c.id === verifiedId)?.user

      return user ? `${user.lastname} ${user.firstname}` : 'Тамирчин сонгох'
    },
    [competitors],
  )

  return (
    <Layout>
      <div className="flex gap-4">
        <h1 className="text-3xl text-bold">
          Үзүүлэлт шивэх ({round?.cubeType.name} : {round?.name})
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
            <FormField
              control={form.control}
              name="verifiedId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Тамирчин сонгох</FormLabel>
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
                          {getUser(field.value)}
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
                            {competitors?.map((c) => (
                              <CommandItem
                                value={`${c.verifiedId} ${c.user.lastname} ${c.user.firstname}`}
                                key={c.id + 'combobox'}
                                onSelect={(currentValue) => {
                                  const value = currentValue.split(' ')[0]
                                  form.setValue(
                                    'verifiedId',
                                    value ? +value : 0,
                                  )
                                }}
                              >
                                {c.user.lastname} {c.user.firstname}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    c.verifiedId === field.value
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
              name="verifiedId"
              label="Тамирчны ID"
              render={({ field }) => (
                <Input
                  type="number"
                  value={field.value ?? ''}
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
                    value={field.value ?? ''}
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
                    value={field.value ?? ''}
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
                    value={field.value ?? ''}
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
                    value={field.value ?? ''}
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
                    value={field.value ?? ''}
                  />
                  <span>{displayTime(field.value)}</span>
                </div>
              )}
            />
            <CreateButtons
              isLoading={isLoading}
              onSubmit={form.handleSubmit(onSubmit)}
            />
            <div className="flex mt-2 gap-2">
              <Button
                type="button"
                disabled={lockLoading}
                onClick={() => {
                  lock({
                    roundId: filter.roundId,
                    isMainMedal,
                    isAgeGroupMedal,
                    nextRoundId,
                  })
                }}
              >
                Түгжих
              </Button>
              <Select
                value={nextRoundId.toString()}
                onValueChange={(value) => setNextRoundId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Дараагийн Раунд" />
                </SelectTrigger>
                <SelectContent>
                  {rounds
                    ?.filter(
                      (r) =>
                        r.id !== filter.roundId &&
                        r.cubeTypeId === round?.cubeTypeId,
                    )
                    .map((r) => (
                      <SelectItem
                        key={'rounds-' + r.id}
                        value={r.id.toString()}
                      >
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 items-center">
                <Label htmlFor="isMainMedal">Үндсэн төрлийн медал</Label>
                <Checkbox
                  id="isMainMedal"
                  checked={isMainMedal}
                  onCheckedChange={(value) => setIsMainMedal(!!value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Label htmlFor="isAgeGroupMedal">Насны ангилалын медал</Label>
                <Checkbox
                  id="isAgeGroupMedal"
                  checked={isAgeGroupMedal}
                  onCheckedChange={(value) => setIsAgeGroupMedal(!!value)}
                />
              </div>
            </div>
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
              value={filter.provinceId ?? ''}
              onValueChange={(value) => {
                setFilter((curr) => ({ ...curr, province: value }))
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Хот/Аймаг сонгох" />
              </SelectTrigger>
              <SelectContent>
                {provinces?.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.districtId ?? ''}
              onValueChange={(value) =>
                setFilter((curr) => ({ ...curr, district: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Дүүрэг/Сум сонгох" />
              </SelectTrigger>
              <SelectContent>
                {districts?.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.school ?? ''}
              onValueChange={(value) =>
                setFilter((curr) => ({ ...curr, school: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сургууль сонгох" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((i) => (
                  <SelectItem key={i.school} value={i.school}>
                    {i.school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={
                filter.isWcaId === undefined
                  ? 'none'
                  : filter.isWcaId
                    ? 'true'
                    : 'false'
              }
              onValueChange={(value) => {
                setFilter((curr) => ({
                  ...curr,
                  isWcaId: value === 'none' ? undefined : value === 'true',
                }))
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="WCA ID эсэх" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Тийм</SelectItem>
                <SelectItem value="false">Үгүй</SelectItem>
                <SelectItem value="none">WCA ID Сонгох</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => {
                setFilter({
                  roundId: id,
                })
              }}
            >
              Цэвэрлэх
            </Button>
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
