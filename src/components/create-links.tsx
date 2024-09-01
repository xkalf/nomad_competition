import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Fragment } from 'react'
import { CREATE_LINKS } from '~/utils/contstans'

export default function CreateLinks() {
  const router = useRouter()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {CREATE_LINKS.map((l) => (
          <Fragment key={l.path}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={{
                    pathname: `/competitions/create/${l.path}`,
                    query: router.query,
                  }}
                >
                  {l.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
