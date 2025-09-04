"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProductById, updateProduct } from "@/app/actions/admin/product/product"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Category, ProductStatus, Tag } from "@prisma/client"
import { getCategories } from "@/app/actions/admin/category/category"
import { getTags } from "@/app/actions/admin/tag/tags"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X } from "lucide-react"
import { CategoryTree } from "@/app/components/category-tree"
import { AllImages } from "@/app/components/all-images"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { removeSingleImageFromProduct } from "@/app/actions/image/image"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["SIMPLE", "CONFIGURABLE"]),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be a positive number"),
  status: z.nativeEnum(ProductStatus),
  categoryId: z.string().min(1, "A category must be selected"),
  tags: z.array(z.string()).optional(), 
})

type ProductFormValues = z.infer<typeof ProductSchema>

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false)
  
  const router = useRouter()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
  })

  const fetchData = async () => {
    const [productData, cats, allTags] = await Promise.all([
      getProductById(productId),
      getCategories(),
      getTags(),
    ])
    setProduct(productData)
    setCategories(cats)
    if (allTags.tags) {
      setTags(allTags.tags)
    }

    if (productData) {
      form.reset({
        name: productData.name,
        description: productData.description || "",
        sku: productData.sku || "",
        type: productData.type,
        price: Number(productData.price),
        stock: productData.stock,
        status: productData.status,
        categoryId: productData.categoryId,
        tags: productData.tags.map((t: any) => t.tagId),
      })
      setSelectedTags(productData.tags.map((t: any) => t.tagId))
    }
  }

  useEffect(() => {
    fetchData()
  }, [productId, form])

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tags, ...productData } = data
      await updateProduct(productId, productData, selectedTags)
      toast.success("Product updated successfully!")
      router.push(`/admin/products/view/${productId}`)
    } catch (err) {
      console.error("Product update error:", err)
      toast.error("Failed to update product.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const deleteImage = async (imageId: string) => {
    toast.loading("Removing image...")
    try {
        //optimistic update
        const newImages = product.images.filter((img: any) => img.id !== imageId)
        setProduct({...product, images: newImages})
        await removeSingleImageFromProduct(productId, imageId)
        toast.success("Image removed successfully")
    } catch (err) {
      console.error("Error removing image:", err)
      toast.error("Failed to remove image")
    } finally {
      toast.dismiss()
    }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

            {product.children && product.children.length > 0 && (
                 <Card>
                    <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
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
                                {product.children.map((variant: any) => (
                                    <TableRow key={variant.id}>
                                        <TableCell>{variant.productFilterOptions.map((pfo: any) => pfo.filterOption.value).join(" / ")}</TableCell>
                                        <TableCell>{variant.sku}</TableCell>
                                        <TableCell>₹{variant.price.toString()}</TableCell>
                                        <TableCell>{variant.stock}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button asChild variant="outline" size="sm"><Link href={`/admin/products/view/${variant.id}`}>View</Link></Button>
                                                <Button asChild variant="secondary" size="sm"><Link href={`/admin/products/edit/${variant.id}`}>Edit</Link></Button>
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
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <div className="mt-2">
                        {product.thumbnail ? (
                            <div className="relative w-32 h-32">
                                <Image src={product.thumbnail.url} alt="Thumbnail" layout="fill" objectFit="cover" className="rounded-md" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center">No Image</div>
                        )}
                         <Button type="button" variant="link" onClick={() => setIsThumbnailModalOpen(true)}>Change Thumbnail</Button>
                    </div>
                </div>
                 <div>
                    <FormLabel>Product Images</FormLabel>
                     <div className="mt-2 grid grid-cols-4 gap-4">
                        {product.images.map((img: any) => (
                            <div key={img.id} className="relative w-32 h-32">
                                <Image src={img.url} alt="Product Image" layout="fill" objectFit="cover" className="rounded-md" />
                                <Button size="icon" className="absolute top-2 right-2 hover:bg-primary bg-transparent text-primary hover:text-white" onClick={() => {
                                    deleteImage(img.id)
                                    fetchData()
                                }}><X className="w-10 h-10" /></Button>
                            </div>
                        ))}
                     </div>
                     <Button type="button" variant="link" onClick={() => setIsImageModalOpen(true)}>Add/Remove Images</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
               <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="stock" render={({ field }) => (<FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="sku" render={({ field }) => (<FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Product Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="SIMPLE">Simple</SelectItem><SelectItem value="CONFIGURABLE">Configurable</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Product Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.values(ProductStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><CategoryTree categories={categories} selectedCategoryId={field.value} onSelectCategory={(id) => form.setValue("categoryId", id, { shouldValidate: true})} /><FormMessage /></FormItem>)} />
                 <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Button type="button" key={tag.id} variant={selectedTags.includes(tag.id) ? "default" : "outline"} onClick={() => {
                          const newSelectedTags = selectedTags.includes(tag.id) ? selectedTags.filter(t => t !== tag.id) : [...selectedTags, tag.id];
                          setSelectedTags(newSelectedTags);
                          form.setValue("tags", newSelectedTags);
                      }}>{tag.name}</Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
    {isThumbnailModalOpen &&
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-secondary p-4 rounded-lg w-1/2 h-[80vh] overflow-y-auto">
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setIsThumbnailModalOpen(false)}><X className="w-4 h-4" /></Button>
                </div>
                <AllImages productId={productId} isModal={true} isProductThumbnail={true} maxSelection={1} onClose={() => {setIsThumbnailModalOpen(false); fetchData()}} />
            </div>
        </div>
    }
    {isImageModalOpen &&
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-secondary p-4 rounded-lg w-1/2 h-[80vh] overflow-y-auto">
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setIsImageModalOpen(false)}><X className="w-4 h-4" /></Button>
                </div>
                <AllImages productId={productId} isModal={true} maxSelection={10} onClose={() => {setIsImageModalOpen(false); fetchData()}} />
            </div>
        </div>
    }
    </>
  )
}