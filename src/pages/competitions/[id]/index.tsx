import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { mnFormat } from "~/utils/date";
import CompetitionLayout from "./layout";
import LoadingScreen from "~/components/loading-screen";
import { useSession } from "next-auth/react";
import AgeGroupForm from "./age-group-form";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { getImageUrl } from "~/utils/supabase";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { toast } from "~/components/ui/use-toast";
import DeleteButton from "~/components/delete-button";

export default function CompetitionShowPage() {
  const ctx = api.useUtils();

  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const { data: session } = useSession();
  const { data, error, isLoading } = api.competition.getById.useQuery(id, {
    enabled: id > 0,
  });
  const { data: ageGroups } = api.ageGroup.getAll.useQuery(id, {
    enabled: id > 0,
  });

  const { mutate: deleteAgeGroup } = api.ageGroup.delete.useMutation({
    onSuccess: () => {
      ctx.ageGroup.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Алдаа гарлаа",
        description: error.message,
        variant: "destructive",
      });
    },
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
              {session?.user.isAdmin && (
                <AgeGroupForm
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  reset={() => setSelected(0)}
                  current={ageGroups?.find((i) => i.id === selected)}
                  competitionId={id}
                />
              )}
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
                        {session?.user.isAdmin && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelected(item.id);
                                setIsOpen(true);
                              }}
                            >
                              Засах
                            </Button>
                            <DeleteButton
                              size="sm"
                              onConfirm={() => deleteAgeGroup(item.id)}
                            />
                          </>
                        )}
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
