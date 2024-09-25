import { createClient } from '@supabase/supabase-js'
import { ChangeEvent } from 'react'
import { env } from '~/env'

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export const storage = supabase.storage.from('Storage')

export const getImageUrl = (path: string | null) => {
  if (!path) return ''
  const image = supabase.storage.from('Storage').getPublicUrl(path)
  return image.data.publicUrl
}

export const handleFileUpload = async (
  e: ChangeEvent<HTMLInputElement>,
  folder: string,
) => {
  const file = e.target.files?.item(0)

  if (!file) {
    return {
      data: null,
      error: null,
    }
  }

  const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
  const res = await storage.upload(`${folder}/` + fileName, file)

  return res
}
