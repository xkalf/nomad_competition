import { api } from "~/utils/api";
import CompetitionLayout from "../layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import DeleteButton from "~/components/delete-button";
import { useState } from "react";
import FeeCreateForm from "./form";
import { useRouter } from "next/router";

export default function FeesPage() {
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");

  const { data } = api.fee.getAll.useQuery();
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: remove } = api.fee.delete.useMutation();

  const handleEdit = (id: number) => () => {
    setSelected(0);
  };

  const handleRemove = (id: number) => () => {
    remove(id);
  };

  return (
    <CompetitionLayout>
      <div className="flex justify-between">
        <h1 className="text-4xl">Бүртгэлийн хураамж</h1>
        <FeeCreateForm
          reset={() => setSelected(0)}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          competitionId={id}
          current={data?.find((fee) => fee.id === selected)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Төрөл</TableHead>
            <TableHead>Үнийн дүн</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((fee) => (
            <TableRow key={fee.id}>
              <TableCell>{fee.cubeType.name}</TableCell>
              <TableCell>{fee.amount}</TableCell>
              <TableCell className="space-x-2">
                <Button onClick={handleEdit(fee.id)}>Засах</Button>
                <DeleteButton onConfirm={handleRemove(fee.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CompetitionLayout>
  );
}
