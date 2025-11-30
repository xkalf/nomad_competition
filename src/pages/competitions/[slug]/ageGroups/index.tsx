import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useIsMobile } from '~/hooks/use-mobile'
import { api } from '~/utils/api'
import { getImageUrl } from '~/utils/supabase'
import { displayTime } from '~/utils/timeUtils'

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
    competitionId: competition?.id,
  })

  useEffect(() => {
    if (cubeTypes?.[0]) {
      setCubeTypeId(cubeTypes[0].id)
    }
  }, [cubeTypes])

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

  const getRowTextColor = useCallback(
    (result: { ageGroupMedal: number | null; isFinal: boolean }) => {
      if (!results) return ''

      const ageGroupMedalExists = [...results.values()]
        .flat()
        .some((r) => r.ageGroupMedal)

      if (result.ageGroupMedal) {
        return 'text-green-500'
      } else if (result.isFinal && !ageGroupMedalExists) {
        return 'text-orange-500'
      }
      // Default/no color
      return ''
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
            key={'cubetype-' + cubeType.id}
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
      {ageGroups
        ?.filter((group) => !!results?.get(group.id)?.length)
        .map((ageGroup) => (
          <div className="space-y-2" key={'ageGroup-' + ageGroup.id}>
            <h2>{ageGroup.name}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№</TableHead>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Дундаж</TableHead>
                  <TableHead>Синглэ</TableHead>
                  {isMobile ? null : (
                    <>
                      <TableHead>1</TableHead>
                      <TableHead>2</TableHead>
                      <TableHead>3</TableHead>
                      <TableHead>4</TableHead>
                      <TableHead>5</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...(results?.get(ageGroup.id) ?? [])].map((result, index) => (
                  <TableRow
                    key={'result-' + result.id}
                    className="odd:bg-gray-200"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell
                      className={getRowTextColor({
                        ageGroupMedal: result.ageGroupMedal,
                        isFinal: result.isFinal,
                      })}
                    >
                      {`${result.competitor?.user.firstname} ${result.competitor?.user.lastname}`}
                    </TableCell>
                    <TableCell>{displayTime(result.average)}</TableCell>
                    <TableCell>{displayTime(result.best)}</TableCell>
                    {isMobile ? null : (
                      <>
                        <TableCell>{displayTime(result.solve1)}</TableCell>
                        <TableCell>{displayTime(result.solve2)}</TableCell>
                        <TableCell>{displayTime(result.solve3)}</TableCell>
                        <TableCell>{displayTime(result.solve4)}</TableCell>
                        <TableCell>{displayTime(result.solve5)}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
