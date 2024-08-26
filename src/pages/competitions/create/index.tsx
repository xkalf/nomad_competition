import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CreateButtons from "~/components/create-buttons";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { CreateCompetitionInput, createCompetitionSchema } from "~/utils/zod";

export default function CompetitionCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const competitionId = +(searchParams.get("competitionId") || "0");
  const utils = api.useUtils();
  const form = useForm<CreateCompetitionInput>({
    resolver: zodResolver(createCompetitionSchema),
  });

  const { data: current } = api.competition.getById.useQuery(competitionId, {
    enabled: competitionId > 0,
  });
  const { data: cubeTypes } = api.cubeTypes.getAll.useQuery();

  const { mutate: create, isLoading: createLoading } =
    api.competition.create.useMutation({
      onSuccess: (data) => {
        utils.competition.getAll.invalidate();
        toast({
          title: "Амжилттай бүртгэгдлээ.",
        });
        router.push("/competitions/create/age-groups?competitionId=" + data.id);
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
      onSuccess: (data) => {
        utils.competition.getAll.invalidate();
        toast({
          title: "Амжилттай шинэчлэгдлээ.",
        });
        router.push("/competitions/create/age-groups?competitionId=" + data.id);
      },
      onError: (error) => {
        toast({
          title: "Алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const onSubmit = (values: CreateCompetitionInput) => {
    current
      ? update({
          id: current.id,
          ...values,
        })
      : create(values);
  };

  useEffect(() => {
    current
      ? form.reset({
          ...current,
          cubeTypes: current.competitionsToCubeTypes.map((i) => i.cubeTypeId),
        })
      : form.reset();
  }, [current]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold">Тэмцээн бүртгэх</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-4"
        >
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
                <FormLabel>Төрөл</FormLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="block">Төрөл сонгох</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {cubeTypes?.map((cubeType) => (
                      <DropdownMenuCheckboxItem
                        key={cubeType.id}
                        checked={field.value?.includes(cubeType.id)}
                        onCheckedChange={(value) => {
                          if (!field.value) {
                            field.value = [];
                          }

                          if (value && !field.value.includes(cubeType.id)) {
                            field.onChange([...field.value, cubeType.id]);
                          } else if (
                            !value &&
                            field.value.includes(cubeType.id)
                          ) {
                            field.onChange(
                              field.value.filter((id) => id !== cubeType.id),
                            );
                          }
                        }}
                      >
                        {cubeType.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    type="datetime-local"
                    onChange={(e) => {
                      field.onChange(new Date(e.target.value));
                    }}
                    value={field.value?.toLocaleString("sv-SE")}
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
                    type="datetime-local"
                    onChange={(e) => {
                      field.onChange(new Date(e.target.value));
                    }}
                    value={field.value?.toLocaleString("sv-SE")}
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
          <FormField
            control={form.control}
            name="baseFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Бүртгэлийн хураамж</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guestFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Зочны хураамж</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="freeGuests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Үнэгүй оролцох зочин</FormLabel>
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
          <CreateButtons
            isLoading={createLoading || updateLoading}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </form>
      </Form>
    </Layout>
  );
}
