import { format } from "date-fns";
import { mn } from "date-fns/locale";

export const mnFormat = (input: Date | string | number) => {
  return format(input, "yyyy-MM-dd", { locale: mn });
};

export const timeFormat = (input: Date) => {
  return format(input, "", { locale: mn });
};
