import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, RouterOutputs } from "~/utils/api";
import { createCompetitionSchema } from "~/utils/zod";
import { toast } from "../ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { MultiSelect } from "../ui/multi-select";
import { Button } from "../ui/button";

type Competition = RouterOutputs["competition"]["getAll"][number];
type CompetionInput = z.infer<typeof createCompetitionSchema>;

interface CompetitionProps {
  current?: Competition;
}

const CompetitionForm: FC<CompetitionProps> = ({ current }) => {
  const utils = api.useUtils();
  const form = useForm<CompetionInput>({
    resolver: zodResolver(createCompetitionSchema),
  });

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
      },
      onError: (error) => {
        toast({
          title: "Алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const onSubmit = (values: CompetionInput) => {
    current
      ? update({
          id: current.id,
          ...values,
        })
      : create(values);
  };

  return (
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
        <Button type="submit" disabled={createLoading || updateLoading}>
          Хадгалах
        </Button>
      </form>
    </Form>
  );
};

export default CompetitionForm;
