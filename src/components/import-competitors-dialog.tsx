import parse from 'csv-simple-parser'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '~/utils/api'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { toast } from './ui/use-toast'

interface Props {
  competitionId: number
}

export default function ImportCompetitorsDialog({ competitionId }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | undefined>(undefined)

  const { mutate, isLoading } = api.competitor.importFromWca.useMutation({
    onSuccess: () => {
      toast({
        title: 'Амжилттай',
      })
      setOpen(false)
    },
  })

  const onSubmit = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Файлаа эхэлж оруулна уу',
      })
      return
    }

    const csv = parse(await file?.text(), { header: true })

    mutate({
      competitionId,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      data: csv as any,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Тамирчид оруулах</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Тамирчид оруулах</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Оруулах'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
