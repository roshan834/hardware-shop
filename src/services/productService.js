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

  if (search.trim() !== '') {
    query = query.or(
      `product_name.ilike.%${search}%,product_code.ilike.%${search}%,category.ilike.%${search}%,brand.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
    .order('id', { ascending: false })
    .range(from, to)

  return {
    data,
    error,
    count
  }
}

export const addProduct = async (product) => {
  return await supabase
    .from('products')
    .insert([product])
}

export const deleteProduct = async (id) => {
  return await supabase
    .from('products')
    .delete()
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