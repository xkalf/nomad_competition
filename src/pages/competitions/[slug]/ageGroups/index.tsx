// final uldsen, (medal avsan, filter) humuus uur unguur
// temtseeniin medeellin door podium haragdah
// aimgiin medal
// surguuli deer avsan medaliin too

import { ColumnDef } from '@tanstack/react-table'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import DataTable from '~/components/data-table/data-table'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import { useIsMobile } from '~/hooks/use-mobile'
import { RouterOutputs, api } from '~/utils/api'
import { getImageUrl } from '~/utils/supabase'
import { displayTime } from '~/utils/timeUtils'

type Result = RouterOutputs['result']['findByAgeGroup'][number]

export default function AgeGroupsPage({
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [cubeTypeId, setCubeTypeId] = useState<number>(2)
  const isMobile = useIsMobile()

  const { data: competition } = api.competition.getBySlug.useQuery(slug ?? '', {
    enabled: !!slug,
  })

  const { data: cubeTypes } = api.cubeTypes.getAll.useQuery({
    isAgeGroup: true,
  })

  const { data: ageGroups } = api.ageGroup.getAll.useQuery(
    {
      competitionId: competition?.id ?? 0,
      cubeTypeId: cubeTypeId,
    },
    {
      enabled: !!competition,
    },
  )

  const { data: results } = api.result.findByAgeGroup.useQuery(
    {
      cubeTypeId,
      competitionId: competition?.id ?? 0,
    },
    {
      enabled: !!competition,
    },
  )

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
        cell: ({ row }) => (
          <div className={row.original.isFinal ? 'text-orange-500' : ''}>
            {`${row.original.competitor?.user.firstname} ${row.original.competitor?.user.lastname}`}
          </div>
        ),
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

  const getAgeGroupResults = useCallback(
    (ageGroupId: number) => {
      const ageGroup = ageGroups?.find((group) => group.id === ageGroupId)
      if (!ageGroup) {
        return []
      }
      const filtered = results
        ?.filter((result) => {
          const date = result.competitor?.user.birthDate

          if (!date) {
            return false
          }

          const year = +date.slice(0, 4)

          if (!ageGroup.end) {
            return ageGroup.start <= year
          }

          return ageGroup.start <= year && ageGroup.end >= year
        })
        .sort((a, b) => {
          if (!a.average || a.average < 0) return 1
          if (!b.average || b.average < 0) return -1
          return a.average - b.average
        })

      return filtered ?? []
    },
    [results],
  )

  return (
    <Layout>
      <h1>Насны ангилал</h1>
      <div className="flex space-x-2 md:space-x-4">
        {cubeTypes?.map((cubeType) => (
          <Button
            variant={cubeType.id === cubeTypeId ? 'default' : 'secondary'}
            onClick={() => {
              setCubeTypeId(cubeType.id)
            }}
            className="p-2"
          >
            {cubeType.image ? (
              <Image
                src={getImageUrl(cubeType.image) ?? ''}
                width={25}
                height={25}
                alt={cubeType.name}
              />
            ) : (
              cubeType.name
            )}
          </Button>
        ))}
      </div>
      {ageGroups?.map((ageGroup) => (
        <div className="space-y-2" key={ageGroup.id}>
          <h2>{ageGroup.name}</h2>
          <DataTable columns={columns} data={getAgeGroupResults(ageGroup.id)} />
        </div>
      ))}
    </Layout>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>,
) {
  return {
    props: {
      slug: context.params?.slug,
    },
  }
}
