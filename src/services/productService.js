import { supabase } from '../config/supabase'

export const getProducts = async (
  page = 1,
  pageSize = 10,
  search = ''
) => {

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)           //  only active products

  if (search.trim() !== '') {
    query = query.or(
      `product_name.ilike.%${search}%,product_code.ilike.%${search}%,category.ilike.%${search}%,brand.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
    .order('id', { ascending: false })
    .range(from, to)

  return { data, error, count }
}

export const addProduct = async (product) => {
  return await supabase
    .from('products')
    .insert([product])
}

// soft delete — set is_active to false
export const deleteProduct = async (id) => {
  return await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
}

export const getProductById = async (id) => {
  return await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
}

export const updateProduct = async (id, product) => {
  return await supabase
    .from('products')
    .update(product)
    .eq('id', id)
}

//  get public image URL from storage bucket
export const getImageUrl = (productCode, ext = null) => {
  if (!productCode) return null

  // if ext provided, use it directly
  if (ext) {
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(`${productCode}.${ext}`)
    return data.publicUrl
  }

  // try jpg by default
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(`${productCode}.jpg`)

  return data.publicUrl
}