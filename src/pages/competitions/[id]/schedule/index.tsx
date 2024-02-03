import { useRouter } from "next/router";
import CompetitionLayout from "../layout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import ScheduleCreateForm from "./form";
import { useState } from "react";
import { toast } from "~/components/ui/use-toast";
import DeleteButton from "~/components/delete-button";

export default function SchedulePage() {
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");
  const utils = api.useUtils();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const { data } = api.schedule.getByCompetitionId.useQuery(id, {
    enabled: id > 0,
  });
  const { mutate: remove } = api.schedule.delete.useMutation({
    onSuccess: () => {
      utils.schedule.getByCompetitionId.invalidate(id);
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

  const handleEdit = (id: number) => () => {
    setSelected(id);
    setIsOpen(true);
  };
  const handleRemove = (id: number) => () => remove(id);

  return (
    <CompetitionLayout>
      <div className="flex justify-between">
        <h1 className="text-4xl">Цагийн хуваарь</h1>
        {session?.user.isAdmin && (
          <ScheduleCreateForm
            reset={() => setSelected(0)}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            competitionId={id}
            current={data?.find((i) => i.id === selected)}
          />
        )}
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Эхлэх цаг</TableHead>
            <TableHead>Дуусах цаг</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.startTime.slice(0, -3)}</TableCell>
              <TableCell>{item.endTime.slice(0, -3)}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="space-x-2">
                {session?.user.isAdmin && (
                  <>
                    <Button onClick={handleEdit(item.id)}>Засах</Button>
                    <DeleteButton onConfirm={handleRemove(item.id)} />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CompetitionLayout>
  );
}
