import { format } from "date-fns";
import { mn } from "date-fns/locale";

export const mnFormat = (input: Date | string) => {
  return format(input, "yyyy-MM-dd", { locale: mn });
};
