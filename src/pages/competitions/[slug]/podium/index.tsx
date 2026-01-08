import { Medal, Trophy } from 'lucide-react'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useIsMobile } from '~/hooks/use-mobile'
import { RouterOutputs, api } from '~/utils/api'
import { getImageUrl } from '~/utils/supabase'
import { displayTime } from '~/utils/timeUtils'

type MedalsData = RouterOutputs['result']['getMedals']
type FinalMedal = MedalsData['finalMedals'][number]
type AgeGroupMedal = MedalsData['ageGroupMedals'][number]

// Medal icon component
const MedalIcon = ({ medal }: { medal: number }) => {
  const getMedalColor = () => {
    switch (medal) {
      case 1:
        return 'text-yellow-500'
      case 2:
        return 'text-gray-400'
      case 3:
        return 'text-amber-700'
      default:
        return ''
    }
  }

  return medal === 1 ? (
    <Trophy className={`w-6 h-6 ${getMedalColor()}`} />
  ) : (
    <Medal className={`w-6 h-6 ${getMedalColor()}`} />
  )
}

// Table headers component
const MedalTableHeader = ({
  showResults = false,
}: { showResults?: boolean }) => {
  const isMobile = useIsMobile()

  return (
    <TableHeader>
      <TableRow>
        <TableHead>Медаль</TableHead>
        <TableHead>Нэр</TableHead>
        {showResults ? (
          <>
            <TableHead>Дундаж</TableHead>
            <TableHead>Синглэ</TableHead>
            {!isMobile && (
              <>
                <TableHead>1</TableHead>
                <TableHead>2</TableHead>
                <TableHead>3</TableHead>
                <TableHead>4</TableHead>
                <TableHead>5</TableHead>
              </>
            )}
          </>
        ) : (
          <TableHead>Раунд</TableHead>
        )}
      </TableRow>
    </TableHeader>
  )
}

// Medal row component
const MedalRow = ({
  medal,
  name,
  average,
  best,
  solve1,
  solve2,
  solve3,
  solve4,
  solve5,
}: {
  medal: number
  name: string
  average: number | null
  best: number | null
  solve1: number | null
  solve2: number | null
  solve3: number | null
  solve4: number | null
  solve5: number | null
}) => {
  const isMobile = useIsMobile()

  return (
    <TableRow>
      <TableCell>
        <MedalIcon medal={medal} />
      </TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{displayTime(average)}</TableCell>
      <TableCell>{displayTime(best)}</TableCell>
      {!isMobile && (
        <>
          <TableCell>{displayTime(solve1)}</TableCell>
          <TableCell>{displayTime(solve2)}</TableCell>
          <TableCell>{displayTime(solve3)}</TableCell>
          <TableCell>{displayTime(solve4)}</TableCell>
          <TableCell>{displayTime(solve5)}</TableCell>
        </>
      )}
    </TableRow>
  )
}

