import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { useGetCompetitionSlug } from "~/utils/hooks";

interface Props {
  children: React.ReactNode;
}

export default function CompetitionLayout({ children }: Props) {
  const router = useRouter();
  const slug = useGetCompetitionSlug();
  const { data: competition } = api.competition.getBySlug.useQuery(slug, {
    enabled: !!slug,
  });

  const isPage = (href: string) => router.pathname === href;
  const isRegisterAllow = () => {
    if (competition?.registerStartDate && competition.registerEndDate) {
      return (
        new Date(competition.registerStartDate) <= new Date() &&
        new Date() <= new Date(competition.registerEndDate)
      );
    }

    return false;
  };

  return (
    <Layout>
      <Head>
        <title>{competition?.name}</title>
      </Head>
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="mb-8 flex flex-col space-y-2 lg:mb-0">
          <Button
            asChild
            variant={isPage("/competitions/[slug]") ? "default" : "outline"}
          >
            <Link href={`/competitions/${slug}`}>Мэдээлэл</Link>
          </Button>
          {isRegisterAllow() && (
            <Button
              asChild
              variant={
                isPage("/competitions/[slug]/register") ? "default" : "outline"
              }
            >
              <Link href={`/competitions/${slug}/register`}>
                Бүртгүүлэх хүсэлт
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant={
              isPage("/competitions/[slug]/registrations")
                ? "default"
                : "outline"
            }
          >
            <Link href={`/competitions/${slug}/registrations`}>
              Бүртгүүлсэн тамирчид
            </Link>
          </Button>
          <Button
            asChild
            variant={
              isPage("/competitions/[slug]/schedule") ? "default" : "outline"
            }
          >
            <Link href={`/competitions/${slug}/schedule`}>Цагийн хуваарь</Link>
          </Button>
        </div>
        <div className="col-span-4 md:px-4">{children}</div>
      </div>
    </Layout>
  );
}
