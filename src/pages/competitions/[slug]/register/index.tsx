import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import LoadingScreen from '~/components/loading-screen'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { toast } from '~/components/ui/use-toast'
import { RouterOutputs, api } from '~/utils/api'
import { competitionRegisterSchema } from '~/utils/zod'
import CompetitionLayout from '../layout'
import { useGetCompetitionSlug } from '~/utils/hooks'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { supabase } from '~/utils/supabase'
import { Tables } from '~/utils/database.types'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '~/components/ui/select'

const defaultValues: z.infer<typeof competitionRegisterSchema> = {
  competitionId: 0,
  cubeTypes: [],
  guestCount: 0,
}

type InvoiceResponse = RouterOutputs['payment']['createInvoice']

export default function CompetitionRegisterPage() {
  const router = useRouter()
  const slug = useGetCompetitionSlug()
  const session = useSession()
  const utils = api.useUtils()

  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [qpayResponse, setQpayResponse] = useState<InvoiceResponse | null>(null)

  const { data: competition, isLoading } = api.competition.getBySlug.useQuery(
    slug,
    {
      enabled: !!slug,
    },
  )

  const { data: current } = api.competition.getRegisterByCompetitionId.useQuery(
    competition?.id ?? 0,
    {
      enabled: !!competition?.id && !!session.data?.user,
      onSuccess: (data) => {
        if (!data) return
        const school = schools?.find((i) => i.id === data.schoolId)
        setProvince(school?.provinceId ?? '')
        setDistrict(school?.districtId ?? '')
        form.reset({
          competitionId: data?.competitionId,
          cubeTypes: data?.competitorsToCubeTypes
            .filter((i) => i.status !== 'Cancelled')
            .map((i) => i.cubeTypeId),
          guestCount: data?.guestCount,
          schoolId: data.schoolId,
        })
      },
    },
  )

  const { data: totalAmount } = api.competitor.getTotalAmount.useQuery(
    current?.id ?? 0,
    {
      enabled: !!current?.id,
    },
  )

  const { data: provinces } = api.competitor.getProvinces.useQuery()
  const { data: districts } = api.competitor.getDistricts.useQuery(province, {
    enabled: !!province,
  })
  const { data: schools } = api.competitor.getSchools.useQuery(district, {
    enabled: !!district,
  })

  const { mutate: register, isLoading: registerLoading } =
    api.competition.register.useMutation({
      onSuccess: () => {
        utils.competition.getRegisterByCompetitionId.invalidate()
        utils.competitor.getTotalAmount.invalidate()
        toast({
          title: 'Амжилттай бүртгэгдлээ.',
        })
      },
      onError: (error) => {
        toast({
          title: 'Алдаа гарлаа',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  const { mutate: updateRegister, isLoading: updateRegisterLoading } =
    api.competition.updateRegister.useMutation({
      onSuccess: () => {
        utils.competition.getRegisterByCompetitionId.invalidate()
        utils.competitor.getTotalAmount.invalidate()
        setQpayResponse(null)
        toast({
          title: 'Амжилттай шинэчлэгдлээ.',
        })
      },
      onError(error) {
        toast({
          title: 'Алдаа гарлаа',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  const { mutate: createInvoice, isLoading: invoiceLoading } =
    api.payment.createInvoice.useMutation({
      onSuccess(data) {
        setQpayResponse(data)
      },
      onError(error) {
        toast({
          title: 'Алдаа гарлаа',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  const { mutate: checkLastInvoice, isLoading: checkLastInvoiceLoading } =
    api.payment.checkLastInvoice.useMutation({
      onSuccess: (data) => {
        if (data.success === true) {
          router.push(`/competitions/${slug}/registrations?isVerified=true`)
          toast({
            title: 'Амжилттай төлөгдлөө.',
          })
        }
      },
    })

  const form = useForm<z.infer<typeof competitionRegisterSchema>>({
    resolver: zodResolver(competitionRegisterSchema),
    defaultValues,
  })

  const onSubmit = (values: z.infer<typeof competitionRegisterSchema>) => {
    current
      ? updateRegister({ id: current.id, ...values })
      : register({
          ...values,
          competitionId: competition?.id ?? 0,
        })
  }

  const freeTypes = useMemo(() => {
    const filtered = competition?.competitionsToCubeTypes
      .map((i) => i.cubeType)
      ?.filter(
        (cubeType) =>
          !competition.fees?.map((fee) => fee.cubeTypeId).includes(cubeType.id),
      )
      .sort((a, b) => a.order - b.order)
    return filtered || []
  }, [competition])

  const paidTypes = useMemo(() => {
    return (
      current?.competitorsToCubeTypes
        .filter((i) => i.status === 'Paid')
        .map((i) => i.cubeType)
        .sort((a, b) => a.order - b.order) ?? []
    )
  }, [current])

  const cancelledTypes = useMemo(() => {
    return (
      current?.competitorsToCubeTypes
        .filter((i) => i.status === 'Cancelled')
        .map((i) => i.cubeType)
        .sort((a, b) => a.order - b.order) ?? []
    )
  }, [current])

  const createdTypes = useMemo(() => {
    const selected = form.watch('cubeTypes')

    return (
      competition?.competitionsToCubeTypes
        .map((i) => i.cubeType)
        .filter(
          (i) =>
            selected.includes(i.id) &&
            !paidTypes.map((j) => j.id).includes(i.id),
        ) ?? []
    )
  }, [competition, form.watch('cubeTypes'), paidTypes])

  useEffect(() => {
    const channel = supabase
      .channel(`invoice-check`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'nomad_competition_invoices',
          filter: `invoice_code=eq.${qpayResponse?.invoice_id}`,
        },
        async (payload) => {
          const data = payload.new as Tables<'nomad_competition_invoices'>

          if (data.is_paid === true) {
            toast({
              title: 'Амжилттай төлөгдлөө.',
            })
            await router.push(
              `/competitions/${slug}/registrations?isVerified=true`,
            )
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [qpayResponse])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <CompetitionLayout>
      <h1 className="mb-4 text-4xl capitalize">Бүртгүүлэх хүсэлт</h1>
      <p className="text-lg">
        Бүртгэлийн суурь хураамж {competition?.baseFee}₮ ба үүнд:
      </p>
      <p>
        - {freeTypes.map((i) => i.name).join(', ')}(шооны {freeTypes.length}{' '}
        төрөл багтана.)
      </p>
      <p className="mt-2 text-lg">Бусад төрлүүд нэмэлт хураамжтай ба үүнд:</p>
      {competition?.fees
        .sort((a, b) => a.cubeType.order - b.cubeType.order)
        .map((fee) => (
          <p key={'fee' + fee.id}>
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
          <FormField
            control={form.control}
            name="cubeTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Төрөл
                  {paidTypes.length > 0 && (
                    <p>
                      Баталгаажсан төрлүүд : (
                      {paidTypes.map((i) => i.name).join(', ')})
                    </p>
                  )}
                  {cancelledTypes.length > 0 && (
                    <p>
                      Цуцалсан төрлүүд : (
                      {cancelledTypes.map((i) => i.name).join(', ')})
                    </p>
                  )}
                  {createdTypes.length > 0 && (
                    <p>
                      (Сонгогдсон төрлүүд : (
                      {createdTypes.map((i) => i.name).join(', ')})
                    </p>
                  )}
                </FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="block">Төрөл сонгох</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {competition?.competitionsToCubeTypes
                        ?.map((i) => i.cubeType)
                        .map((cubeType) => (
                          <DropdownMenuCheckboxItem
                            key={cubeType.id}
                            checked={field.value?.includes(cubeType.id)}
                            onCheckedChange={(value) => {
                              if (!field.value) {
                                field.value = []
                              }

                              if (value && !field.value.includes(cubeType.id)) {
                                field.onChange([...field.value, cubeType.id])
                              } else if (
                                !value &&
                                field.value.includes(cubeType.id)
                              ) {
                                field.onChange(
                                  field.value.filter(
                                    (id) => id !== cubeType.id,
                                  ),
                                )
                              }
                            }}
                          >
                            {cubeType.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            name="schoolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сургууль</FormLabel>
                <FormControl>
                  <div className="gap-4 grid grid-cols-3">
                    <Select
                      value={province}
                      onValueChange={(value) => {
                        setProvince(value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Хот/Аймаг сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces?.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="Дүүрэг/Сум сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts?.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(+value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Сургууль сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools?.map((i) => (
                          <SelectItem key={i.school} value={i.id.toString()}>
                            {i.school}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                {current ? 'Шинэчлэх' : 'Бүртгүүлэх'}
              </Button>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>
                  Бүртгүүлэхийн тулд эхэлж нэвтэрж орно уу.
                </AlertTitle>
              </Alert>
            )}
            {session?.data?.user.id && (totalAmount || 0) > 0 && current && (
              <>
                <Button
                  className="ml-2"
                  type="button"
                  disabled={invoiceLoading || !!qpayResponse}
                  onClick={() =>
                    createInvoice({
                      userId: session.data.user.id,
                      competitorId: current.id,
                    })
                  }
                >
                  Төлбөр төлөх
                </Button>
              </>
            )}
            {session.data?.user.id && (
              <Button
                className="ml-2"
                type="button"
                disabled={checkLastInvoiceLoading}
                onClick={() => checkLastInvoice()}
              >
                Төлбөр шалгах
              </Button>
            )}
          </div>
        </form>
      </Form>
      {qpayResponse && (
        <div>
          <Image
            src={'data:image/png;base64, ' + qpayResponse.qr_image}
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
  )
}
