import { isAfter, isBefore } from 'date-fns'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useMemo } from 'react'
import Layout from '~/components/layout'
import LoginDialog from '~/components/login-dialog'
import RegisterDialog from '~/components/register-dialog'
import { NavUser } from '~/components/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { api } from '~/utils/api'
import { useGetCompetitionSlug } from '~/utils/hooks'

interface Props {
  children: React.ReactNode
}

export default function CompetitionLayout({ children }: Props) {
  const session = useSession()
  const slug = useGetCompetitionSlug()
  const { data: competition } = api.competition.getBySlug.useQuery(slug, {
    enabled: !!slug,
  })

  const isRegisterAllow = () => {
    if (competition?.registerStartDate && competition.registerEndDate) {
      return (
        isBefore(competition.registerStartDate, new Date()) &&
        isAfter(competition.registerEndDate, new Date())
      )
    }

    return false
  }

  const items = useMemo(
    () =>
      [
        {
          title: 'Мэдээлэл',
          url: `/competitions/${slug}`,
        },
        {
          title: 'Бүртгүүлэх хүсэлт',
          url: `/competitions/${slug}/register`,
          hide: !isRegisterAllow(),
        },
        {
          title: 'Бүртгүүлсэн тамирчид',
          url: `/competitions/${slug}/registrations`,
        },
        {
          title: 'Үзүүлэлт',
          url: `/competitions/${slug}/results`,
        },
      ] satisfies { title: string; url: string; hide?: boolean }[],
    [slug],
  )

  return (
    <Layout>
      <Head>
        <title>{competition?.name}</title>
      </Head>
      <SidebarProvider>
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <Sidebar>
            <SidebarContent>
              {items
                .filter((item) => item.hide === undefined || !item.hide)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarContent>
            <SidebarFooter>
              {session.status === 'authenticated' && session.data?.user ? (
                <NavUser user={session.data?.user}></NavUser>
              ) : (
                <div className="flex flex-col space-y-2">
                  <LoginDialog />
                  <RegisterDialog />
                </div>
              )}
            </SidebarFooter>
          </Sidebar>
          <div className="col-span-4 md:px-4">
            <SidebarTrigger />
            {children}
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  )
}
