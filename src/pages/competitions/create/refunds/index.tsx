import { ColumnDef } from '@tanstack/react-table'
import DataTable from '~/components/data-table/data-table'
import Layout from '~/components/layout'
import { api, RouterOutputs } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'

type Refund = RouterOutputs['competition']['getRefunds'][number]

const columns: ColumnDef<Refund>[] = [
  {
    accessorKey: 'index',
    header: '№',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'user.lastname',
    header: 'Овог',
  },
  {
    accessorKey: 'user.firstname',
    header: 'Нэр',
  },
  {
    accessorKey: 'user.phone',
    header: 'Утас',
  },
  {
    accessorKey: 'amount',
    header: 'Дүн',
  },
]

export default function RefundsPage() {
  const competitionId = useGetCompetitionId()
  const { data } = api.competition.getRefunds.useQuery(competitionId, {
    enabled: competitionId > 0,
  })

  return (
    <Layout>
      <h1 className="text-3xl font-bold">Буцаалт</h1>
      <DataTable columns={columns} data={data ?? []} />
    </Layout>
  )
}
