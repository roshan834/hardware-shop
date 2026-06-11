import { supabase } from '../config/supabase'

export const getProducts = async ({
  page = 1,
  pageSize = 10,
  search = '',
  filter = '',
  category = ''
}) => {

  let table = 'products'

  if (filter === 'lowstock') {
    table = 'low_stock_products'
  }

  let query = supabase
    .from(table)
    .select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('product_name', `%${search}%`)
  }

   // CATEGORY FILTER
  if (category) {
    query = query.eq('category', category)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to)

  const { data, error, count } = await query

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

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category')

  if (error) return { data: [], error }

  // remove null + duplicates
  const categories = [
    ...new Set(data.map(item => item.category).filter(Boolean))
  ]

  return { data: categories, error: null }
}

export const getProductsByBarcode = async (barcode) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .single()

  return { data, error }
}