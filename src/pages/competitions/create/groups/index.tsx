import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import CreateButtons, {
  redirectNextCreatePage,
} from "~/components/create-buttons";
import CreateLinks from "~/components/create-links";
import DataTable from "~/components/data-table/data-table";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/components/ui/use-toast";
import { RouterOutputs, api } from "~/utils/api";
import { useGetCompetitionId } from "~/utils/hooks";
import { getImageUrl } from "~/utils/supabase";
import cstimer from "cstimer_module";
import { useReactToPrint } from "react-to-print";
import RoundPdf from "~/components/round-pdf";

type Group = RouterOutputs["group"]["getAll"][number];

const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "cubeType.name",
    header: "Төрөл",
    cell: ({ row }) => {
      if (row.original.cubeType?.image) {
        return (
          <Image
            src={getImageUrl(row.original.cubeType.image) ?? ""}
            alt={row.original.cubeType.name}
            width={50}
            height={50}
          />
        );
      }
      return row.original.cubeType?.name;
    },
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
      <div
        className="svg-container w-20"
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

export default function GroupsPage() {
  const router = useRouter();
  const competitionId = useGetCompetitionId();
  const ctx = api.useUtils();
  const [filters, setFilters] = useState<{
    cubeTypeId?: number;
    roundId?: number;
  }>({});
  const printRef = useRef<HTMLDivElement>(null);

  const { data } = api.group.getAll.useQuery(
    {
      competitionId,
      ...filters,
    },
    {
      enabled: !!competitionId && !!filters.roundId,
    },
  );
  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  );
  const { data: rounds } = api.round.getAll.useQuery(
    {
      competitionId,
      cubeTypeId: filters.cubeTypeId,
    },
    {
      enabled: competitionId > 0 && !!filters.cubeTypeId,
    },
  );
  const { mutate, isLoading } = api.group.generate.useMutation({
    onSuccess: () => {
      ctx.group.getAll.invalidate();
      redirectNextCreatePage(router);
    },
    onError: (err) => {
      toast({
        title: "Алдаа гарлаа",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const print = useReactToPrint({ contentRef: printRef });

  return (
    <Layout>
      <CreateLinks />
      <div className="flex gap-4">
        <h1 className="text-3xl text-bold">Групп</h1>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => {
            if (competitionId) {
              mutate(competitionId);
            } else {
              toast({
                title: "Тэмцээн олдсонгүй.",
                variant: "destructive",
              });
            }
          }}
        >
          Үүсгэх
        </Button>
        {data?.length && (
          <>
            <Button onClick={() => print()}>Хэвлэх</Button>
            <div className="hidden">
              <RoundPdf groups={data} ref={printRef} />
            </div>
          </>
        )}
      </div>
      <div className="flex gap-4">
        <Select
          value={filters.cubeTypeId?.toString()}
          onValueChange={(value) =>
            setFilters((curr) => ({
              ...curr,
              cubeTypeId: +value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Төрөл" />
          </SelectTrigger>
          <SelectContent>
            {cubeTypes?.map((c) => (
              <SelectItem value={c.id.toString()} key={`cubeType-${c.id}`}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.roundId?.toString()}
          onValueChange={(value) =>
            setFilters((curr) => ({
              ...curr,
              roundId: +value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Раунд" />
          </SelectTrigger>
          <SelectContent>
            {rounds?.map((r) => (
              <SelectItem value={r.id.toString()} key={`round-${r.id}`}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={data ?? []} />
      <CreateButtons />
    </Layout>
  );
}
