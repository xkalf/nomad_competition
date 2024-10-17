import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/utils/api";
import DataTable from "./data-table/data-table";
import { forwardRef } from "react";
import ScrambleImage from "~/utils/scrambleImage";

type Group = RouterOutputs["group"]["getAll"][number];
type Competition = RouterOutputs["competition"]["getById"];

interface Props {
  groups: Group[];
}

const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "index",
    header: "№",
    cell: ({ row }) => (row.index % 7) + 1,
  },
  {
    accessorKey: "name",
    header: "Нэр",
  },
  {
    accessorKey: "round.name",
    header: "Раунд",
  },
  {
    accessorKey: "scramble",
    header: "Холилт",
  },
  {
    accessorKey: "scramble-display",
    header: "Зураг",
    cell: ({ row }) => (
      <ScrambleImage
        scramble={row.original.scramble}
        cubeType={row.original.cubeType?.scrambleMapper}
      />
    ),
  },
];

const RoundPdf = forwardRef<HTMLDivElement, Props>(({ groups }, ref) => {
  return (
    <div className="p-8" ref={ref}>
      <DataTable columns={columns} data={groups} />
    </div>
  );
});

export default RoundPdf;
