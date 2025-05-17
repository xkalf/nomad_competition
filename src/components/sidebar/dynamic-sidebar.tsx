import { ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { PropsWithChildren } from 'react'
import { api } from '~/utils/api'
import { useRoundsStore } from '~/utils/store'
import LoginDialog from '../login-dialog'
import RegisterDialog from '../register-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar'
import { NavUser } from './nav-user'
import { sidebarItems } from './sidebar-items'
import Image from 'next/image'
import { getImageUrl } from '~/utils/supabase'
import UpdateProfile from '../update-profile'

export function DynamicSidebar({ children }: PropsWithChildren) {
  const router = useRouter()
  const slug = router.query.slug?.toString()
  const session = useSession()

  const { data: competition } = api.competition.getBySlug.useQuery(slug ?? '', {
    enabled: !!slug,
  })

  const rounds = useRoundsStore((state) => state.rounds)

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
                  <SidebarGroupLabel>
                    {key.split(' ')[1]} {key.split(' ')[2]}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item
                        .filter(
                          (i) =>
                            i.hide === undefined ||
                            (competition ? i.hide(competition) : true),
                        )
                        .map((i) => {
                          if (i.rounds && Object.keys(rounds).length > 0) {
                            return Object.entries(rounds).map(
                              ([key, round]) => (
                                <Collapsible
                                  key={'sidebar-cubeType-' + key}
                                  asChild
                                  className="group/collapsible"
                                >
                                  <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                      <SidebarMenuButton tooltip={key}>
                                        <Image
                                          src={getImageUrl(key)}
                                          alt={'cubeType'}
                                          width={20}
                                          height={20}
                                        />
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                      </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <SidebarMenuSub>
                                        {round.map((r) => (
                                          <SidebarMenuSubItem
                                            key={'sidebar-round-' + r.id}
                                          >
                                            <SidebarMenuButton asChild>
                                              <Link
                                                href={{
                                                  pathname: slug
                                                    ? `/competitions/${slug}/results/${r.id}`
                                                    : `/competitions/create/results/${r.id}`,
                                                  query: router.query,
                                                }}
                                              >
                                                {r.name}
                                              </Link>
                                            </SidebarMenuButton>
                                          </SidebarMenuSubItem>
                                        ))}
                                      </SidebarMenuSub>
                                    </CollapsibleContent>
                                  </SidebarMenuItem>
                                </Collapsible>
                              ),
                            )
                          }

                          return (
                            <SidebarMenuItem key={i.title}>
                              <SidebarMenuButton asChild>
                                <Link
                                  href={{
                                    pathname:
                                      typeof i.href === 'function'
                                        ? i.href(slug ?? '')
                                        : i.href,
                                    query:
                                      typeof i.href === 'function'
                                        ? undefined
                                        : router.query,
                                  }}
                                >
                                  {i.icon && <i.icon />}
                                  {i.title}
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )
            })}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col space-y-2">
            {session?.data?.user ? (
              <>
                <UpdateProfile />
                <NavUser user={session?.data?.user} />
              </>
            ) : (
              <>
                <LoginDialog />
                <RegisterDialog />
              </>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger className="ml-4 mt-4" />
      <SidebarInset>
        <div className="space-y-4 p-4 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
