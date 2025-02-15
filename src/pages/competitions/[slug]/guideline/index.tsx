import { Document, pdfjs, Page } from 'react-pdf'
import LoadingScreen from '~/components/loading-screen'
import { api } from '~/utils/api'
import { useGetCompetitionSlug } from '~/utils/hooks'
import { getImageUrl } from '~/utils/supabase'
import CompetitionLayout from '../layout'
import { useState } from 'react'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function GuideLinePage() {
  const slug = useGetCompetitionSlug()
  const [numPages, setNumPages] = useState<number>(0)

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

  function onSuccess({ numPages }: { numPages: number }) {
    console.log(numPages)
    setNumPages(numPages)
  }

  return (
    <CompetitionLayout>
      <h1 className="text-4xl font-bold capitalize">Удирдамж</h1>
      <Document
        file={getImageUrl(competition?.guideLines)}
        onLoadSuccess={onSuccess}
        className="w-full"
      >
        {[...Array(numPages)].map((_, i) => (
          <Page pageNumber={i + 1} renderTextLayer={false} className="w-full" />
        ))}
      </Document>
    </CompetitionLayout>
  )
}
