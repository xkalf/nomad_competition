import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/utils/api";
import cstimer from "cstimer_module";
import DataTable from "./data-table/data-table";
import { forwardRef } from "react";

type Group = RouterOutputs["group"]["getAll"][number];

interface Props {
  groups: Group[];
}

const columns: ColumnDef<Group>[] = [
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
      <div
        dangerouslySetInnerHTML={{
          __html: cstimer.getImage(
            row.original.scramble,
            row.original.cubeType?.scrambleMapper ?? "",
          ),
        }}
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
