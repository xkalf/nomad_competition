import Layout from '~/components/layout'
import HomeCarousel from './carousel'

export default function Home() {
  return (
    <Layout>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-10">
        <div className="md:col-span-4">
          <HomeCarousel />
        </div>
        <div className="md:col-span-6">
          <iframe
            className="h-full min-h-96 w-full"
            height="500"
            src="https://www.youtube.com/embed/1zJ05ddSNZU?si=Bx8EYjEySQPhbR3O"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </Layout>
  )
}
