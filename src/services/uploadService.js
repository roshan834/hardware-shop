import { supabase } from '../config/supabase'

export const uploadImage = async (file) => {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase
    .storage
    .from('product-images')
    .upload(fileName, file)

  if (error) return { error }

  const { data: publicUrlData } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { url: publicUrlData.publicUrl }
}