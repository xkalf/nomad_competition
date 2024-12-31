import { ColumnDef } from "@tanstack/react-table";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Layout from "~/components/layout";
import { appRouter } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";
import { RouterInputs, RouterOutputs, api } from "~/utils/api";
import { displayTime } from "~/utils/timeUtils";
import superjson from "superjson";
import { db } from "~/server/db";
import { useEffect, useState } from "react";
import DataTable from "~/components/data-table/data-table";

type Result = RouterOutputs["result"]["findByRound"][number];
type Filter = RouterInputs["result"]["findByRound"];

const columns: ColumnDef<Result>[] = [
  {
    accessorKey: "order",
    header: "№",
    cell: ({ row }) => row.index + 1,
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

export default function Page({
  slug,
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: competition } = api.competition.getBySlug.useQuery(slug ?? "", {
    enabled: !!slug,
  });

  const { data: round } = api.round.getAll.useQuery(
    {
      competitionId: competition?.id ?? 0,
      id: id,
    },
    {
      enabled: !!competition && !!id,
    },
  );
  const [filter, setFilter] = useState<Filter>({
    roundId: id,
    isSolved: true,
  });

  useEffect(() => {
    setFilter((prev) => ({ ...prev, roundId: id }));
  }, [id, setFilter]);

  const { data } = api.result.findByRound.useQuery(filter, {
    queryKey: ["result.findByRound", filter],
    enabled: !!filter.roundId,
  });

  return (
    <Layout>
      <h1>
        Үзүүлэлт ({round?.[0]?.cubeType.name} : {round?.[0]?.name})
      </h1>
      <DataTable columns={columns} data={data ?? []} />
    </Layout>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string; id: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      session: await getServerAuthSession(context),
      db: db,
    },
    transformer: superjson,
  });

  await helpers.competition.getBySlug.prefetch(context.params?.slug as string);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      slug: context.params?.slug,
      id: Number(context.params?.id) ?? 0,
    },
  };
}
