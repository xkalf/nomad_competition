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
};

export default function AgeGroupForm({
  current,
  reset,
  isOpen,
  setIsOpen,
  competitionId,
}: Props) {
  const utils = api.useUtils();

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
            <Button type="submit" disabled={createLoading || updateLoading}>
              Хадгалах
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
