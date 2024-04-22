import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

interface Props {
  children: React.ReactNode;
}

export default function CompetitionLayout({ children }: Props) {
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");
  const { data: competition } = api.competition.getById.useQuery(id);

  const isPage = (href: string) => router.pathname === href;
  const isRegisterAllow = () => {
    if (
      competition &&
      competition.registerStartDate &&
      competition.registerEndDate
    ) {
      return (
        new Date(competition.registerStartDate) <= new Date() &&
        new Date() <= new Date(competition.registerEndDate)
      );
    }

    return false;
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="mb-8 flex flex-col space-y-2 lg:mb-0">
          <Button
            asChild
            variant={isPage("/competitions/[id]") ? "default" : "outline"}
          >
            <Link href={`/competitions/${id}`}>Мэдээлэл</Link>
          </Button>
          {isRegisterAllow() && (
            <Button
              asChild
              variant={
                isPage("/competitions/[id]/register") ? "default" : "outline"
              }
            >
              <Link href={`/competitions/${id}/register`}>
                Бүртгүүлэх хүсэлт
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant={
              isPage("/competitions/[id]/registrations") ? "default" : "outline"
            }
          >
            <Link href={`/competitions/${id}/registrations`}>
              Бүртгүүлсэн тамирчид
            </Link>
          </Button>
          <Button
            asChild
            variant={
              isPage("/competitions/[id]/schedule") ? "default" : "outline"
            }
          >
            <Link href={`/competitions/${id}/schedule`}>Цагийн хуваарь</Link>
          </Button>
        </div>
        <div className="col-span-4 md:px-4">{children}</div>
      </div>
    </Layout>
  );
}
