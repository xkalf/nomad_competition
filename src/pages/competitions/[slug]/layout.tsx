import Head from 'next/head'
import { api } from '~/utils/api'
import { useGetCompetitionSlug } from '~/utils/hooks'

interface Props {
  children: React.ReactNode
}

export default function CompetitionLayout({ children }: Props) {
  const slug = useGetCompetitionSlug()
  const { data: competition } = api.competition.getBySlug.useQuery(slug, {
    enabled: !!slug,
  })

  return (
    <>
      <Head>
        <title>{competition?.name}</title>
      </Head>
      {children}
    </>
  )
}
