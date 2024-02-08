import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { mnFormat } from "~/utils/date";
import CompetitionLayout from "./layout";
import LoadingScreen from "~/components/loading-screen";
import { useSession } from "next-auth/react";
import AgeGroupForm from "./age-group-form";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";

export default function CompetitionShowPage() {
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const { data: session } = useSession();
  const { data, error, isLoading } = api.competition.getById.useQuery(id);
  const { data: ageGroups } = api.ageGroup.getAll.useQuery(id);

  if (error) {
    return <div></div>;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <CompetitionLayout>
      <h1 className="text-4xl capitalize">{data.name}</h1>
      <Table>
        <TableBody>
          <TableRow>
            <TableHead>Болох өдөр</TableHead>
            <TableCell>
              {mnFormat(data.startDate)} ~ {mnFormat(data.endDate)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Хаяг</TableHead>
            <TableCell>{data.address}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Тамирчны тоо</TableHead>
            <TableCell>{data.maxCompetitors}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="flex items-center justify-between">
              <span>Насны ангилал</span>
              {session?.user.isAdmin && (
                <AgeGroupForm
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  reset={() => setSelected(0)}
                  current={ageGroups?.find((i) => i.id === selected)}
                  competitionId={id}
                />
              )}
            </TableHead>
            <TableCell>
              {ageGroups?.map((item) => (
                <TableRow key={"age-group-" + item.id}>
                  <TableHead>
                    {item.start} оноос {item.end} хүртэл
                  </TableHead>
                  {session?.user.isAdmin && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(item.id);
                        setIsOpen(true);
                      }}
                    >
                      Засах
                    </Button>
                  )}
                </TableRow>
              ))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CompetitionLayout>
  );
}
