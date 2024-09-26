import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useFieldArray, useForm } from "react-hook-form";
import CreateButtons, {
  redirectNextCreatePage,
} from "~/components/create-buttons";
import CreateLinks from "~/components/create-links";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Form, FormFieldCustom } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { useGetCompetitionId } from "~/utils/hooks";
import { CreateScheduleManyInput, createScheduleManySchema } from "~/utils/zod";

export default function SchedulesForm() {
  const router = useRouter();
  const competitionId = useGetCompetitionId();

  const { data: current } = api.schedule.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  );
  const { data: rounds } = api.round.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  );
  const { mutate, isLoading } = api.schedule.createMany.useMutation({
    onSuccess: () => {
      toast({
        title: "Амжилттай бүртгэгдлээ.",
      });
      redirectNextCreatePage(router);
    },
    onError: (error) => {
      toast({
        title: "Алдаа гарлаа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateScheduleManyInput>({
    resolver: zodResolver(
      createScheduleManySchema.omit({ competitionId: true }),
    ),
    defaultValues: {
      data: current,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "data",
  });

  const onSubmit = (input: CreateScheduleManyInput) => {
    mutate({
      ...input,
      competitionId,
    });
  };

  return (
    <Layout>
      <CreateLinks />
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">Цагийн хуваарь бүртгэл</h1>
        <Button
          type="button"
          onClick={() =>
            append({
              date: "",
              startTime: "",
              endTime: "",
              name: "",
            })
          }
        >
          Нэмэх
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div className="flex items-center gap-4" key={field.id}>
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.roundId`}
                label="Раунд"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      const round = rounds?.find((r) => r.id === +value);
                      if (round) {
                        field.onChange(+value);
                        form.setValue(`data.${index}.name`, round.name);
                        form.setValue(
                          `data.${index}.competitorLimit`,
                          round.nextCompetitor,
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rounds?.map((r) => (
                        <SelectItem
                          key={`round-${r.id}`}
                          value={r.id.toString()}
                        >
                          {r.cubeType.name} {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.name`}
                label="Нэр"
                render={({ field }) => <Input {...field} />}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.date`}
                label="Өдөр"
                render={({ field }) => <Input type="date" {...field} />}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.startTime`}
                label="Эхлэх цаг"
                render={({ field }) => <Input type="time" {...field} />}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.endTime`}
                label="Дуусах цаг"
                render={({ field }) => <Input type="time" {...field} />}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.cutOff`}
                label="Таслах хугацаа"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? undefined} />
                )}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.timeLimit`}
                label="Цагийн хязгаар"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? undefined} />
                )}
              />
              <FormFieldCustom
                control={form.control}
                name={`data.${index}.competitorLimit`}
                label="Дараагийн үед үлдэх тамирчид"
                render={({ field }) => (
                  <Input
                    type="number"
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    value={field.value ?? undefined}
                  />
                )}
              />
              <Button
                type="button"
                onClick={() => remove(index)}
                disabled={isLoading}
                variant={"destructive"}
              >
                Устгах
              </Button>
            </div>
          ))}
        </form>
        <CreateButtons
          isLoading={isLoading}
          onSubmit={form.handleSubmit(onSubmit)}
        />
      </Form>
    </Layout>
  );
}
