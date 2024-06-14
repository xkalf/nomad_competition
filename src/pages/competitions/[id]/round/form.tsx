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
import { createRoundSchema } from "~/utils/zod";

type Current = RouterOutputs["round"]["getByCompetitionId"][number];

interface Props {
  current?: Current;
  reset: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  competitionId: number;
}

const defaultValues: z.infer<typeof createRoundSchema> = {
  competitionId: 0,
  cubeTypeId: 0,
  name: "",
  nextCompetitor: 0,
};

export default function RoundForm({
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

  const { mutate: create } = api.round.create.useMutation({
    onSuccess: () => {
      utils.round.getByCompetitionId.invalidate(competitionId);
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
  const { mutate: update } = api.round.update.useMutation({
    onSuccess: () => {
      utils.round.getByCompetitionId.invalidate(competitionId);
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

  const form = useForm<z.infer<typeof createRoundSchema>>({
    resolver: zodResolver(createRoundSchema),
    defaultValues: {
      ...defaultValues,
      competitionId,
    },
  });

  const onSubmit = (values: z.infer<typeof createRoundSchema>) => {
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
        ? { ...current }
        : {
          ...defaultValues,
          competitionId,
        },
    );
  }, [current, form, competitionId]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            setIsOpen(true);
            reset();
          }}
        >
          Round Бүртгэх
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <SelectValue />
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
