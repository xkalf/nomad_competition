import { useMemo, useState } from 'react'
import Layout from '~/components/layout'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { toast } from '~/components/ui/use-toast'
import { api } from '~/utils/api'
import { RouterOutputs } from '~/utils/api'
import { useGetCompetitionId } from '~/utils/hooks'

type Competitor = RouterOutputs['competitor']['getByCompetitionId'][number]

export default function CompetitorsPage() {
  const competitionId = useGetCompetitionId()
  const utils = api.useUtils()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null,
  )
  const [filterProvinceId, setFilterProvinceId] = useState<
    string | 'null' | 'all'
  >('all')

  const { data: competitors } = api.competitor.getByCompetitionId.useQuery(
    {
      competitionId: competitionId,
      isVerified: true,
    },
    {
      enabled: competitionId > 0,
    },
  )

  const { data: provinces } = api.competitor.getProvinces.useQuery()

  const filteredCompetitors = useMemo(() => {
    if (!competitors) return []
    if (filterProvinceId === 'all') return competitors
    if (filterProvinceId === 'null') {
      return competitors.filter((c) => !c.provinceId)
    }
    return competitors.filter((c) => c.provinceId === filterProvinceId)
  }, [competitors, filterProvinceId])

  const { mutate: updateProvinceIds, isLoading: isUpdating } =
    api.competitor.updateProvinceIds.useMutation({
      onSuccess: () => {
        utils.competitor.getByCompetitionId.invalidate({
          competitionId: competitionId,
          isVerified: true,
        })
        setSelectedIds([])
        setSelectedProvinceId(null)
        toast({
          title: 'Амжилттай шинэчлэгдлээ.',
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

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleSelectAll = () => {
    if (filteredCompetitors) {
      const filteredIds = filteredCompetitors.map((c) => c.id)
      const allFilteredSelected = filteredIds.every((id) =>
        selectedIds.includes(id),
      )
      if (allFilteredSelected) {
        setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
      } else {
        setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])])
      }
    }
  }

  const handleUpdate = () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'Алдаа',
        description: 'Хаад өөрчилөхийн тулд тамирчдыг сонгоно уу.',
        variant: 'destructive',
      })
      return
    }

    updateProvinceIds({
      competitorIds: selectedIds,
      provinceId: selectedProvinceId,
    })
  }

  const getProvinceName = (provinceId: string | null | undefined) => {
    if (!provinceId) return '-'
    return provinces?.find((p) => p.id === provinceId)?.name ?? '-'
  }

  const isAllFilteredSelected =
    filteredCompetitors.length > 0 &&
    filteredCompetitors.every((c) => selectedIds.includes(c.id))

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Тамирчдын хаад шинэчлэх</h1>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Шүүлт:</span>
            <Select
              value={filterProvinceId}
              onValueChange={(value) => {
                setFilterProvinceId(value as 'all' | 'null' | string)
                setSelectedIds([])
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Хот/Аймаг шүүлт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүгд</SelectItem>
                <SelectItem value="null">Аймаггүй</SelectItem>
                {provinces?.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedProvinceId ?? 'none'}
            onValueChange={(value) =>
              setSelectedProvinceId(value === 'none' ? null : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Хот/Аймаг сонгох" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Аймаг устгах</SelectItem>
              {provinces?.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleUpdate}
            disabled={isUpdating || selectedIds.length === 0}
          >
            {isUpdating ? 'Шинэчлэж байна...' : 'Шинэчлэх'}
          </Button>

          <div className="text-sm text-muted-foreground">
            {selectedIds.length > 0 &&
              `${selectedIds.length} тамирчин сонгогдсон`}
            {filteredCompetitors.length > 0 && (
              <span className="ml-2">
                ({filteredCompetitors.length} тамирчин харуулж байна)
              </span>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllFilteredSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Овог</TableHead>
                <TableHead>Нэр</TableHead>
                <TableHead>WCA ID</TableHead>
                <TableHead>Хот/Аймаг</TableHead>
                <TableHead>Төрөл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetitors && filteredCompetitors.length > 0 ? (
                filteredCompetitors.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(competitor.id)}
                        onCheckedChange={() =>
                          handleToggleSelect(competitor.id)
                        }
                      />
                    </TableCell>
                    <TableCell>{competitor.verifiedId ?? '-'}</TableCell>
                    <TableCell>{competitor.user?.lastname ?? '-'}</TableCell>
                    <TableCell>{competitor.user?.firstname ?? '-'}</TableCell>
                    <TableCell>{competitor.user?.wcaId ?? '-'}</TableCell>
                    <TableCell>
                      {getProvinceName(competitor.provinceId)}
                    </TableCell>
                    <TableCell>
                      {competitor.competitorsToCubeTypes
                        ?.map((ct) => ct.cubeType?.name)
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Тамирчдын мэдээлэл олдсонгүй
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  )
}
