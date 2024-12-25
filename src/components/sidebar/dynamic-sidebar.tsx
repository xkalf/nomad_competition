import { useSession } from 'next-auth/react'
import React, { PropsWithChildren } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar'
import { NavUser } from './nav-user'
import LoginDialog from '../login-dialog'
import RegisterDialog from '../register-dialog'
import Link from 'next/link'
import { sidebarItems } from './sidebar-items'
import { useRouter } from 'next/router'
import { api } from '~/utils/api'

export function DynamicSidebar({ children }: PropsWithChildren) {
  const router = useRouter()
  const slug = router.query.slug?.toString()
  const session = useSession()

  const { data: competition } = api.competition.getBySlug.useQuery(slug ?? '', {
    enabled: !!slug,
  })

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          {Object.entries(sidebarItems)
            .filter(
              ([key]) =>
                key === '/' ||
                router.pathname.includes(key.split(' ')[0] ?? ''),
            )
            .map(([key, item]) => {
              return (
                <SidebarGroup key={key}>
                  <SidebarGroupLabel>{key.split(' ')[1]}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item
                        .filter(
                          (i) =>
                            i.hide === undefined ||
                            (competition ? i.hide(competition) : true),
                        )
                        .map((i) => (
                          <SidebarMenuItem key={i.title}>
                            <SidebarMenuButton asChild>
                              <Link
                                href={
                                  typeof i.href === 'function'
                                    ? i.href(slug ?? '')
                                    : i.href
                                }
                              >
                                {i.icon && <i.icon />}
                                {i.title}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )
            })}
        </SidebarContent>
        <SidebarFooter>
          {session?.data?.user ? (
            <NavUser user={session?.data?.user} />
          ) : (
            <div className="flex flex-col space-y-2">
              <LoginDialog />
              <RegisterDialog />
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger />
      <div className="space-y-4 p-4 w-full">{children}</div>
    </SidebarProvider>
  )
}
