import { useForm } from "react-hook-form";
import { z } from "zod";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { createCompetitionSchema } from "~/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/utils/api";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { competitions } from "~/server/db/schema";
import { useToast } from "~/components/ui/use-toast";
import { useState } from "react";

interface Props {
  current?: typeof competitions.$inferSelect;
}

export default function CompetitionCreateForm({ current }: Props) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const { mutate: create } = api.competition.create.useMutation({
    onSuccess: () => {
      utils.competition.getAll.invalidate();
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
  const { mutate: update } = api.competition.update.useMutation({
    onSuccess: () => {
      utils.competition.getAll.invalidate();
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

  const form = useForm<z.infer<typeof createCompetitionSchema>>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: { ...current },
  });

  const onSubmit = (values: z.infer<typeof createCompetitionSchema>) => {
    current ? update({ id: current.id, ...values }) : create(values);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>Шинэ тэмцээн бүртгэх</SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              name="maxCompetitors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тамирчны хязгаар</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
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
