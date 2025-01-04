import Head from 'next/head'
import { api, RouterOutputs } from '~/utils/api'
import { useGetCompetitionSlug } from '~/utils/hooks'
import { useRoundsStore } from '~/utils/store'

interface Props {
  children: React.ReactNode
}

type Rounds = RouterOutputs['round']['getAll']

export default function CompetitionLayout({ children }: Props) {
  const slug = useGetCompetitionSlug()
  const { data: competition } = api.competition.getBySlug.useQuery(slug, {
    enabled: !!slug,
  })

  const setRounds = useRoundsStore((state) => state.setRounds)

  api.round.getAll.useQuery(
    {
      competitionId: competition?.id ?? 0,
    },
    {
      enabled: !!competition,
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
    <>
      <Head>
        <title>{competition?.name}</title>
      </Head>
      {children}
    </>
  )
}
