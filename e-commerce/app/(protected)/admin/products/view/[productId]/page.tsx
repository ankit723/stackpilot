import { getProductById } from "@/app/actions/admin/product/product"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import Link from "next/link"

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const product = await getProductById(productId)

  if (!product) {
    return <div>Product not found</div>
  }

  const {
    name,
    description,
    price,
    stock,
    sku,
    type,
    status,
    category,
    tags,
    children: variants,
    images,
    thumbnail,
  } = product

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">{name}</h1>
        <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{description}</p>
            </CardContent>
          </Card>

          {variants && variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map(variant => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          {variant.productFilterOptions
                            .map(pfo => pfo.filterOption.value)
                            .join(" / ")}
                        </TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell>₹{variant.price.toString()}</TableCell>
                        <TableCell>{variant.stock}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/products/view/${variant.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm">
                              <Link
                                href={`/admin/products/edit/${variant.id}`}
                              >
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {thumbnail && (
                <div className="relative aspect-square">
                  <Image
                    src={thumbnail.url}
                    alt="Thumbnail"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                  <Badge className="absolute top-1 right-1">Thumbnail</Badge>
                </div>
              )}
              {images.map(image => (
                <div key={image.id} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt="Product image"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Price</span>
                <span className="font-semibold">₹{price.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Stock</span>
                <span className="font-semibold">{stock}</span>
              </div>
              <div className="flex justify-between">
                <span>SKU</span>
                <span className="font-semibold">{sku}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Type</span>
                <span className="font-semibold">{type}</span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-semibold">{category.name}</span>
              </div>
              {tags && tags.length > 0 && (
                <div className="flex justify-between items-start">
                  <span>Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {tags.map(t => (
                      <Badge key={t.tag.id} variant="outline">
                        {t.tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}