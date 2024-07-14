import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { CreateRoundManyInput, createRoundManySchema } from "~/utils/zod";

export default function RoundsForm() {
  const searchParams = useSearchParams();
  const competitionId = +(searchParams.get("competitionId") || "0");

  const { data: current } = api.round.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  );
  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  );
  const { mutate } = api.round.createMany.useMutation({});

  const form = useForm<CreateRoundManyInput>({
    resolver: zodResolver(
      createRoundManySchema.omit({
        competitionId: true,
      }),
    ),
    defaultValues: {
      competitionId,
      data: current,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "data",
  });

  const onSubmit = (input: CreateRoundManyInput) => {
    mutate({
      ...input,
      competitionId,
    });
  };

  return (
    <Layout>
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">Раунд бүртгэх</h1>
        <Button
          type="button"
          onClick={() =>
            append({
              name: "",
              cubeTypeId: 0,
              nextCompetitor: 0,
            })
          }
        >
          Нэмэх
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => (
            <div className="flex items-center gap-4" key={field.id}>
              <FormField
                control={form.control}
                name={`data.${index}.name`}
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
                name={`data.${index}.cubeTypeId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Шооны төрөл</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {field.value ?? "Төрөл сонгох"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(+value)}
                        >
                          {cubeTypes?.map((cubeType) => (
                            <DropdownMenuRadioItem
                              value={cubeType.id.toString()}
                            >
                              {cubeType.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </form>
      </Form>
    </Layout>
  );
}
