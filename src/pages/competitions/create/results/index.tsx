import Link from 'next/link'
import { useRouter } from 'next/router'
import CreateLinks from '~/components/create-links'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardTitle } from '~/components/ui/card'
import { api } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'

export default function ResultsPage() {
  const competitionId = useGetCompetitionId()
  const router = useRouter()

  const { data: schedules } = api.schedule.getByCompetitionId.useQuery(
    {
      competitionId,
      withRound: true,
    },
    {
      enabled: competitionId > 0,
    },
  )

  return (
    <Layout>
      <CreateLinks />
      <div className="grid gap-2 grid-cols-auto">
        {schedules?.map((schedule) => (
          <Card key={schedule.id} className="max-w-64 space-y-2 p-4">
            <CardTitle className="p-2">
              {schedule.round?.cubeType.name} ({schedule.round?.name})
            </CardTitle>
            <CardContent>
              {schedule.startTime} ~ {schedule.endTime}
              {schedule.roundId && (
                <Button asChild>
                  <Link
                    href={{
                      pathname: `/competitions/create/results/${schedule.roundId}`,
                      query: router.query,
                    }}
                  >
                    Шивэх
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
