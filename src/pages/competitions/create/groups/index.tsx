import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import CreateButtons, {
  redirectNextCreatePage,
} from '~/components/create-buttons'
import DataTable from '~/components/data-table/data-table'
import Layout from '~/components/layout'
import ResultPdf from '~/components/result-pdf'
import RoundPdf from '~/components/round-pdf'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from '~/components/ui/use-toast'
import { RouterOutputs, api } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'
import ScrambleImage from '~/utils/scrambleImage'

type Group = RouterOutputs['group']['getAll'][number]

const columns: ColumnDef<Group>[] = [
  {
    accessorKey: 'count',
    header: '№',
    cell: ({ row }) => (row.index % 7) + 1,
  },
  {
    accessorKey: 'name',
    header: 'Нэр',
  },
  {
    accessorKey: 'round.name',
    header: 'Раунд',
  },
  {
    accessorKey: 'scramble',
    header: 'Холилт',
  },
  {
    accessorKey: 'scramble-display',
    header: 'Зураг',
    cell: ({ row }) => (
      <ScrambleImage
        scramble={row.original.scramble}
        cubeType={row.original.cubeType?.scrambleMapper}
      />
    ),
  },
]

export default function GroupsPage() {
  const router = useRouter()
  const competitionId = useGetCompetitionId()
  const ctx = api.useUtils()
  const [filters, setFilters] = useState<{
    cubeTypeId?: number
    roundId?: number
  }>({})
  const printRef = useRef<HTMLDivElement>(null)
  const resultPrintRef = useRef<HTMLDivElement>(null)

  const { data } = api.group.getAll.useQuery(
    {
      competitionId,
      ...filters,
    },
    {
      enabled: !!competitionId && !!filters.roundId,
    },
  )
  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  )
  const { data: rounds } = api.round.getAll.useQuery(
    {
      competitionId,
      cubeTypeId: filters.cubeTypeId,
    },
    {
      enabled: competitionId > 0 && !!filters.cubeTypeId,
    },
  )
  const { data: competition } = api.competition.getById.useQuery(
    competitionId,
    {
      enabled: !!competitionId,
    },
  )
  const { data: results } = api.result.findByRound.useQuery(
    {
      roundId: filters.roundId ?? 0,
    },
    {
      enabled: !!filters.roundId,
    },
  )
  const { mutate, isLoading } = api.group.generate.useMutation({
    onSuccess: () => {
      ctx.group.getAll.invalidate()
      redirectNextCreatePage(router)
    },
    onError: (err) => {
      toast({
        title: 'Алдаа гарлаа',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const print = useReactToPrint({ contentRef: printRef })
  const resultPrint = useReactToPrint({ contentRef: resultPrintRef })

  return (
    <Layout>
      <div className="flex gap-4">
        <h1 className="text-3xl text-bold">Групп</h1>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => {
            if (competitionId) {
              mutate(competitionId)
            } else {
              toast({
                title: 'Тэмцээн олдсонгүй.',
                variant: 'destructive',
              })
            }
          }}
        >
          Үүсгэх
        </Button>
        {data?.length && competition && (
          <>
            <Button onClick={() => print()}>Хэвлэх</Button>
            <div className="hidden">
              <RoundPdf
                groups={data}
                ref={printRef}
                competitionName={competition.name}
                cubeType={
                  cubeTypes?.find((c) => c.id === filters.cubeTypeId)?.name ??
                  ''
                }
                roundName={
                  rounds?.find((r) => r.id === filters.roundId)?.name ?? ''
                }
              />
            </div>
          </>
        )}
      </div>
      {results?.length && (
        <>
          <Button onClick={() => resultPrint()}>Хэвлэх</Button>
          <div className="hidden">
            <ResultPdf
              results={results}
              ref={resultPrintRef}
              competitionName={competition?.name ?? ' '}
              cubeType={
                cubeTypes?.find((c) => c.id === filters.cubeTypeId)?.name ?? ''
              }
              roundName={
                rounds?.find((r) => r.id === filters.roundId)?.name ?? ''
              }
            />
          </div>
        </>
      )}
      <div className="flex gap-4">
        <Select
          value={filters.cubeTypeId?.toString()}
          onValueChange={(value) =>
            setFilters((curr) => ({
              ...curr,
              cubeTypeId: +value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Төрөл" />
          </SelectTrigger>
          <SelectContent>
            {cubeTypes?.map((c) => (
              <SelectItem value={c.id.toString()} key={`cubeType-${c.id}`}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.roundId?.toString()}
          onValueChange={(value) =>
            setFilters((curr) => ({
              ...curr,
              roundId: +value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Раунд" />
          </SelectTrigger>
          <SelectContent>
            {rounds?.map((r) => (
              <SelectItem value={r.id.toString()} key={`round-${r.id}`}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={data ?? []} />
      <CreateButtons />
    </Layout>
  )
}
