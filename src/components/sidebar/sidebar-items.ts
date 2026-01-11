import { isAfter, isBefore } from 'date-fns'
import { ClipboardMinus, Grid3x3, Home, Info, Trophy } from 'lucide-react'
import { RouterOutputs } from '~/utils/api'

type Competition = RouterOutputs['competition']['getBySlug']
type Rounds = RouterOutputs['round']['getByCompetitionId']

export type SidebarItem = {
  title: string
  icon?: React.ElementType
  href: string | ((slug: string) => string)
  hide?: (competition: Competition) => boolean
  isAdmin?: boolean
  children?: SidebarItem[]
  rounds?: (rounds: Rounds) => Record<string, Rounds>
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
      title: 'Цагийн хуваарь',
      href: (slug) => `/competitions/${slug}/schedule`,
    },
    {
      title: 'Удирдамж',
      href: (slug) => `/competitions/${slug}/guideline`,
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
      rounds: (rounds) => {
        const groupdByCubeType = rounds.reduce(
          (acc, round) => {
            if (!acc[round.cubeType.name]) {
              acc[round.cubeType.name] = []
            }
            acc[round.cubeType.name]?.push(round)
            return acc
          },
          {} as Record<string, Rounds>,
        )
        return groupdByCubeType
      },
    },
    {
      title: 'Насны ангилал',
      href: (slug) => `/competitions/${slug}/ageGroups`,
    },
    {
      title: 'Медаль',
      href: (slug) => `/competitions/${slug}/podium`,
    },
  ],
  '/competitions/create Тэмцээн Бүртгэх': [
    {
      title: 'Тэмцээн',
      href: '/competitions/create',
    },
    {
      title: 'Насны ангилал',
      href: '/competitions/create/age-groups',
    },
    {
      title: 'Төлбөрийн хураамж',
      href: '/competitions/create/fees',
    },
    {
      title: 'Раунд',
      href: '/competitions/create/round',
    },
    {
      title: 'Цагийн хуваарь',
      href: '/competitions/create/schedules',
    },
    {
      title: 'Групп',
      href: '/competitions/create/groups',
    },
    {
      title: 'Буцаалт',
      href: '/competitions/create/refunds',
    },
    {
      title: 'Тамирчид (Аймаг шинэчлэх)',
      href: '/competitions/create/competitors',
    },
    {
      title: 'Үзүүлэлт',
      href: `/competitions/create/results`,
      rounds: (rounds) => {
        const groupdByCubeType = rounds.reduce(
          (acc, round) => {
            if (!acc[round.cubeType.name]) {
              acc[round.cubeType.name] = []
            }
            acc[round.cubeType.name]?.push(round)
            return acc
          },
          {} as Record<string, Rounds>,
        )
        return groupdByCubeType
      },
    },
  ],
}
