import { Viewer, Worker } from '@react-pdf-viewer/core'
import LoadingScreen from '~/components/loading-screen'
import { api } from '~/utils/api'
import { useGetCompetitionSlug } from '~/utils/hooks'
import { getImageUrl } from '~/utils/supabase'
import CompetitionLayout from '../layout'
import '@react-pdf-viewer/core/lib/styles/index.css'

export default function GuideLinePage() {
  const slug = useGetCompetitionSlug()

  const { data: competition, isLoading } = api.competition.getBySlug.useQuery(
    slug,
    {
      enabled: !!slug,
    },
  )

  if (isLoading) {
    return (
      <CompetitionLayout>
        <LoadingScreen />
      </CompetitionLayout>
    )
  }

  return (
    <CompetitionLayout>
      <h1 className="text-4xl font-bold capitalize">Удирдамж</h1>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={getImageUrl(competition?.guideLines)}></Viewer>
      </Worker>
    </CompetitionLayout>
  )
}
