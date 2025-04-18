import { eq, min } from 'drizzle-orm'
import { DB } from '../db'
import {
  recordGender,
  recordRegion,
  records,
  recordTypes,
  results,
  rounds,
} from '../db/schema'

class RecordCreator {
  private db: DB
  private roundId: number
  private round: typeof rounds.$inferSelect | undefined = undefined

  constructor(roundId: number, db: DB) {
    this.roundId = roundId
    this.db = db
  }

  private getGender(isMale: boolean): (typeof recordGender.enumValues)[number] {
    return isMale ? 'male' : 'female'
  }

  private async initializeRound() {
    const round = await this.db.query.rounds.findFirst({
      where: eq(rounds.id, this.roundId),
    })

    if (!round) {
      throw new Error('Раунд олдсонгүй.')
    }

    this.round = round
  }

  private async getCurrentResults() {
    return await this.db.query.results.findMany({
      where: eq(results.roundId, this.roundId),
      with: {
        competitor: {
          columns: {
            provinceId: true,
            districtId: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                isMale: true,
              },
            },
          },
        },
      },
    })
  }

  private async getCurrentRecords() {
    return await this.db
      .select({
        value: min(records.value),
        type: records.type,
        region: records.region,
        gender: records.gender,
        provinceId: records.provinceId,
        districtId: records.districtId,
      })
      .from(records)
      .where(eq(records.cubeTypeId, this.round?.cubeTypeId ?? 0))
      .groupBy(
        records.type,
        records.region,
        records.gender,
        records.provinceId,
        records.districtId,
      )
  }

  private findNewBestRecord(
    currentResults: Awaited<ReturnType<typeof this.getCurrentResults>>,
    currentRecord: Awaited<ReturnType<typeof this.getCurrentRecords>>[number],
  ) {
    return currentResults.find(
      (result) =>
        result.best &&
        result.best > 0 &&
        result.best < (currentRecord.value ?? Infinity) &&
        (currentRecord.region === 'all' ||
          (currentRecord.region === 'province' &&
            result.competitor.provinceId === currentRecord.provinceId) ||
          (currentRecord.region === 'district' &&
            result.competitor.districtId &&
            (currentRecord.gender === 'all' ||
              this.getGender(result.competitor.user.isMale) ===
                currentRecord.gender))),
    )
  }

  private findNewAverageRecord(
    currentResults: Awaited<ReturnType<typeof this.getCurrentResults>>,
    currentRecord: Awaited<ReturnType<typeof this.getCurrentRecords>>[number],
  ) {
    return currentResults.find(
      (result) =>
        result.average &&
        result.average > 0 &&
        result.average < (currentRecord.value ?? Infinity) &&
        (currentRecord.region === 'all' ||
          (currentRecord.region === 'province' &&
            result.competitor.provinceId === currentRecord.provinceId) ||
          (currentRecord.region === 'district' &&
            result.competitor.districtId &&
            (currentRecord.gender === 'all' ||
              this.getGender(result.competitor.user.isMale) ===
                currentRecord.gender))),
    )
  }

  async createRecords() {
    await this.initializeRound()
    const insertValues: (typeof records.$inferInsert)[] = []

    const currentResults = await this.getCurrentResults()
    const currentRecords = await this.getCurrentRecords()

    for (const type of recordTypes.enumValues) {
      const cRecords = currentRecords.filter((record) => record.type === type)

      for (const region of recordRegion.enumValues) {
        for (const gender of recordGender.enumValues) {
          const currentRecord = cRecords.find(
            (record) => record.region === region && record.gender === gender,
          )

          if (!currentRecord?.value) continue

          let newRecord: (typeof currentResults)[number] | undefined = undefined

          if (type === 'single') {
            newRecord = this.findNewBestRecord(currentResults, currentRecord)
          } else {
            newRecord = this.findNewAverageRecord(currentResults, currentRecord)
          }

          if (newRecord) {
            insertValues.push({
              value: newRecord.best ?? 0,
              userId: newRecord.competitor.user.id,
              cubeTypeId: this.round?.cubeTypeId ?? 0,
              resultId: newRecord.id,
              type,
              region,
              gender,
              roundId: this.roundId,
              ...(region === 'province' && {
                provinceId: newRecord.competitor.provinceId,
              }),
              ...(region === 'district' && {
                provinceId: newRecord.competitor.provinceId,
                districtId: newRecord.competitor.districtId,
              }),
            })
          }
        }
      }
    }

    if (insertValues.length > 0) {
      await this.db.insert(records).values(insertValues)
    }
  }
}

export async function createRecords(roundId: number, db: DB) {
  const recordCreator = new RecordCreator(roundId, db)

  return recordCreator.createRecords()
}
