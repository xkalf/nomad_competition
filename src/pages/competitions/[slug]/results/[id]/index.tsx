import { ColumnDef } from "@tanstack/react-table";
import Layout from "~/components/layout";
import { RouterOutputs } from "~/utils/api";
import { displayTime } from "~/utils/timeUtils";

type Result = RouterOutputs["result"]["findByRound"][number];

const columns: ColumnDef<Result>[] = [
  {
    accessorKey: "order",
    header: "№",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "competitor.verifiedId",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Нэр",
    cell: ({ row }) =>
      `${row.original.competitor?.user.lastname?.[0]}.${row.original.competitor?.user.firstname}`,
  },
  {
    accessorKey: "average",
    header: "Дундаж",
    cell: ({ row }) => displayTime(row.original.average),
  },
  {
    accessorKey: "best",
    header: "Синглэ",
    cell: ({ row }) => displayTime(row.original.best),
  },
  {
    accessorKey: "solve1",
    header: "Эвлүүлэлт 1",
    cell: ({ row }) => displayTime(row.original.solve1),
  },
  {
    accessorKey: "solve2",
    header: "Эвлүүлэлт 2",
    cell: ({ row }) => displayTime(row.original.solve2),
  },
  {
    accessorKey: "solve3",
    header: "Эвлүүлэлт 3",
    cell: ({ row }) => displayTime(row.original.solve3),
  },
  {
    accessorKey: "solve4",
    header: "Эвлүүлэлт 4",
    cell: ({ row }) => displayTime(row.original.solve4),
  },
  {
    accessorKey: "solve5",
    header: "Эвлүүлэлт 5",
    cell: ({ row }) => displayTime(row.original.solve5 ?? 0),
  },
];

export default function Page() {
  return (
    <Layout>
      <h1></h1>
    </Layout>
  );
}
