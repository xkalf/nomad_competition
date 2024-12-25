import { isAfter, isBefore } from 'date-fns'
import { Grid3x3, Home, Info, Trophy, ClipboardMinus } from 'lucide-react'
import { RouterOutputs } from '~/utils/api'

type Competition = RouterOutputs['competition']['getBySlug']

export type SidebarItem = {
  title: string
  icon?: React.ElementType
  href: string | ((slug: string) => string)
  hide?: (competition: Competition) => boolean
  isAdmin?: boolean
}

export type SidebarConfig = {
  [key: string]: SidebarItem[]
}

export const sidebarItems: SidebarConfig = {
  '/': [
    { title: 'Нүүр', icon: Home, href: '/' },
    { title: 'Тэмцээн', icon: Trophy, href: '/competitions' },
    { title: 'Шооны төрөл', href: '/cube-types', isAdmin: true, icon: Grid3x3 },
  ],
  '/competitions/[slug] Тэмцээн': [
    {
      title: 'Мэдээлэл',
      href: (slug) => `/competitions/${slug}`,
      icon: Info,
    },
    {
      title: 'Бүртгүүлэх хүсэлт',
      href: (slug) => `/competitions/${slug}/register`,
      hide: (competition) => {
        if (competition.registerStartDate && competition.registerEndDate) {
          return (
            isBefore(competition.registerStartDate, new Date()) &&
            isAfter(competition.registerEndDate, new Date())
          )
        }

        return false
      },
      icon: ClipboardMinus,
    },
    {
      title: 'Бүртгүүлсэн тамирчид',
      href: (slug) => `/competitions/${slug}/registrations`,
    },
    {
      title: 'Үзүүлэлт',
      href: (slug) => `/competitions/${slug}/results`,
    },
  ],
}
