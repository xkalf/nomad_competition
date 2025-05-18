import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { api } from '~/utils/api'
import { Loader2 } from 'lucide-react'
import { toast } from './ui/use-toast'

interface Props {
  roundId: number
}

export default function ImportWcaLiveDialog({ roundId }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const { mutate, isLoading, data } = api.result.createFromWcaLive.useMutation({
    onSuccess: (data) => {
      if (data.notFoundCompetitors.length === 0) {
        setOpen(false)
      }
      toast({
        title: 'Амжилттай',
        description: `Нийт ${data.success} тамирчны мэдээлэл бүртгэгдлээ.`,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>WCA LIVE-аас оруулах</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WCA LIVE-аас оруулах</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[400px]"
            rows={15}
          />
        </div>
        {data?.notFoundCompetitors && (
          <div className="max-h-[150px] overflow-y-auto">
            <h2>Бүртгэл олдоогүй тамирчид</h2>
            <ol>
              {data.notFoundCompetitors?.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ol>
          </div>
        )}
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              mutate({
                roundId,
                htmlText: text,
              })
            }}
            disabled={isLoading}
          >
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
