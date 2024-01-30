import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";

interface Props {
  children: React.ReactNode;
}

export default function CompetitionLayout({ children }: Props) {
  const router = useRouter();
  const id = router.query.id?.toString() || "0";
  return (
    <Layout>
      <div className="grid grid-cols-5">
        <div className="flex flex-col space-y-2">
          <Button asChild>
            <Link href={`/competitions/${id}`}>Мэдээлэл</Link>
          </Button>
          <Button asChild>
            <Link href={`/competitions/${id}/register`}>Бүртгүүлэх хүсэлт</Link>
          </Button>
          <Button asChild>
            <Link href={`/competitions/${id}/registrations`}>
              Бүртгүүлсэн тамирчид
            </Link>
          </Button>
        </div>
        <div className="col-span-4 px-4">{children}</div>
      </div>
    </Layout>
  );
}
