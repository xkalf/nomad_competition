import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { api } from '~/utils/api'
import { useGetCompetitionSlug } from '~/utils/hooks'
import CompetitionLayout from '../layout'

export default function SchedulePage() {
  const slug = useGetCompetitionSlug()

  const { data: competition } = api.competition.getBySlug.useQuery(slug, {
    enabled: !!slug,
  })
  const { data } = api.schedule.getByCompetitionId.useQuery(
    {
      competitionId: competition?.id ?? 0,
    },
    {
      enabled: !!competition?.id,
    },
  )

  const groupSchedule = (input: typeof data = []) => {
    const grouped = input.reduce(
      (acc: { [key: string]: typeof input }, item) => {
        const key = item.date

        if (!acc[key]) {
          acc[key] = []
        }

        acc[key]?.push(item)

        return acc
      },
      {},
    )

    return grouped
  }

  const groupedData = useMemo(() => groupSchedule(data), [data])

  return (
    <CompetitionLayout>
      <div className="flex justify-between">
        <h1 className="text-4xl">Цагийн хуваарь</h1>
      </div>
      {Object.keys(groupedData).map((key) => (
        <div key={key}>
          <h2 className="mt-4 text-2xl">{key}</h2>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Эхлэх цаг</TableHead>
                <TableHead>Дуусах цаг</TableHead>
                <TableHead>Төрөл</TableHead>
                <TableHead>Таслах хугацаа</TableHead>
                <TableHead>Цагийн хязгаар</TableHead>
                <TableHead>Дараагийн үед үлдэх тамирчид</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedData[key]?.map((item) => (
                <TableRow key={item.id} className="odd:bg-gray-200">
                  <TableCell>{item.startTime.slice(0, -3)}</TableCell>
                  <TableCell>{item.endTime.slice(0, -3)}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.cutOff}</TableCell>
                  <TableCell>{item.timeLimit}</TableCell>
                  <TableCell>{item.competitorLimit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </CompetitionLayout>
  )
}
