import { NextRouter, useRouter } from 'next/router'
import { Button } from './ui/button'
import Link from 'next/link'
import { BaseSyntheticEvent, useMemo } from 'react'
import { CREATE_LINKS } from '~/utils/contstans'

type Props = {
  isLoading?: boolean
  onSubmit?: (
    e?: BaseSyntheticEvent<object, unknown, unknown> | undefined,
  ) => Promise<void>
}

export const redirectNextCreatePage = (router: NextRouter) => {
  const curr =
    router.pathname.split('/')[3]?.length === 3
      ? 0
      : CREATE_LINKS.findIndex((o) => o.path === router.pathname.split('/')[3])

  if (curr < CREATE_LINKS.length - 1) {
    router.push({
      pathname: `/competitions/create/${CREATE_LINKS[curr + 1]?.path}`,
      query: router.query,
    })
  }
}

export default function CreateButtons({ isLoading, onSubmit }: Props) {
  const router = useRouter()

  const curr = useMemo(
    () =>
      router.pathname.split('/').length === 3
        ? 0
        : CREATE_LINKS.findIndex(
            (o) => o.path === router.pathname.split('/')[3],
          ),
    [router.pathname],
  )

  return (
    <div className="flex space-x-2">
      {curr > 0 && (
        <Button type="button" variant={'outline'} asChild>
          <Link
            href={{
              pathname: `/competitions/create/${CREATE_LINKS[curr - 1]?.path}`,
              query: router.query,
            }}
          >
            Буцах
          </Link>
        </Button>
      )}
      {curr < CREATE_LINKS.length - 1 && (
        <Button type="button" variant={'outline'} asChild>
          <Link
            href={{
              pathname: `/competitions/create/${CREATE_LINKS[curr + 1]?.path}`,
              query: router.query,
            }}
          >
            Дараах
          </Link>
        </Button>
      )}
      {onSubmit && (
        <Button type="submit" disabled={isLoading} onClick={onSubmit}>
          Хадгалах
        </Button>
      )}
    </div>
  )
}
