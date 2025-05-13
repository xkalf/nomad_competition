import Layout from '~/components/layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { api } from '~/utils/api'
import CubeTypeForm from './form'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { toast } from '~/components/ui/use-toast'
import Image from 'next/image'
import { getImageUrl } from '~/utils/supabase'
import { useSession } from 'next-auth/react'
import DeleteButton from '~/components/delete-button'

export default function CubeTypesPage() {
  const utils = api.useUtils()
  const [selected, setSelected] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  useSession({
    required: true,
  })

  const { data } = api.cubeTypes.getAll.useQuery({})
  const { mutate: remove } = api.cubeTypes.delete.useMutation({
    onSuccess: () => {
      utils.cubeTypes.getAll.invalidate()
      toast({
        title: 'Амжилттай устгалаа.',
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

  const handleSelected = (id: number) => () => {
    setSelected(id)
    setIsOpen(true)
  }
  const handleRemove = (id: number) => () => remove(id)

  return (
    <Layout>
      <CubeTypeForm
        current={data?.find((i) => i.id === selected)}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        reset={() => setSelected(0)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Нэр</TableHead>
            <TableHead>Зураг</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={`${item.id}-${item.name}`}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.image && (
                  <Image
                    src={getImageUrl(item.image) || ''}
                    width={50}
                    height={50}
                    priority
                    alt={item.name}
                  />
                )}
              </TableCell>
              <TableCell className="space-x-2">
                <Button onClick={handleSelected(item.id)}>Засах</Button>
                <DeleteButton
                  onConfirm={handleRemove(item.id)}
                  description={`${item.name} төрлийг устгахдаа итгэлтэй байна уу?`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Layout>
  )
}
