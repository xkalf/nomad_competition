import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { toast } from "~/components/ui/use-toast";
import { RouterOutputs, api } from "~/utils/api";
import { createScheduleSchema } from "~/utils/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useEffect } from "react";

type Current = RouterOutputs["schedule"]["getByCompetitionId"][number];

interface Props {
  current?: Current;
  reset: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  competitionId: number;
}

const defaultValues: z.infer<typeof createScheduleSchema> = {
  name: "",
  competitionId: 0,
  startTime: "",
  endTime: "",
  date: "",
};

export default function ScheduleCreateForm({
  current,
  reset,
  isOpen,
  setIsOpen,
  competitionId,
}: Props) {
  const utils = api.useUtils();

  const { mutate: create, isLoading: createLoading } =
    api.schedule.create.useMutation({
      onSuccess: () => {
        utils.schedule.getByCompetitionId.invalidate(competitionId);
        toast({
          title: "Амжилттай бүртгэгдлээ.",
        });
        setIsOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  const { mutate: update, isLoading: updateLoading } =
    api.schedule.update.useMutation({
      onSuccess: () => {
        utils.schedule.getByCompetitionId.invalidate(competitionId);
        toast({
          title: "Амжилттай засагдлаа.",
        });
        setIsOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const form = useForm<z.infer<typeof createScheduleSchema>>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      ...defaultValues,
      competitionId,
    },
  });

  const onSubmit = (values: z.infer<typeof createScheduleSchema>) => {
    current
      ? update({
          id: current.id,
          ...values,
        })
      : create(values);
  };

  useEffect(() => {
    form.reset(
      current
        ? {
            ...current,
          }
        : {
            ...defaultValues,
            competitionId,
          },
    );
  }, [current, form]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            setIsOpen(true);
            reset();
          }}
        >
          Шинэ цагийн хуваарь бүртгэх
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нэр</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Өдөр</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Эхлэх цаг</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дуусах цаг</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cutOff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Таслах хугацаа</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? undefined} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цагийн хязгаар</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? undefined} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="competitorLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дараагийн үед үлдэх тамирчид</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={field.value ?? undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createLoading || updateLoading}>
              Хадгалах
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
