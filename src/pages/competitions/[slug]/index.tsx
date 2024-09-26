import { api, RouterOutputs } from "~/utils/api";
import { mnFormat } from "~/utils/date";
import CompetitionLayout from "./layout";
import LoadingScreen from "~/components/loading-screen";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { getImageUrl } from "~/utils/supabase";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { useGetCompetitionSlug } from "~/utils/hooks";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { competitionRouter } from "~/server/api/routers/competitions";
import { db } from "~/server/db";
import { createCallerFactory } from "@trpc/server";
import Head from "next/head";

type Competition = RouterOutputs["competition"]["getBySlug"];

export default function CompetitionShowPage({
  competition,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const slug = useGetCompetitionSlug();

  const { data, error, isLoading } = api.competition.getBySlug.useQuery(slug, {
    enabled: !!slug,
    initialData: competition ?? undefined,
  });
  const { data: ageGroups } = api.ageGroup.getAll.useQuery(data?.id ?? 0, {
    enabled: !!data?.id,
  });

  const groupAgeGroups = (input: typeof ageGroups = []) => {
    const grouped = input
      ?.sort((a, b) => a.cubeType.order - b.cubeType.order)
      .reduce((acc: { [key: string]: typeof ageGroups }, item) => {
        const key = item.cubeType.name;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key]?.push(item);

        return acc;
      }, {});

    return grouped;
  };

  const groupedAgeGroups = useMemo(
    () => groupAgeGroups(ageGroups),
    [ageGroups],
  );

  if (error) {
    return <div></div>;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <CompetitionLayout>
      <Head>
        <meta property="og:title" content={competition?.name} />
      </Head>
      <h1 className="text-4xl font-bold capitalize">{data.name}</h1>
      <Table className="mt-4">
        <TableBody>
          <TableRow>
            <TableHead>Төрөл</TableHead>
            <TableCell className="flex gap-1 md:gap-2">
              {data.competitionsToCubeTypes
                .sort((a, b) => a.cubeType.order - b.cubeType.order)
                .map((i) => {
                  if (i.cubeType.image) {
                    return (
                      <Image
                        src={getImageUrl(i.cubeType.image) || ""}
                        alt={i.cubeType.name}
                        width={40}
                        height={40}
                        key={i.cubeTypeId}
                      />
                    );
                  } else {
                    return (
                      <Badge className="mr-2" key={i.cubeTypeId}>
                        {i.cubeType.name}
                      </Badge>
                    );
                  }
                })}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Хэзээ</TableHead>
            <TableCell>
              {mnFormat(data.startDate)} ~ {mnFormat(data.endDate)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Хаяг</TableHead>
            <TableCell>
              {data.addressLink ? (
                <a href={data.addressLink} target="_blank">
                  {data.address}
                </a>
              ) : (
                data.address
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Тамирчны тоо</TableHead>
            <TableCell>{data.maxCompetitors}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Бүртгэлийн хугацаа</TableHead>
            <TableCell>
              {data.registerStartDate?.toLocaleString()}
              {" ~ "}
              {data.registerEndDate?.toLocaleString()}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Холбоо барих</TableHead>
            <TableCell>{data.contact}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead className="flex items-center justify-between">
              <span>Насны ангилал</span>
            </TableHead>
            <TableCell className="p-0">
              {Object.entries(groupedAgeGroups).map(([key, value]) => (
                <ul key={key}>
                  <h2 className="py-2 text-center text-2xl">
                    {key} шооны насны ангилал
                  </h2>
                  {value
                    ?.sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <li
                        key={"age-group" + item.id}
                        className="space-x-4 p-2 even:bg-gray-200"
                      >
                        <span>
                          {item.start === item.end
                            ? `${item.name} ${item.start} онд төрсөн`
                            : item.end
                              ? `${item.name} ${item.start} - ${item.end} оны хооронд төрсөн`
                              : `${item.name} ${item.start} оноос өмнө төрсөн`}{" "}
                        </span>
                      </li>
                    ))}
                </ul>
              ))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CompetitionLayout>
  );
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext<{ slug: string }>) {
  const factory = createCallerFactory();

  const caller = factory(competitionRouter)({
    session: null,
    db: db,
  });

  let competition: Competition | null = null;

  if (params?.slug) {
    competition = await caller.getBySlug(params?.slug ?? "");
  }

  return {
    props: {
      competition,
    },
  };
}
