import { api } from "~/utils/api";
import CompetitionLayout from "../layout";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";

export default function RegistrationsPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = useSession();
  const id = parseInt(router.query.id?.toString() || "0");

  const [isVerified, setIsVerified] = useState(true);

  const { data } = api.competitor.getByCompetitionId.useQuery(
    {
      competitionId: id,
      isVerified,
    },
    {
      enabled: id > 0,
    },
  );
  const { mutate: verify } = api.competitor.verify.useMutation({
    onSuccess: () => {
      utils.competitor.getByCompetitionId.invalidate({
        competitionId: id,
        isVerified,
      });
      toast({
        title: "Амжилттай баталгаажууллаа.",
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

  return (
    <CompetitionLayout>
      <div className="flex justify-between">
        <h1 className="text-4xl">
          {isVerified ? "Баталгаажсан" : "Хүлээлгийн"} тамирчид
        </h1>
        <Button onClick={() => setIsVerified(!isVerified)}>
          {isVerified ? "Хүлээлгийн" : "Баталгаажсан"} тамирчид
        </Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Овог</TableHead>
            <TableHead>Нэр</TableHead>
            <TableHead>WCA ID</TableHead>
            <TableHead>Төрлүүд</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.user.lastname}</TableCell>
              <TableCell>{item.user.firstname}</TableCell>
              <TableCell>{item.user.wcaId}</TableCell>
              <TableCell>
                {item.competitorsToCubeTypes
                  .map((i) => i.cubeType.name)
                  .join(" ")}
              </TableCell>
              {!item.verifiedAt && session?.user.isAdmin && (
                <TableCell>
                  <Button onClick={() => verify(item.id)}>
                    Баталгаажуулах
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CompetitionLayout>
  );
}
