import { supabase } from '../config/supabase'

/* ---------------- PRODUCTS LIST ---------------- */
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
    .eq('is_active', true)

  if (search) {
    query = query.ilike('product_name', `%${search}%`)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to)

  return await query
}

/* ---------------- ADD PRODUCT ---------------- */
export const addProduct = async (product) => {
  return await supabase
    .from('products')
    .insert([product])
}

/* ---------------- SOFT DELETE ---------------- */
export const deleteProduct = async (id) => {
  return await supabase
    .from('products')
    .update({ is_active: false, last_updated: new Date() })
    .eq('id', id)
}

/* ---------------- GET BY ID (FIXED) ---------------- */
export const getProductById = async (id) => {
  return await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
}

/* ---------------- UPDATE ---------------- */
export const updateProduct = async (id, product) => {
  return await supabase
    .from('products')
    .update({
      ...product,
      last_updated: new Date()
    })
    .eq('id', id)
}

/* ---------------- IMAGE URL (FIXED) ---------------- */
export const getImageUrl = (productCode) => {
  if (!productCode) return null

  const formats = ['jpg', 'jpeg', 'png']

  for (let ext of formats) {
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(`${productCode}.${ext}`)

    if (data?.publicUrl) return data.publicUrl
  }

  return null
}

/* ---------------- CATEGORIES (OPTIMIZED) ---------------- */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)

  if (error) return { data: [] }

  const unique = [...new Set(
    data.map(p => p.category?.trim()).filter(Boolean)
  )]

  return { data: unique }
}

/* ---------------- BARCODE SEARCH (FIXED) ---------------- */
export const getProductsByBarcode = async (barcode) => {
  return await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .eq("is_active", true)
    .single()
}