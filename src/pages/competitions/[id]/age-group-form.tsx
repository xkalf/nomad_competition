import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { toast } from "~/components/ui/use-toast";
import { RouterOutputs, api } from "~/utils/api";
import { createAgeGroupSchema } from "~/utils/zod";

type Current = RouterOutputs["ageGroup"]["getAll"][number];

interface Props {
  current?: Current;
  reset: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  competitionId: number;
}

const defaultValues: z.infer<typeof createAgeGroupSchema> = {
  start: 0,
  end: 0,
  competitionId: 0,
  name: "",
  cubeTypeId: 0,
};

export default function AgeGroupForm({
  current,
  reset,
  isOpen,
  setIsOpen,
  competitionId,
}: Props) {
  const utils = api.useUtils();

  const { data: cubeTypes } = api.cubeTypes.getAll.useQuery();

  const { mutate: create, isLoading: createLoading } =
    api.ageGroup.create.useMutation({
      onSuccess: () => {
        utils.ageGroup.getAll.invalidate();
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
    api.ageGroup.update.useMutation({
      onSuccess: () => {
        utils.ageGroup.getAll.invalidate();
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

  const form = useForm<z.infer<typeof createAgeGroupSchema>>({
    resolver: zodResolver(createAgeGroupSchema),
    defaultValues: {
      ...defaultValues,
      competitionId,
    },
  });

  const onSubmit = (values: z.infer<typeof createAgeGroupSchema>) => {
    current ? update({ id: current.id, ...values }) : create(values);
  };

  useEffect(() => {
    form.reset(
      current
        ? current
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
          size="sm"
          onClick={() => {
            setIsOpen(true);
            reset();
          }}
        >
          <Plus />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Эхлэх он</FormLabel>
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
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дуусах он</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value || undefined}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cubeTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Төрөл</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(+value)}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Шооны төрөл сонгоно уу." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cubeTypes?.map((cubeType) => (
                        <SelectItem
                          key={"cube-type" + cubeType.id}
                          value={cubeType.id.toString()}
                        >
                          {cubeType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