// Final medals table component
const FinalMedalsTable = ({
  medals,
  title,
}: {
  medals: FinalMedal[]
  title?: string
}) => {
  if (medals.length === 0) {
    return <p className="text-center text-gray-500 py-8">Медаль олдсонгүй</p>
  }

  return (
    <div className="space-y-4">
      {title && <h2>{title}</h2>}
      <Table>
        <MedalTableHeader showResults />
        <TableBody>
          {medals.map((medal) => (
            <MedalRow
              key={medal.id}
              medal={medal.medal}
              name={`${medal.user?.firstname} ${medal.user?.lastname}`}
              average={medal.result?.average}
              best={medal.result?.best}
              solve1={medal.result?.solve1}
              solve2={medal.result?.solve2}
              solve3={medal.result?.solve3}
              solve4={medal.result?.solve4}
              solve5={medal.result?.solve5}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Age group medals table component
const AgeGroupMedalsTable = ({
  medals,
  title,
}: {
  medals: AgeGroupMedal[]
  title?: string
}) => {
  if (medals.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {title && <h2>{title}</h2>}
      <Table>
        <MedalTableHeader />
        <TableBody>
          {medals.map((medal) => (
            <MedalRow
              key={medal.id}
              medal={medal.medal}
              name={`${medal.user?.firstname} ${medal.user?.lastname}`}
              average={medal.result?.average}
              best={medal.result?.best}
              solve1={medal.result?.solve1}
              solve2={medal.result?.solve2}
              solve3={medal.result?.solve3}
              solve4={medal.result?.solve4}
              solve5={medal.result?.solve5}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Cube type filter buttons
const CubeTypeFilters = ({
  cubeTypes,
  selectedCubeTypeId,
  onCubeTypeChange,
}: {
  cubeTypes?: Array<{ id: number; name: string; image: string | null }>
  selectedCubeTypeId?: number
  onCubeTypeChange: (cubeTypeId: number | undefined) => void
}) => {
  if (!cubeTypes || cubeTypes.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {cubeTypes.map((cubeType) => (
        <Button
          key={`cubetype-${cubeType.id}`}
          variant={cubeType.id === selectedCubeTypeId ? 'default' : 'secondary'}
          onClick={() => {
            onCubeTypeChange(
              selectedCubeTypeId === cubeType.id ? undefined : cubeType.id,
            )
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
  )
}

export default function PodiumPage({
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [cubeTypeId, setCubeTypeId] = useState<number | undefined>(undefined)
  const [ageGroupId, setAgeGroupId] = useState<number | undefined>(undefined)
  const [medalType, setMedalType] = useState<'final' | 'ageGroup'>('final')

  const { data: competition } = api.competition.getBySlug.useQuery(slug ?? '', {
    enabled: !!slug,
  })

  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competition?.id ?? 0,
    {
      enabled: !!competition,
    },
  )

  const { data: ageGroups } = api.ageGroup.getAll.useQuery(
    {
      competitionId: competition?.id ?? 0,
      cubeTypeId: cubeTypeId,
    },
    {
      enabled: !!competition,
    },
  )

  const { data: medalsData } = api.result.getMedals.useQuery(
    {
      competitionId: competition?.id ?? 0,
      cubeTypeId: cubeTypeId,
      ageGroupId: ageGroupId,
    },
    {
      enabled: !!competition,
    },
  )

  // Group final medals by cube type
  const finalMedalsByCubeType = useMemo(() => {
    if (!medalsData?.finalMedals) return {}
    return medalsData.finalMedals.reduce(
      (acc, medal) => {
        const ctId = medal.cubeTypeId
        if (!acc[ctId]) {
          acc[ctId] = []
        }
        acc[ctId]?.push(medal)
        return acc
      },
      {} as Record<number, FinalMedal[]>,
    )
  }, [medalsData?.finalMedals])

  // Group age group medals by cube type and age group
  const ageGroupMedalsByCubeType = useMemo(() => {
    if (!medalsData?.ageGroupMedals) return {}
    return medalsData.ageGroupMedals.reduce(
      (acc, medal) => {
        const ctId = medal.cubeTypeId
        if (!acc[ctId]) {
          acc[ctId] = {}
        }
        const agId = medal.ageGroupId
        if (!acc[ctId]?.[agId]) {
          acc[ctId]![agId] = []
        }
        acc[ctId]?.[agId]?.push(medal)
        return acc
      },
      {} as Record<number, Record<number, AgeGroupMedal[]>>,
    )
  }, [medalsData?.ageGroupMedals])

  console.log(Object.values(ageGroupMedalsByCubeType))

  // Filtered final medals
  const filteredFinalMedals = useMemo(() => {
    if (cubeTypeId) {
      return finalMedalsByCubeType[cubeTypeId] ?? []
    }
    return medalsData?.finalMedals ?? []
  }, [cubeTypeId, finalMedalsByCubeType, medalsData?.finalMedals])

  // Filtered age group medals
  const filteredAgeGroupMedals = useMemo(() => {
    if (cubeTypeId) {
      return ageGroupMedalsByCubeType[cubeTypeId] ?? {}
    }
    return ageGroupMedalsByCubeType
  }, [cubeTypeId, ageGroupMedalsByCubeType])

  const handleCubeTypeChange = (newCubeTypeId: number | undefined) => {
    setCubeTypeId(newCubeTypeId)
    setAgeGroupId(undefined)
  }

  return (
    <Layout>
      <h1>Медаль</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <CubeTypeFilters
          cubeTypes={cubeTypes}
          selectedCubeTypeId={cubeTypeId}
          onCubeTypeChange={handleCubeTypeChange}
        />

        {medalType === 'ageGroup' && (
          <Select
            value={ageGroupId?.toString() ?? 'all'}
            onValueChange={(value) => {
              const id = value === 'all' ? undefined : Number(value)
              setAgeGroupId(id)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Насны ангилал" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүгд</SelectItem>
              {ageGroups?.map((ageGroup) => (
                <SelectItem key={ageGroup.id} value={ageGroup.id.toString()}>
                  {ageGroup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Medal Type Tabs */}
      <Tabs
        value={medalType}
        onValueChange={(v) => setMedalType(v as typeof medalType)}
      >
        <TabsList>
          <TabsTrigger value="final">Финал медаль</TabsTrigger>
          <TabsTrigger value="ageGroup">Насны ангилал медаль</TabsTrigger>
        </TabsList>

        {/* Final Medals */}
        <TabsContent value="final" className="space-y-6">
          {cubeTypeId ? (
            <FinalMedalsTable
              medals={filteredFinalMedals}
              title={cubeTypes?.find((ct) => ct.id === cubeTypeId)?.name}
            />
          ) : (
            Object.entries(finalMedalsByCubeType).map(([ctIdStr, medals]) => {
              const ctId = Number(ctIdStr)
              const cubeType = cubeTypes?.find((ct) => ct.id === ctId)
              return (
                <FinalMedalsTable
                  key={ctIdStr}
                  medals={medals}
                  title={cubeType?.name}
                />
              )
            })
          )}
        </TabsContent>

        {/* Age Group Medals */}
        <TabsContent value="ageGroup" className="space-y-6">
          {cubeTypeId ? (
            Object.keys(filteredAgeGroupMedals).length > 0 ? (
              Object.entries(filteredAgeGroupMedals).map(
                ([ageGroupIdStr, medals]) => {
                  const ageGroupIdNum = Number(ageGroupIdStr)
                  const ageGroup = ageGroups?.find(
                    (ag) => ag.id === ageGroupIdNum,
                  )
                  const filteredMedals = ageGroupId
                    ? medals.filter(
                        (m: AgeGroupMedal) => m.ageGroupId === ageGroupId,
                      )
                    : medals

                  return (
                    <AgeGroupMedalsTable
                      key={ageGroupIdStr}
                      medals={filteredMedals}
                      title={ageGroup?.name}
                    />
                  )
                },
              )
            ) : (
              <p className="text-center text-gray-500 py-8">
                Насны ангилал медаль олдсонгүй
              </p>
            )
          ) : (
            Object.entries(ageGroupMedalsByCubeType).map(
              ([cubeTypeIdStr, ageGroupsData]) => {
                const cubeTypeIdNum = Number(cubeTypeIdStr)
                const cubeType = cubeTypes?.find(
                  (ct) => ct.id === cubeTypeIdNum,
                )
                return (
                  <div key={cubeTypeIdStr} className="space-y-6">
                    <h2 className="text-xl font-bold">
                      {cubeType?.name ?? ''}
                    </h2>
                    {Object.entries(ageGroupsData).map(
                      ([ageGroupIdStr, medals]) => {
                        const ageGroupIdNum = Number(ageGroupIdStr)
                        const ageGroup = ageGroups?.find(
                          (ag) => ag.id === ageGroupIdNum,
                        )
                        return (
                          <AgeGroupMedalsTable
                            key={ageGroupIdStr}
                            medals={medals}
                            title={ageGroup?.name}
                          />
                        )
                      },
                    )}
                  </div>
                )
              },
            )
          )}
        </TabsContent>
      </Tabs>
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
