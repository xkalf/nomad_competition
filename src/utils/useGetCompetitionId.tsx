import { useRouter } from "next/router";
import { useMemo } from "react";

export const useGetCompetitionId = () => {
  const router = useRouter();

  return useMemo(
    () =>
      router.query.competitionId
        ? Number(router.query.competitionId)
        : undefined,
    [router.query],
  );
};
