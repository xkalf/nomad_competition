import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Layout from "~/components/layout";
import { MainNav } from "~/components/main-nav";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import { mnFormat } from "~/utils/date";
import CompetitionCreateForm from "./create-form";

export default function CompetitionsPage() {
  const [isActive, setIsActive] = useState(true);
  const { data: session } = useSession();

  const { data } = api.competition.getAll.useQuery();

  const handleActive = (i: boolean) => () => setIsActive(i);

  return (
    <Layout>
      {session?.user.isAdmin && <CompetitionCreateForm />}
      <div className="grid grid-cols-2 space-x-4 p-4">
        <Button
          className="w-full"
          variant={isActive ? "default" : "secondary"}
          onClick={handleActive(true)}
        >
          Идэвхитэй
        </Button>
        <Button
          className="w-full"
          variant={!isActive ? "default" : "secondary"}
          onClick={handleActive(false)}
        >
          Түүх
        </Button>
      </div>
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Огноо</TableHead>
              <TableHead>Тэмцээний нэр</TableHead>
              <TableHead>Хаяг</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item) => (
              <TableRow>
                <TableCell>
                  {mnFormat(item.startDate)} ~ {mnFormat(item.endDate)}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.address}</TableCell>
                <TableCell>
                  <Button variant="outline" asChild>
                    <Link href={`/competitions/${item.id}`}>Дэлгэрэнгүй</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
