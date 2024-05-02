import { zodResolver } from "@hookform/resolvers/zod";
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
import { createFeeSchema } from "~/utils/zod";

type Current = RouterOutputs["fee"]["getByCompetitionId"][number];

interface Props {
  current?: Current;
  reset: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  competitionId: number;
}

const defaultValues: z.infer<typeof createFeeSchema> = {
  amount: "0",
  competitionId: 0,
  cubeTypeId: 0,
};

export default function FeeCreateForm({
  current,
  reset,
  isOpen,
  setIsOpen,
  competitionId,
}: Props) {
  const utils = api.useUtils();

  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(
    competitionId,
    {
      enabled: competitionId > 0,
    },
  );
  const { mutate: create, isLoading: createLoading } =
    api.fee.create.useMutation({
      onSuccess: () => {
        utils.fee.getByCompetitionId.invalidate(competitionId);
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
    api.fee.update.useMutation({
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

  const form = useForm<z.infer<typeof createFeeSchema>>({
    resolver: zodResolver(createFeeSchema),
    defaultValues: {
      ...defaultValues,
      competitionId,
    },
  });

  const onSubmit = (values: z.infer<typeof createFeeSchema>) => {
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
          Шинэ бүртгэлийн хураамж бүртгэх
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="cubeTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Шооны төрөл</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(+value)}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cubeTypes?.map((cubeType) => (
                        <SelectItem
                          key={cubeType.name}
                          value={cubeType.id.toString()}
                        >
                          {cubeType.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="m@google.com">m@google.com</SelectItem>
                      <SelectItem value="m@support.com">
                        m@support.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Үнийн дүн</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
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
