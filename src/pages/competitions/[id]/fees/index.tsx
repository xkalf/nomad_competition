import { RouterOutputs, api } from "~/utils/api";
import CompetitionLayout from "../layout";
import { Button } from "~/components/ui/button";
import DeleteButton from "~/components/delete-button";
import { useState } from "react";
import FeeCreateForm from "./form";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "~/components/data-table/data-table";

type Fee = RouterOutputs["fee"]["getByCompetitionId"][number];

export default function FeesPage() {
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");

  const { data } = api.fee.getByCompetitionId.useQuery(id, {
    enabled: id > 0,
  });
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: remove } = api.fee.delete.useMutation();

  const handleEdit = (id: number) => () => {
    setSelected(id);
  };

  const handleRemove = (id: number) => () => {
    remove(id);
  };

  const columns: ColumnDef<Fee>[] = [
    {
      accessorKey: "cubeType.name",
      header: "Төрөл",
    },
    {
      accessorKey: "amount",
      header: "Үнийн дүн",
    },
    {
      accessorKey: "action",
      header: "Үйлдэл",
      cell: ({ row }) => (
        <div className="space-x-2">
          <Button onClick={handleEdit(row.original.id)}>Засах</Button>
          <DeleteButton onConfirm={handleRemove(row.original.id)} />
        </div>
      ),
    },
  ];

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
      <DataTable columns={columns} data={data ?? []} />
    </CompetitionLayout>
  );
}
