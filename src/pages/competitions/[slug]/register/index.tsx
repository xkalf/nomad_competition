import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingScreen from "~/components/loading-screen";
import { Alert, AlertTitle } from "~/components/ui/alert";
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
import { MultiSelect } from "~/components/ui/multi-select";
import { toast } from "~/components/ui/use-toast";
import { RouterOutputs, api } from "~/utils/api";
import { competitionRegisterSchema } from "~/utils/zod";
import CompetitionLayout from "../layout";
import { useGetCompetitionSlug } from "~/utils/hooks";

const defaultValues: z.infer<typeof competitionRegisterSchema> = {
  competitionId: 0,
  cubeTypes: [],
  guestCount: 0,
};

type InvoiceResponse = RouterOutputs["payment"]["createInvoice"];

export default function CompetitionRegisterPage() {
  const router = useRouter();
  const slug = useGetCompetitionSlug();
  const session = useSession();

  const [qpayResponse, setQpayResponse] = useState<InvoiceResponse | null>(
    null,
  );

  const { data: competition, isLoading } = api.competition.getBySlug.useQuery(
    slug,
    {
      enabled: !!slug,
    },
  );

  const {
    data: current,
    isLoading: currentLoading,
    refetch: currentRefetch,
  } = api.competition.getRegisterByCompetitionId.useQuery(
    competition?.id ?? 0,
    {
      enabled: !!competition?.id,
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
        currentRefetch();
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
        currentRefetch();
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

  api.payment.cronInvoice.useQuery(qpayResponse?.invoice_id || "", {
    enabled: !!qpayResponse,
    refetchInterval: 1000,
    onSuccess: (data) => {
      if (data === true) {
        router.push(`/competitions/${slug}/registrations?isVerified=true`);
        toast({
          title: "Амжилттай төлөгдлөө.",
        });
      }
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
          competitionId: competition?.id ?? 0,
        });
  };

  const mappedCubeTypes = useMemo(() => {
    return (
      competition?.competitionsToCubeTypes
        .map((i) => i.cubeType)
        ?.map((i) => ({
          label: i.name,
          value: i.id.toString(),
        })) || []
    );
  }, [competition]);

  const freeTypes = useMemo(() => {
    const filtered = competition?.competitionsToCubeTypes
      .map((i) => i.cubeType)
      ?.filter(
        (cubeType) =>
          !competition.fees?.map((fee) => fee.cubeTypeId).includes(cubeType.id),
      )
      .sort((a, b) => a.order - b.order);
    return filtered || [];
  }, [competition]);

  const totalAmount = useMemo(() => {
    if (!competition || !current) return 0;

    const baseFee = competition.baseFee;
    const guestFee =
      current.guestCount < competition.freeGuests
        ? 0
        : (current?.guestCount - competition?.freeGuests) *
          +competition.guestFee;
    const cubeTypesFee = competition.fees
      .filter((fee) =>
        current.competitorsToCubeTypes
          .map((i) => i.cubeTypeId)
          .includes(fee.cubeTypeId),
      )
      .reduce((a, b) => a + +b.amount, 0);

    return +baseFee + +guestFee + +cubeTypesFee;
  }, [competition, current]);

  if (isLoading || currentLoading) {
    return <LoadingScreen />;
  }

  return (
    <CompetitionLayout>
      <h1 className="mb-4 text-4xl capitalize">Бүртгүүлэх хүсэлт</h1>
      <p className="text-lg">
        Бүртгэлийн суурь хураамж {competition?.baseFee}₮ ба үүнд:
      </p>
      <p>
        - {freeTypes.map((i) => i.name).join(", ")}(шооны {freeTypes.length}{" "}
        төрөл багтана.)
      </p>
      <p className="mt-2 text-lg">Бусад төрлүүд нэмэлт хураамжтай ба үүнд:</p>
      {competition?.fees
        .sort((a, b) => a.cubeType.order - b.cubeType.order)
        .map((fee) => (
          <p key={"fee" + fee.id}>
            - {fee.cubeType.name} = {fee.amount}₮
          </p>
        ))}
      {competition?.registrationRequirments && (
        <p className="my-4 rounded-lg border border-red-500 p-4">
          {competition?.registrationRequirments}
        </p>
      )}
      <p className="mt-2 text-lg">
        Зочны мандатны хураамж = {competition?.guestFee}₮
      </p>
      <p className="mt-2 text-lg">
        Хаанбанк данс: 5085536671 Данс эзэмшигч: Н.Сэргэлэнбат
      </p>
      <p>
        Гүйлгээний утга: Тамирчны овог нэр, холбоо барих дугаарыг заавал бична
        үү,
      </p>
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
            defaultValue={competition?.id}
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
            {session?.data?.user.id &&
              current &&
              current.invoices.reduce((a, b) => a + +b.amount, 0) <
                totalAmount && (
                <>
                  <Button
                    className="ml-2"
                    type="button"
                    disabled={invoiceLoading || !!qpayResponse}
                    onClick={() =>
                      createInvoice({
                        userId: session.data.user.id,
                        competitorId: current.id,
                        amount: (
                          totalAmount -
                          current.invoices.reduce((a, b) => a + +b.amount, 0)
                        ).toString(),
                      })
                    }
                  >
                    Төлбөр төлөх
                  </Button>
                </>
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
