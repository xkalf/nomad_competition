import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CreateButtons, {
  redirectNextCreatePage,
} from "~/components/create-buttons";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormFieldCustom } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { useGetCompetitionId } from "~/utils/hooks";
import { getImageUrl, handleFileUpload } from "~/utils/supabase";
import { CreateCompetitionInput, createCompetitionSchema } from "~/utils/zod";

export default function CompetitionCreatePage() {
  const router = useRouter();
  const competitionId = useGetCompetitionId();
  const [isLoading, setIsLoading] = useState(false);

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
      onSuccess: () => {
        utils.competition.getAll.invalidate();
        toast({
          title: "Амжилттай шинэчлэгдлээ.",
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
  const onSubmit = (values: CreateCompetitionInput) => {
    current
      ? update({
          id: current.id,
          ...values,
        })
      : create({
          ...values,
        });
  };

  useEffect(() => {
    current
      ? form.reset({
          ...current,
          cubeTypes: current.competitionsToCubeTypes.map((i) => i.cubeTypeId),
        })
      : form.reset();
  }, [current]);

  form.watch("registerStartDate");

  return (
    <Layout>
      <h1 className="text-3xl font-bold">Тэмцээн бүртгэх</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-4"
        >
          <FormFieldCustom
            control={form.control}
            name="name"
            label="Тэмцээний нэр"
            render={({ field }) => <Input {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="address"
            label="Хаяг"
            render={({ field }) => <Textarea {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="addressLink"
            label="Хаяг Линк"
            render={({ field }) => (
              <Input {...field} value={field.value || undefined} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="startDate"
            label="Тэмцээн эхлэх өдөр"
            render={({ field }) => <Input type="date" {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="endDate"
            label="Тэмцээний дуусах өдөр"
            render={({ field }) => <Input type="date" {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="cubeTypes"
            label="Төрөл"
            render={({ field }) => (
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
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="maxCompetitors"
            label="Тамирчны хязгаар"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="registerStartDate"
            label="Бүртгэл эхлэх хугацаа"
            render={({ field }) => (
              <Input
                type="datetime-local"
                onChange={(e) => {
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : null,
                  );
                }}
                value={
                  field.value ? format(field.value, "yyyy-MM-dd HH:mm") : ""
                }
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="registerEndDate"
            label="Бүртгэл дуусах хугацаа"
            render={({ field }) => (
              <Input
                type="datetime-local"
                onChange={(e) => {
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : null,
                  );
                }}
                value={
                  field.value ? format(field.value, "yyyy-MM-dd HH:mm") : ""
                }
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="contact"
            label="Холбоо барих мэдээлэл"
            render={({ field }) => (
              <Textarea {...field} value={field.value || undefined} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="registrationRequirments"
            label="Бүртгүүлэх шаардлага"
            render={({ field }) => (
              <Textarea {...field} value={field.value || undefined} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="baseFee"
            label="Бүртгэлийн хураамж"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="guestFee"
            label="Зочны хураамж"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="freeGuests"
            label="Үнэгүй оролцох зочин"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="image"
            label="Зураг"
            render={({ field }) => (
              <>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    setIsLoading(true);
                    const { data, error } = await handleFileUpload(
                      e,
                      "competitions",
                    );

                    if (data) {
                      field.onChange(data.path);
                    } else if (error) {
                      toast({
                        title: "Алдаа гарлаа",
                        description: error.message,
                        variant: "destructive",
                      });
                    }

                    setIsLoading(false);
                  }}
                />
                {field.value && (
                  <Image
                    src={getImageUrl(field.value)}
                    alt="Зураг"
                    width={150}
                    height={150}
                  />
                )}
              </>
            )}
          />
          <CreateButtons
            isLoading={isLoading ?? createLoading ?? updateLoading}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </form>
      </Form>
    </Layout>
  );
}
