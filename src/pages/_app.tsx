import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'

import { api } from '~/utils/api'

import '~/styles/globals.css'
import { Toaster } from '~/components/ui/toaster'
import { DynamicSidebar } from '~/components/sidebar/dynamic-sidebar'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DynamicSidebar>
        <Component {...pageProps} />
      </DynamicSidebar>
      <Toaster />
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
