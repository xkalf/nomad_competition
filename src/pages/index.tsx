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
            src="https://www.youtube.com/embed/pxWN8N72R_E?si=6h6lWlTXecM_qJh2"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </Layout>
  )
}
