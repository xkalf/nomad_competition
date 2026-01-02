import Image from 'next/image'
import { useState } from 'react'
import { getImageUrl, handleFileUpload } from '~/utils/supabase'
import { Input } from './input'
import { toast } from './use-toast'

interface FileUploadFieldProps {
  value?: string | null
  onChange: (value: string) => void
  accept?: string
  folder: string
  showPreview?: boolean
  previewAlt?: string
}

export function FileUploadField({
  value,
  onChange,
  accept,
  folder,
  showPreview = false,
  previewAlt = 'Uploaded file',
}: FileUploadFieldProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true)
    const { data, error } = await handleFileUpload(e, folder)

    if (data) {
      onChange(data.path)
    } else if (error) {
      toast({
        title: 'Алдаа гарлаа',
        description: error.message,
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  return (
    <>
      <Input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {showPreview && value && (
        <Image
          src={getImageUrl(value)}
          alt={previewAlt}
          width={150}
          height={150}
        />
      )}
    </>
  )
}
