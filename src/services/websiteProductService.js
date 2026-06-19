import { supabase } from "../config/supabase"

export const getWebsiteProducts = async ({
  page = 1,
  pageSize = 12,
  search = "",
  category = "",
  sort = ""
}) => {

  let query = supabase
    .from("products")
    .select("*", {
      count: "exact"
    })
    .eq("is_active", true)

  if (search) {
    query = query.or(`
      product_name.ilike.%${search}%,
      barcode.ilike.%${search}%,
      product_code.ilike.%${search}%
    `)
  }

  if (category) {
    query = query.eq(
      "category",
      category
    )
  }

  if (sort === "low") {
    query = query.order(
      "selling_price",
      { ascending: true }
    )
  }

  if (sort === "high") {
    query = query.order(
      "selling_price",
      { ascending: false }
    )
  }

  const from =
    (page - 1) * pageSize

  const to =
    from + pageSize - 1

  query = query.range(from, to)

  return await query
}

export const deleteProduct = async (id) => {
  return await supabase
    .from('products')
    .update({ is_active: false, last_updated: new Date() })
    .eq('id', id)
}

export const getCategories = async () => {
  return await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
}

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