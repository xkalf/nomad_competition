import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { mnFormat } from "~/utils/date";
import CompetitionLayout from "./layout";

export default function CompetitionShowPage() {
  const router = useRouter();
  const id = router.query.id?.toString() || "0";

  const { data, error, isLoading } = api.competition.getById.useQuery(+id);

  if (error) {
    return <div>Тэмцээн олдсонгүй.</div>;
  }

  if (isLoading) {
    return <div>Түр хүлээнэ үү...</div>;
  }

  return (
    <CompetitionLayout>
      <h1 className="text-4xl capitalize">{data?.name}</h1>
      <div className="mt-8 grid w-1/2 grid-cols-2 text-lg">
        <label className="mr-2 text-end">Болох өдөр</label>
        <p>
          {mnFormat(data?.startDate)} ~ {mnFormat(data?.endDate)}
        </p>
        <label className="mr-2 text-end">Хаяг</label>
        <p>{data.address}</p>
        <label className="mr-2 text-end">Тамирчны тоо</label>
        <p>{data.maxCompetitors}</p>
      </div>
    </CompetitionLayout>
  );
}
