import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/utils/api";
import DataTable from "./data-table/data-table";
import { forwardRef } from "react";
import ScrambleImage from "~/utils/scrambleImage";

type Group = RouterOutputs["group"]["getAll"][number];

interface Props {
  groups: Group[];
  competitionName: string;
  cubeType: string;
  roundName: string;
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
        width={0.9 * 250}
        height={0.9 * 100}
      />
    ),
  },
];

const RoundPdf = forwardRef<HTMLDivElement, Props>(
  ({ groups, competitionName, cubeType, roundName }, ref) => {
    return (
      <div ref={ref}>
        {Array.from({ length: groups.length / 7 }).map((_, index) => (
          <div
            key={index}
            className="px-4 py-8 w-[21cm] h-[29.7cm] flex flex-col justify-center"
          >
            <h1 className="text-2xl">{competitionName}</h1>
            <p className="mb-4">
              {cubeType} ({roundName}) {index + 1} -р групп
            </p>
            <DataTable
              columns={columns}
              data={groups.slice(index * 7, index * 7 + 7)}
            />
          </div>
        ))}
      </div>
    );
  },
);

export default RoundPdf;
