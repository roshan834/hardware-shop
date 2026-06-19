import {
    useState,
    useEffect
} from "react"

import ProductCard from "../../components/website/ProductCard"

import Pagination from "../../components/website/Pagination"

import {
    getWebsiteProducts,
    getCategories
}
    from "../../services/websiteProductService"

import WebsiteHeader from "../../components/website/WebsiteHeader"

import WebsiteFooter from "../../components/website/WebsiteFooter"

import "../../styles/website/Products.css"

const Products = () => {

    const [products, setProducts] =
        useState([])

    const [categories, setCategories] =
        useState([])

    const [search, setSearch] =
        useState("")

    const [category, setCategory] =
        useState("")

    const [sort, setSort] =
        useState("")

    const [page, setPage] =
        useState(1)

    const [totalPages,
        setTotalPages] =
        useState(1)

    const pageSize = 12

    useEffect(() => {
        loadProducts()
    }, [
        page,
        search,
        category,
        sort
    ])

    useEffect(() => {
        loadCategories()
    }, [])

    const loadProducts =
        async () => {

            const {
                data,
                count
            } =
                await getWebsiteProducts({
                    page,
                    pageSize,
                    search,
                    category,
                    sort
                })

            setProducts(data || [])

            setTotalPages(
                Math.ceil(
                    count / pageSize
                )
            )
        }

    const loadCategories =
        async () => {

            const { data } =
                await getCategories()

            const unique =
                [...new Set(
                    data.map(
                        item => item.category
                    )
                )]

            setCategories(unique)
        }

    return (
        <>
            <WebsiteHeader />

            <div className="products-page">

                <div className="products-top">

                    <input
                        type="text"
                        placeholder="Search Product..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            All Categories
                        </option>

                        {
                            categories.map(cat => (
                                <option
                                    key={cat}
                                    value={cat}
                                >
                                    {cat}
                                </option>
                            ))
                        }

                    </select>

                    <select
                        value={sort}
                        onChange={(e) =>
                            setSort(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            Sort
                        </option>

                        <option value="low">
                            Price Low
                        </option>

                        <option value="high">
                            Price High
                        </option>

                    </select>

                </div>

                <div className="products-grid">

                    {
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))
                    }

                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />

            </div>

            <WebsiteFooter />
        </>
    )
}

export default Products