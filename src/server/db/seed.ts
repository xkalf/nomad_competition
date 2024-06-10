import postgres from "postgres";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import * as csvWriter from "csv-writer";

dotenv.config();

async function main() {
  const connection = postgres(process.env.DATABASE_URL || "", { max: 1 });

  const db = drizzle(connection, {
    schema,
  });

  const data = await db.query.competitors.findMany({
    where: (t, { isNotNull }) => isNotNull(t.verifiedAt),
    with: {
      user: true,
      competitorsToCubeTypes: {
        with: {
          cubeType: true,
        },
      },
    },
  });

  const mapped = data.map((value) => ({
    firstname: value.user.firstname,
    lastname: value.user.lastname,
    wcaId: value.user.wcaId,
    birthdate: value.user.birthDate,
    guestCount: value.guestCount,
    ...value.competitorsToCubeTypes
      .map((value) => value.cubeType)
      .sort((a, b) => a.order - b.order)
      .reduce((acc: Record<string, string>, value) => {
        acc[value.name] = "1";
        return acc;
      }, {}),
  }));

  // need to remove duplicates
  const cubeTypes = data
    .flatMap((value) =>
      value.competitorsToCubeTypes.map((value) => value.cubeType),
    )
    .filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.id === value.id),
    )
    .sort((a, b) => a.order - b.order)
    .map((value) => ({
      id: value.name,
      title: value.name,
    }));

  const writer = csvWriter.createObjectCsvWriter({
    path: "competitors.csv",
    header: [
      {
        id: "firstname",
        title: "Овог",
      },
      {
        id: "lastname",
        title: "Нэр",
      },
      {
        id: "wcaId",
        title: "WCA ID",
      },
      {
        id: "birthdate",
        title: "Төрсөн огноо",
      },
      {
        id: "guestCount",
        title: "Зочны тоо",
      },
      ...cubeTypes,
    ],
  });

  await writer.writeRecords(mapped);

  // const competitors = await db.query.competitors.findMany();
  //
  // await db
  //   .insert(competitorsToCubeTypes)
  //   .values(
  //     competitors.map((competitor) => ({
  //       competitorId: competitor.id,
  //       cubeTypeId: 2,
  //     })),
  //   )
  //   .onConflictDoNothing();

  process.exit(0);
}

main();
