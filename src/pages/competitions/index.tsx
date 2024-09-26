import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Layout from "~/components/layout";
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
import { toast } from "~/components/ui/use-toast";
import DeleteButton from "~/components/delete-button";

export default function CompetitionsPage() {
  const utils = api.useUtils();
  const [isActive, setIsActive] = useState(true);
  const { data: session } = useSession();

  const { data } = api.competition.getAll.useQuery(isActive);
  const { mutate: remove } = api.competition.delete.useMutation({
    onSuccess: () => {
      utils.competition.getAll.invalidate();
      toast({
        title: "Амжилттай устгалаа.",
      });
    },
    onError: (error) => {
      toast({
        title: "Алдаа гарлаа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleActive = (i: boolean) => () => setIsActive(i);
  const handleRemove = (i: number) => () => remove(i);

  return (
    <Layout>
      {session?.user.isAdmin && (
        <>
          <Button asChild>
            <Link href="/competitions/create">Тэмцээн бүртгэх</Link>
          </Button>
        </>
      )}
      <div className="grid grid-cols-2 space-x-4">
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Огноо</TableHead>
            <TableHead>Тэмцээний нэр</TableHead>
            <TableHead className="hidden md:block">Хаяг</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {mnFormat(item.startDate)} ~ {mnFormat(item.endDate)}
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="hidden md:block">{item.address}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/competitions/${item.slug}`}>Дэлгэрэнгүй</Link>
                </Button>
                {session?.user.isAdmin && (
                  <>
                    <Button type="button" asChild>
                      <Link
                        href={`/competitions/create?competitionId=${item.id}`}
                      >
                        Засах
                      </Link>
                    </Button>
                    <DeleteButton
                      description={`${item.name} тэмцээнийг устгахдаа итгэлтэй байна уу?`}
                      onConfirm={handleRemove(item.id)}
                    />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Layout>
  );
}
