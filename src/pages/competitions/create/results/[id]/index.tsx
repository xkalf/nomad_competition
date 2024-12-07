import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CreateLinks from "~/components/create-links";
import Layout from "~/components/layout";
import { Form, FormFieldCustom, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createResultSchema } from "~/utils/zod";

export default function ResultsPage() {
  const form = useForm({
    resolver: zodResolver(createResultSchema),
  });

  return (
    <Layout>
      <CreateLinks />
      <div className="grid grid-cols-12">
        <div className="col-span-4">
          <Form {...form}>
            <FormFieldCustom
              control={form.control}
              name="solve1"
              label="Эвлүүлэлт 1"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="solve2"
              label="Эвлүүлэлт 2"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="solve3"
              label="Эвлүүлэлт 3"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="solve4"
              label="Эвлүүлэлт 4"
              render={({ field }) => <Input {...field} />}
            />
            <FormFieldCustom
              control={form.control}
              name="solve5"
              label="Эвлүүлэлт 5"
              render={({ field }) => <Input {...field} />}
            />
          </Form>
        </div>
      </div>
    </Layout>
  );
}
