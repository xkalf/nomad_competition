import { RouterOutputs, api } from "~/utils/api";
import CompetitionLayout from "../layout";
import { useRouter } from "next/router";
import DataTable from "~/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { getImageUrl } from "~/utils/supabase";
import { Check, X } from "lucide-react";
import DeleteButton from "~/components/delete-button";

type Round = RouterOutputs["round"]["getByCompetitionId"][number];

export default function RoundPage() {
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");

  const { data } = api.round.getByCompetitionId.useQuery(id, {
    enabled: id > 0,
  });
  const { mutate: remove } = api.round.delete.useMutation();

  const handleRemove = (id: number) => () => {
    remove(id);
  };

  const columns: ColumnDef<Round>[] = [
    {
      accessorKey: "name",
      header: "Нэр",
    },
    {
      accessorKey: "cubeType.image",
      header: "Шооны төрөл",
      cell: ({ row }) => (
        <Image
          src={getImageUrl(row.original.cubeType.image) ?? ""}
          alt={row.original.cubeType.name}
          width={20}
          height={20}
        />
      ),
    },
    {
      accessorKey: "nextCompetitor",
      header: "Хэдэн тамирчин үлдэх",
    },
    {
      accessorKey: "isDuel",
      header: "Халз эсэх",
      cell: ({ row }) => (row.original.isDuel ? <Check /> : <X />),
    },
    {
      accessorKey: "actions",
      header: "Үйлдэл",
      cell: ({ row }) => (
        <div className="space-x-2">
          <DeleteButton onConfirm={handleRemove(row.original.id)} />
        </div>
      ),
    },
  ];

  return (
    <CompetitionLayout>
      <div className="flex justify-between">
        <h1 className="text-4xl">Round</h1>
        {/* <FeeCreateForm */}
        {/*   reset={() => setSelected(0)} */}
        {/*   isOpen={isOpen} */}
        {/*   setIsOpen={setIsOpen} */}
        {/*   competitionId={id} */}
        {/*   current={data?.find((fee) => fee.id === selected)} */}
        {/* /> */}
      </div>
      <DataTable columns={columns} data={data || []} />
    </CompetitionLayout>
  );
}
