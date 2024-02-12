import { useForm } from "react-hook-form";
import { z } from "zod";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { createCompetitionSchema } from "~/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RouterOutputs, api } from "~/utils/api";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/use-toast";
import { Button } from "~/components/ui/button";
import { useEffect } from "react";
import { MultiSelect } from "~/components/ui/multi-select";
import { mnFormat } from "~/utils/date";
import { ScrollArea } from "~/components/ui/scroll-area";

type Current = RouterOutputs["competition"]["getAll"][number];

interface Props {
  current?: Current;
  reset: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const defaultValues: z.infer<typeof createCompetitionSchema> = {
  name: "",
  address: "",
  maxCompetitors: 0,
  startDate: "",
  endDate: "",
  cubeTypes: [],
};

export default function CompetitionCreateForm({
  current,
  reset,
  isOpen,
  setIsOpen,
}: Props) {
  const utils = api.useUtils();
  const { data: cubeTypes } = api.cubeTypes.getAll.useQuery();
  const mappedCubeTypes = cubeTypes?.map((i) => ({
    value: i.id.toString(),
    label: i.name,
  }));
  const { mutate: create, isLoading: createLoading } =
    api.competition.create.useMutation({
      onSuccess: () => {
        utils.competition.getAll.invalidate();
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
    api.competition.update.useMutation({
      onSuccess: () => {
        utils.competition.getAll.invalidate();
        toast({
          title: "Амжилттай шинэчлэгдлээ.",
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

  const form = useForm<z.infer<typeof createCompetitionSchema>>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: { ...current },
  });

  const onSubmit = (values: z.infer<typeof createCompetitionSchema>) => {
    current ? update({ id: current.id, ...values }) : create(values);
  };

  useEffect(() => {
    form.reset(
      current
        ? {
          ...current,
          startDate: mnFormat(current?.startDate),
          endDate: mnFormat(current?.endDate),
          cubeTypes: current.competitionsToCubeTypes.map((i) => i.cubeTypeId),
        }
        : defaultValues,
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
          Шинэ тэмцээн бүртгэх
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <ScrollArea className="h-[1080px] overflow-y-auto">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тэмцээний нэр</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Хаяг</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Хаяг Линк</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || undefined} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тэмцээн эхлэх өдөр</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тэмцээний дуусах өдөр</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cubeTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тэмцээний төрлүүд</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={mappedCubeTypes || []}
                        selected={
                          mappedCubeTypes?.filter((i) =>
                            field.value?.includes(+i.value),
                          ) || []
                        }
                        onChange={(value) =>
                          field.onChange(value.map((i) => +i.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxCompetitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тамирчны хязгаар</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registerStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бүртгэл эхлэх хугацаа</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registerEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бүртгэл дуусах хугацаа</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Холбоо барих мэдээлэл</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || undefined} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationRequirments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бүртгүүлэх шаардлага</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || undefined} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createLoading || updateLoading}>
                Хадгалах
              </Button>
            </form>
          </ScrollArea>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
