import Head from 'next/head'
import { api, RouterOutputs } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'
import { useRoundsStore } from '~/utils/store'

interface Props {
  children: React.ReactNode
}

type Rounds = RouterOutputs['round']['getAll']

export default function Layout({ children }: Props) {
  const setRounds = useRoundsStore((state) => state.setRounds)
  const competitionId = useGetCompetitionId()

  api.round.getAll.useQuery(
    {
      competitionId: competitionId,
    },
    {
      enabled: !!competitionId,
      onSuccess: (data) => {
        const groupdByCubeTypeName = data.reduce(
          (a, b) => {
            if (b.cubeType.image && !a[b.cubeType.image]) {
              a[b.cubeType.image] = []
            }

            if (b.cubeType.image) {
              a[b.cubeType.image]?.push(b)
            }

            return a
          },
          {} as Record<string, Rounds>,
        )

        setRounds(groupdByCubeTypeName)
      },
    },
  )
  return (
    <div className="space-y-4 p-2 md:p-8">
      <Head>
        <title>Nomad Competition</title>
      </Head>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  )
}
