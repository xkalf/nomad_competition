import { createInsertSchema } from 'drizzle-zod'
import { ZodObject, ZodRawShape, z } from 'zod'
import {
  ageGroups,
  competitions,
  competitors,
  cubeTypes,
  fees,
  invoices,
  results,
  rounds,
  schedules,
  users,
} from '~/server/db/schema'

export const getUpdateSchema = <T extends ZodRawShape>(input: ZodObject<T>) => {
  return input.partial().extend({
    id: z.number().int().positive(),
  })
}

export const createCompetitionSchema = createInsertSchema(competitions).extend({
  cubeTypes: z.number().int().positive().array(),
})
export type CreateCompetitionInput = z.infer<typeof createCompetitionSchema>

export const registerSchema = createInsertSchema(users, {
  firstname: (t) =>
    t.firstname
      .min(2, {
        message: 'Хамгийн багадаа 2 тэмдэгт байх ёстой',
      })
      .regex(/^[А-Яа-яёЁҮүӨөІі\s-]+$/, {
        message: 'Зөвхөн кирилл үсгээр бичнэ үү',
      })
      .trim(),
  lastname: (t) =>
    t.lastname
      .min(2, {
        message: 'Хамгийн багадаа 2 тэмдэгт байх ёстой',
      })
      .regex(/^[А-Яа-яёЁҮүӨөІі\s-]+$/, {
        message: 'Зөвхөн кирилл үсгээр бичнэ үү',
      })
      .trim(),
  email: (t) =>
    t.email
      .email({
        message: 'Зөв имэйл хаяг оруулна уу. abc@example.com',
      })
      .trim()
      .toLowerCase(),
  password: (t) =>
    t.password.min(6, {
      message: 'Нууц үг хамгийн багадаа 6 тэмдэгтээс их байх ёстой',
    }),
  phone: (t) =>
    t.phone
      .min(10000000, {
        message: 'Утасны дугаар 8 оронтой байх ёстой',
      })
      .max(99999999, {
        message: 'Утасны дугаар 8 оронтой байх ёстой',
      }),
}).omit({
  id: true,
  isAdmin: true,
})

export const createCubeTypeSchema = createInsertSchema(cubeTypes).omit({
  id: true,
})

export const competitionRegisterSchema = createInsertSchema(competitors)
  .omit({
    id: true,
    userId: true,
    requestedAt: true,
    verifiedAt: true,
  })
  .extend({
    cubeTypes: z.number().int().positive().array(),
  })

export const createScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
})

export const createAgeGroupSchema = createInsertSchema(ageGroups).omit({
  id: true,
})
export type CreateAgeGroupInput = z.infer<typeof createAgeGroupSchema>

export const createAgeGroupManySchema = z.object({
  data: createInsertSchema(ageGroups)
    .omit({
      id: true,
      cubeTypeId: true,
      competitionId: true,
    })
    .extend({
      cubeTypes: z.number().int().positive().array().min(1),
    })
    .array(),
  competitionId: z.number().int().positive(),
})
export type CreateAgeGroupManyInput = z.infer<typeof createAgeGroupManySchema>

export const createInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
})
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>

export const createFeeSchema = createInsertSchema(fees).omit({ id: true })

export const createFeeManySchema = z.object({
  data: createInsertSchema(fees)
    .omit({
      id: true,
      competitionId: true,
    })
    .array(),
  competitionId: z.number().int().positive(),
})
export type CreateFeeManyInput = z.infer<typeof createFeeManySchema>

export const createRoundSchema = createInsertSchema(rounds).omit({ id: true })
export type CreateRoundInput = z.infer<typeof createRoundSchema>

export const createRoundManySchema = z.object({
  data: createInsertSchema(rounds)
    .omit({
      competitionId: true,
    })
    .array(),
  competitionId: z.number().int().positive(),
})
export type CreateRoundManyInput = z.infer<typeof createRoundManySchema>

export const createResultSchema = createInsertSchema(results).omit({
  id: true,
  best: true,
  average: true,
  createdUserId: true,
  updatedUserId: true,
})

export const createScheduleManySchema = z.object({
  data: createInsertSchema(schedules)
    .omit({
      id: true,
      competitionId: true,
    })
    .array(),
  competitionId: z.number().int().positive(),
})
export type CreateScheduleManyInput = z.infer<typeof createScheduleManySchema>
