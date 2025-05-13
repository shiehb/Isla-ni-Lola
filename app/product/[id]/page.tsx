import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/products"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddToCartButton from "@/components/add-to-cart-button"
import SafeImage from "@/components/ui/safe-image"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data: product, error } = await getProductById(params.id)

  if (error || !product) {
    console.error("Error fetching product:", error)
    notFound()
  }

  // Fetch related products
  const { data: relatedProducts } = await getRelatedProducts(product.id, product.category)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/shop" className="text-gray-600 hover:text-gray-900">
          ← Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative">
          <SafeImage
            src={product.image_url || `/placeholder.svg?height=600&width=600`}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            fallbackSrc="/placeholder.svg?height=600&width=600"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.category}</p>
          <p className="text-2xl font-bold mb-6">₱{Number(product.price).toFixed(2)}</p>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-8">
            <AddToCartButton productId={product.id} size="lg" />
          </div>

          <Tabs defaultValue="details">
            <TabsList className="mb-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="text-gray-700">
              {product.details || "No details available for this product."}
            </TabsContent>
            <TabsContent value="ingredients" className="text-gray-700">
              {product.ingredients || "No ingredient information available for this product."}
            </TabsContent>
            <TabsContent value="nutrition" className="text-gray-700">
              {product.nutrition || "No nutritional information available for this product."}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/product/${relatedProduct.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <div className="w-full h-full relative">
                      <SafeImage
                        src={relatedProduct.image_url || `/placeholder.svg?height=300&width=300`}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        fallbackSrc="/placeholder.svg?height=300&width=300"
                      />
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/product/${relatedProduct.id}`} className="block">
                    <h3 className="font-medium text-lg mb-1 hover:text-gray-600">{relatedProduct.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{relatedProduct.category}</p>
                    <p className="font-bold">₱{Number(relatedProduct.price).toFixed(2)}</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
