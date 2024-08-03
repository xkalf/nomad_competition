import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
  const { mutate, isLoading } = api.round.createMany.useMutation({});

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
              perGroupCount: 20,
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
                        <Button className="block">Төрөл сонгох</Button>
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
              <FormField
                control={form.control}
                name={`data.${index}.nextCompetitor`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дараагийн раундэд үлдэх тамирчин</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? undefined}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`data.${index}.perGroupCount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Группын дахь тамирчны тоо</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? undefined}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant={"destructive"} onClick={() => remove(index)}>
                Устгах
              </Button>
            </div>
          ))}
        </form>
        <div className="space-x-2">
          <Button type="button" variant={"outline"} asChild>
            <Link
              href={{
                pathname: "/competitions/create/age-groups",
                query: {
                  competitionId,
                },
              }}
            >
              Буцах
            </Link>
          </Button>
          <Button type="button" variant={"secondary"} asChild>
            <Link
              href={{
                pathname: "/competitions/create/fees",
                query: {
                  competitionId,
                },
              }}
            >
              Дараах
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            Хадгалах
          </Button>
        </div>
      </Form>
    </Layout>
  );
}
