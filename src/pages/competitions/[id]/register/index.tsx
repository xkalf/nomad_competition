import { useRouter } from "next/router";
import CompetitionLayout from "../layout";
import { RouterOutputs, api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { competitionRegisterSchema } from "~/utils/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "~/components/ui/use-toast";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import LoadingScreen from "~/components/loading-screen";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const defaultValues: z.infer<typeof competitionRegisterSchema> = {
  competitionId: 0,
  cubeTypes: [],
  guestCount: 0,
};

type InvoiceResponse = RouterOutputs["payment"]["createInvoice"];

export default function CompetitionRegisterPage() {
  const utils = api.useUtils();
  const router = useRouter();
  const id = parseInt(router.query.id?.toString() || "0");
  const session = useSession();

  const [qpayResponse, setQpayResponse] = useState<InvoiceResponse | null>(
    null,
  );

  const { data: competition, isLoading } = api.competition.getById.useQuery(
    id,
    {
      enabled: id > 0,
    },
  );
  const { data: cubeTypes } = api.cubeTypes.getByCompetitionId.useQuery(+id, {
    enabled: +id > 0,
  });
  const mappedCubeTypes = cubeTypes?.map((i) => ({
    label: i.name,
    value: i.id.toString(),
  }));
  const { data: current } = api.competition.getRegisterByCompetitionId.useQuery(
    +id,
    {
      enabled: +id > 0,
      onSuccess: (data) => {
        if (!data) return;
        form.reset({
          competitionId: data?.competitionId,
          cubeTypes: data?.competitorsToCubeTypes.map((i) => i.cubeTypeId),
          guestCount: data?.guestCount,
        });
      },
    },
  );
  const { mutate: register, isLoading: registerLoading } =
    api.competition.register.useMutation({
      onSuccess: () => {
        utils.competition.getRegisterByCompetitionId.invalidate();
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
  const { mutate: updateRegister, isLoading: updateRegisterLoading } =
    api.competition.updateRegister.useMutation({
      onSuccess: () => {
        utils.competition.getRegisterByCompetitionId.invalidate();
        toast({
          title: "Амжилттай шинэчлэгдлээ.",
        });
      },
      onError(error) {
        toast({
          title: "Алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  const { mutate: createInvoice, isLoading: invoiceLoading } =
    api.payment.createInvoice.useMutation({
      onSuccess(data) {
        // window.open(data.qPay_shortUrl);
        setQpayResponse(data);
      },
      onError(error) {
        toast({
          title: "Алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const form = useForm<z.infer<typeof competitionRegisterSchema>>({
    resolver: zodResolver(competitionRegisterSchema),
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof competitionRegisterSchema>) => {
    current
      ? updateRegister({ id: current.id, ...values })
      : register({
          ...values,
          competitionId: +id,
        });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <CompetitionLayout>
      <h1 className="text-4xl capitalize">Бүртгүүлэх хүсэлт</h1>
      <p className="my-4">{competition?.registrationRequirments}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
          <FormField
            control={form.control}
            name="cubeTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Төрөл</FormLabel>
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
            name="guestCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Зочны тоо</FormLabel>
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
            name="competitionId"
            defaultValue={+id}
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center md:justify-start">
            {session.data?.user.id ? (
              <Button disabled={registerLoading || updateRegisterLoading}>
                {current ? "Шинэчлэх" : "Бүртгүүлэх"}
              </Button>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>
                  Бүртгүүлэхийн тулд эхэлж нэвтэрж орно уу.
                </AlertTitle>
              </Alert>
            )}
            {session?.data?.user.id && current && (
              <Button
                className="ml-2"
                type="button"
                disabled={invoiceLoading}
                onClick={() =>
                  createInvoice({
                    userId: session.data.user.id,
                    competitorId: current.id,
                    amount: "1000",
                  })
                }
              >
                Төлбөр төлөх
              </Button>
            )}
          </div>
        </form>
      </Form>
      {qpayResponse && (
        <div>
          <Image
            src={"data:image/png;base64, " + qpayResponse.qr_image}
            height={300}
            width={300}
            alt="qpay"
            className="hidden md:block"
          />
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-6 px-4 py-6 md:hidden">
            {qpayResponse.urls.map((i) => (
              <li key={i.name} className="w-1/3 md:w-auto">
                <Link href={i.link}>
                  <Image
                    src={i.logo}
                    alt={i.name}
                    width={100}
                    height={100}
                    className="mx-auto w-auto rounded-lg"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CompetitionLayout>
  );
}
