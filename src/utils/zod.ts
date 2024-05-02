import { createInsertSchema } from "drizzle-zod";
import { ZodObject, ZodRawShape, z } from "zod";
import {
  ageGroups,
  competitions,
  competitors,
  cubeTypes,
  schedules,
  users,
} from "~/server/db/schema";

export const getUpdateSchema = <T extends ZodRawShape>(input: ZodObject<T>) => {
  return input.partial().extend({
    id: z.number().int().positive(),
  });
};

export const createCompetitionSchema = createInsertSchema(competitions).extend({
  cubeTypes: z.number().int().positive().array(),
});

export const registerSchema = createInsertSchema(users, {
  firstname: (t) =>
    t.firstname
      .min(2, {
        message: "Хамгийн багадаа 2 тэмдэгт байх ёстой",
      })
      .regex(/^[А-Яа-яёЁҮүӨөІі]+$/, {
        message: "Зөвхөн кирилл үсгээр бичнэ үү",
      }),
  lastname: (t) =>
    t.lastname
      .min(2, {
        message: "Хамгийн багадаа 2 тэмдэгт байх ёстой",
      })
      .regex(/^[А-Яа-яёЁҮүӨөІі]+$/, {
        message: "Зөвхөн кирилл үсгээр бичнэ үү",
      }),
  email: (t) =>
    t.email.email({
      message: "Зөв имэйл хаяг оруулна уу. abc@example.com",
    }),
  password: (t) =>
    t.password.min(6, {
      message: "Нууц үг хамгийн багадаа 6 тэмдэгтээс их байх ёстой",
    }),
  phone: (t) =>
    t.phone
      .min(10000000, {
        message: "Утасны дугаар 8 оронтой байх ёстой",
      })
      .max(99999999, {
        message: "Утасны дугаар 8 оронтой байх ёстой",
      }),
}).omit({
  id: true,
  isAdmin: true,
});

export const createCubeTypeSchema = createInsertSchema(cubeTypes).omit({
  id: true,
});

export const competitionRegisterSchema = createInsertSchema(competitors)
  .omit({
    id: true,
    userId: true,
    requestedAt: true,
    verifiedAt: true,
  })
  .extend({
    cubeTypes: z.number().int().positive().array(),
  });

export const createScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const createAgeGroupSchema = createInsertSchema(ageGroups).omit({
  id: true,
});
