import { DB } from "../db";

export const getTotalAmount = async (competitorId: number, db: DB) => {
  const lastInvoice = await db.query.invoices.findFirst({
    where: (t, { eq, and }) =>
      and(eq(t.competitorId, competitorId), eq(t.isPaid, true)),
    columns: {
      guestCount: true,
    },
  });

  const competitor = await db.query.competitors.findFirst({
    where: (t, { eq }) => eq(t.id, competitorId),
    columns: {
      competitionId: true,
      verifiedAt: true,
      guestCount: true,
    },
    with: {
      competition: {
        columns: {
          baseFee: true,
          guestFee: true,
          freeGuests: true,
        },
      },
      competitorsToCubeTypes: {
        with: {
          cubeType: {
            columns: {},
            with: {
              fees: true,
            },
          },
        },
      },
    },
  });

  if (!competitor) {
    throw new Error("Тамирчний бүртгэл олдсонгүй.");
  }

  let totalAmount = 0;

  // Competitoin fee
  if (!competitor.verifiedAt) {
    totalAmount += +competitor.competition.baseFee;
  }

  // Guest fee
  if (
    competitor.guestCount > 0 &&
    competitor.guestCount -
      competitor.competition.freeGuests -
      (lastInvoice?.guestCount ?? 0) >
      0
  ) {
    totalAmount +=
      (competitor.guestCount -
        competitor.competition.freeGuests -
        (lastInvoice?.guestCount ?? 0)) *
      +competitor.competition.guestFee;
  }

  // CubeType fee
  totalAmount += competitor.competitorsToCubeTypes
    .filter((i) => i.status === "Created")
    .map((i) => {
      const fee = i.cubeType.fees.find(
        (j) => j.competitionId === competitor.competitionId,
      );

      return +(fee?.amount ?? 0);
    })
    .reduce((a, b) => a + b, 0);

  return totalAmount;
};
