import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { redirectNextCreatePage } from '~/components/create-buttons'
import { toast } from '~/components/ui/use-toast'
import { api } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'
import { CreateCompetitionInput, createCompetitionSchema } from '~/utils/zod'

export function useCompetitionForm() {
  const router = useRouter()
  const competitionId = useGetCompetitionId()
  const utils = api.useUtils()

  const form = useForm<CreateCompetitionInput>({
    resolver: zodResolver(createCompetitionSchema),
  })

  const { data: current } = api.competition.getById.useQuery(competitionId, {
    enabled: competitionId > 0,
  })

  const { mutate: create, isLoading: createLoading } =
    api.competition.create.useMutation({
      onSuccess: (data) => {
        utils.competition.getAll.invalidate()
        toast({
          title: 'Амжилттай бүртгэгдлээ.',
        })
        router.push(`/competitions/create/age-groups?competitionId=${data.id}`)
      },
      onError: (error) => {
        toast({
          title: 'Алдаа гарлаа',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: update, isLoading: updateLoading } =
    api.competition.update.useMutation({
      onSuccess: () => {
        utils.competition.getAll.invalidate()
        toast({
          title: 'Амжилттай шинэчлэгдлээ.',
        })
        redirectNextCreatePage(router)
      },
      onError: (error) => {
        toast({
          title: 'Алдаа гарлаа',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = (values: CreateCompetitionInput) => {
    if (current) {
      update({
        id: current.id,
        ...values,
      })
    } else {
      create(values)
    }
  }

  useEffect(() => {
    if (current) {
      form.reset({
        ...current,
        cubeTypes: current.competitionsToCubeTypes.map((i) => i.cubeTypeId),
      })
    } else {
      form.reset()
    }
  }, [current, form])

  return {
    form,
    onSubmit,
    isLoading: createLoading || updateLoading,
    isEditMode: !!current,
  }
}
