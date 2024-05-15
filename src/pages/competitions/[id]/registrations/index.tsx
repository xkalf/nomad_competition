import { RouterOutputs, api } from "~/utils/api";
import CompetitionLayout from "../layout";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import Image from "next/image";
import { getImageUrl } from "~/utils/supabase";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";
import DataTable from "~/components/data-table/data-table";

type Competitor = RouterOutputs["competitor"]["getByCompetitionId"][number];

export default function RegistrationsPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = useSession();
  const id = parseInt(router.query.id?.toString() || "0");

  const [isVerified, setIsVerified] = useState(
    router.query.isVerified === "true" ? true : false,
  );

  const { data: competition } = api.competition.getById.useQuery(id, {
    enabled: id > 0,
  });
  const { data } = api.competitor.getByCompetitionId.useQuery(
    {
      competitionId: id,
      isVerified,
    },
    {
      enabled: id > 0,
    },
  );
  const { mutate: verify } = api.competitor.verify.useMutation({
    onSuccess: () => {
      utils.competitor.getByCompetitionId.invalidate({
        competitionId: id,
        isVerified,
      });
      toast({
        title: "Амжилттай баталгаажууллаа.",
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

  const cubeTypes = useMemo(() => {
    const res = competition?.competitionsToCubeTypes
      .map((item) => item.cubeType)
      .sort((a, b) => a.order - b.order);
    return res || [];
  }, [competition?.competitionsToCubeTypes]);

  const columns: ColumnDef<Competitor>[] = [
    {
      accessorKey: "index",
      header: "Дугаар",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "user.firstname",
      header: ({ column }) => (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Нэр
          <ArrowUpDownIcon className="ml-2 h-3 w-3" />
        </Button>
      ),
    },
    {
      accessorKey: "user.lastname",
      header: ({ column }) => (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Овог
          <ArrowUpDownIcon className="ml-2 h-3 w-3" />
        </Button>
      ),
    },
    {
      accessorKey: "user.wcaId",
      header: "WCA ID",
    },
    {
      accessorKey: "user.birthDate",
      header: ({ column }) => (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Он
          <ArrowUpDownIcon className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        return row.original.user.birthDate.slice(0, 4);
      },
    },
    ...cubeTypes
      .sort((cubeType) => cubeType.order)
      .map(
        (cubeType): ColumnDef<Competitor> => ({
          accessorKey: "competitorsToCubeTypes." + cubeType.id,
          header: ({ column }) => (
            <Button
              variant={"ghost"}
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc");
              }}
            >
              <Image
                src={getImageUrl(cubeType.image) || ""}
                alt={cubeType.name}
                width={20}
                height={20}
              />
              <ArrowUpDownIcon className="ml-2 h-3 w-3" />
            </Button>
          ),
          cell: ({ row }) => {
            const result = row.original.competitorsToCubeTypes;
            const found = result.find((i) => i.cubeTypeId === cubeType.id);

            if (found) {
              return (
                <Image
                  src={getImageUrl(cubeType.image) || ""}
                  alt={cubeType.name}
                  width={20}
                  height={20}
                />
              );
            }
          },
          sortingFn: (rowA, rowB) => {
            const a = rowA.original.competitorsToCubeTypes.find(
              (i) => i.cubeTypeId === cubeType.id,
            );
            const b = rowB.original.competitorsToCubeTypes.find(
              (i) => i.cubeTypeId === cubeType.id,
            );

            if (!a) return 1;
            if (!b) return -1;
            return 0;
          },
        }),
      ),
    ...(session?.user.isAdmin && !isVerified
      ? [
        {
          accessorKey: "action",
          header: "Үйлдэл",
          cell: ({ row }: any) => {
            if (!session?.user.isAdmin || isVerified) return <></>;

            return (
              <Button
                onClick={() => {
                  verify(row.original.id);
                }}
              >
                Баталгаажуулах
              </Button>
            );
          },
        },
      ]
      : []),
  ];

  return (
    <CompetitionLayout>
      <div className="mb-4 flex flex-col justify-between md:flex-row">
        <h1 className="text-4xl">
          {isVerified ? "Баталгаажсан" : "Хүлээлгийн"} тамирчид
        </h1>
        <Button
          className="mt-2 md:mt-0"
          onClick={() => setIsVerified(!isVerified)}
        >
          {isVerified ? "Хүлээлгийн" : "Баталгаажсан"} тамирчид
        </Button>
      </div>
      <DataTable columns={columns} data={data || []} />
    </CompetitionLayout>
  );
}
