import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { mnFormat } from "~/utils/date";
import CompetitionLayout from "./layout";
import LoadingScreen from "~/components/loading-screen";
import { useSession } from "next-auth/react";
import AgeGroupForm from "./age-group-form";
import { useState } from "react";
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

export default function CompetitionShowPage() {
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
            <TableCell className="space-x-4 space-y-2">
              {data.competitionsToCubeTypes.map((i) => {
                if (i.cubeType.image) {
                  return (
                    <Image
                      src={getImageUrl(i.cubeType.image) || ""}
                      alt={i.cubeType.name}
                      key={i.cubeTypeId}
                    />
                  );
                } else {
                  return <Badge key={i.cubeTypeId}>{i.cubeType.name}</Badge>;
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
            <TableCell>
              {ageGroups?.map((item) => (
                <ul key={"age-group" + item.id}>
                  <li className="space-x-4 pb-2">
                    <span>
                      {item.start === item.end
                        ? `${item.name} ${item.start} онд төрсөн`
                        : item.end
                          ? `${item.name} ${item.start} - ${item.end} оны хооронд төрсөн`
                          : `${item.name} ${item.start} оноос өмнө төрсөн`}
                    </span>
                    {session?.user.isAdmin && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelected(item.id);
                          setIsOpen(true);
                        }}
                      >
                        Засах
                      </Button>
                    )}
                  </li>
                </ul>
              ))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CompetitionLayout>
  );
}
