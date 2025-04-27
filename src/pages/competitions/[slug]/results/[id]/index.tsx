import { ColumnDef } from '@tanstack/react-table'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Layout from '~/components/layout'
import { appRouter } from '~/server/api/root'
import { getServerAuthSession } from '~/server/auth'
import { RouterInputs, RouterOutputs, api } from '~/utils/api'
import { displayTime } from '~/utils/timeUtils'
import superjson from 'superjson'
import { db } from '~/server/db'
import { useEffect, useMemo, useState } from 'react'
import DataTable from '~/components/data-table/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '~/components/ui/select'
import { SelectTrigger } from '@radix-ui/react-select'
import { Button } from '~/components/ui/button'
import { useIsMobile } from '~/hooks/use-mobile'

type Result = RouterOutputs['result']['findByRound'][number]
type Filter = RouterInputs['result']['findByRound']

export default function Page({
  slug,
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isMobile = useIsMobile()

  const columns = useMemo(() => {
    const desktopColumns: ColumnDef<Result>[] = [
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
    const columns: ColumnDef<Result>[] = [
      {
        accessorKey: 'order',
        header: '№',
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'name',
        header: 'Нэр',
        cell: ({ row }) =>
          `${row.original.competitor?.user.firstname} ${row.original.competitor?.user.lastname}`,
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
      ...(isMobile ? [] : desktopColumns),
    ]
    return columns
  }, [isMobile])

  const { data: competition } = api.competition.getBySlug.useQuery(slug ?? '', {
    enabled: !!slug,
  })

  const { data: round } = api.round.getAll.useQuery(
    {
      competitionId: competition?.id ?? 0,
      id: id,
    },
    {
      enabled: !!competition && !!id,
    },
  )
  const [filter, setFilter] = useState<Filter>({
    roundId: id,
    isSolved: true,
  })

  useEffect(() => {
    setFilter((prev) => ({ ...prev, roundId: id }))
  }, [id, setFilter])

  const { data } = api.result.findByRound.useQuery(filter, {
    queryKey: ['result.findByRound', filter],
    enabled: !!filter.roundId,
  })

  const { data: ageGroups } = api.ageGroup.getAll.useQuery(
    {
      competitionId: competition?.id ?? 0,
      cubeTypeId: round?.[0]?.cubeTypeId ?? 0,
    },
    {
      enabled: !!competition && !!round,
    },
  )
  const { data: provinces } = api.competitor.getProvinces.useQuery()
  const { data: districts } = api.competitor.getDistricts.useQuery(
    filter.provinceId ?? '',
    {
      enabled: !!filter.provinceId,
    },
  )

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between">
        <h1>
          Үзүүлэлт ({round?.[0]?.cubeType.name} : {round?.[0]?.name})
        </h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Select
            onValueChange={(value) =>
              setFilter((curr) => ({
                ...curr,
                ageGroupId: Number(value),
              }))
            }
            value={filter.ageGroupId?.toString() ?? ''}
          >
            <SelectTrigger className="w-[100px] md:w-[180px]">
              <SelectValue placeholder="Насны ангилал" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups?.map((ageGroup) => (
                <SelectItem
                  key={'ageGroup' + ageGroup.id}
                  value={ageGroup.id.toString()}
                >
                  {ageGroup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filter.provinceId}
            onValueChange={(value) => {
              setFilter((curr) => ({ ...curr, province: value }))
            }}
          >
            <SelectTrigger className="w-[100px] md:w-[180px]">
              <SelectValue placeholder="Хот/Аймаг сонгох" />
            </SelectTrigger>
            <SelectContent>
              {provinces?.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filter.districtId}
            onValueChange={(value) => {
              setFilter((curr) => ({ ...curr, district: value }))
            }}
          >
            <SelectTrigger className="w-[100px] md:w-[180px]">
              <SelectValue placeholder="Дүүрэг/Сум сонгох" />
            </SelectTrigger>
            <SelectContent>
              {districts?.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
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
            <SelectTrigger className="w-[100px] md:w-[180px]">
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
                isSolved: true,
              })
            }}
          >
            Цэвэрлэх
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={data ?? []} />
    </Layout>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string; id: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      session: await getServerAuthSession(context),
      db: db,
    },
    transformer: superjson,
  })

  await helpers.competition.getBySlug.prefetch(context.params?.slug as string)

  return {
    props: {
      trpcState: helpers.dehydrate(),
      slug: context.params?.slug,
      id: Number(context.params?.id) ?? 0,
    },
  }
}
