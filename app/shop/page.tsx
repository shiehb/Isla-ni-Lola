import Link from "next/link"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductSearch from "@/components/product-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, getProductCategories } from "@/lib/products"
import SafeImage from "@/components/ui/safe-image"

export default async function Shop({ searchParams }: { searchParams: { query?: string; category?: string } }) {
  const searchQuery = searchParams.query || ""
  const selectedCategory = searchParams.category || "all"

  // Fetch categories first to ensure they exist
  const { data: categories, error: categoriesError } = await getProductCategories()

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
  }

  // Validate the selected category exists in our list
  const validCategory =
    selectedCategory !== "all" && categories?.includes(selectedCategory) ? selectedCategory : undefined

  // Fetch products with the validated category
  const { data: products, error: productsError } = await getProducts({
    searchQuery,
    category: validCategory,
  })

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop Banner */}
      <div className="w-full py-12 mb-8 flex items-center justify-center rounded-lg" style={{ background: "#d7c1a0" }}>
        <h1 className="text-5xl md:text-6xl font-pacifico text-white tracking-wide">MENU</h1>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <ProductSearch initialQuery={searchQuery} initialCategory={selectedCategory} categories={categories || []} />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Link
          href={`/shop?${searchQuery ? `query=${encodeURIComponent(searchQuery)}&` : ""}category=all`}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "all" ? "bg-gray-800 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          All
        </Link>
        {categories &&
          categories.map((category, index) => (
            <Link
              key={index}
              href={`/shop?${searchQuery ? `query=${encodeURIComponent(searchQuery)}&` : ""}category=${encodeURIComponent(
                category,
              )}`}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category ? "bg-gray-800 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {category}
            </Link>
          ))}
      </div>

      {/* Product Count */}
      <div className="mb-6 text-gray-600">
        Showing {products?.length || 0} product{(products?.length || 0) !== 1 ? "s" : ""}
        {searchQuery && <span> for "{searchQuery}"</span>}
        {selectedCategory !== "all" && <span> in {selectedCategory}</span>}
      </div>

      {/* Food Items Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <div className="w-full h-full relative">
                    <SafeImage
                      src={product.image_url || `/placeholder.svg?height=300&width=300`}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      fallbackSrc="/placeholder.svg?height=300&width=300"
                    />
                  </div>
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="font-medium text-lg mb-1 hover:text-gray-600">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                  <p className="font-bold mb-3">₱{Number(product.price).toFixed(2)}</p>
                </Link>
                <div className="flex justify-between items-center">
                  <AddToCartButton productId={product.id} />
                  <Link href={`/product/${product.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {selectedCategory !== "all"
              ? `No products found in ${selectedCategory} category`
              : "Try adjusting your search or filter criteria"}
          </p>
          <Link href="/shop">
            <Button>View All Products</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
