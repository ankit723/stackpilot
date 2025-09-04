"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct } from "@/app/actions/admin/product/product"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { slugify } from "@/lib/utils"
import { Category, Filter, FilterGroup, FilterOption, ProductStatus, Tag } from "@prisma/client"
import { getCategories } from "@/app/actions/admin/category/category"
import { getFilterGroups } from "@/app/actions/admin/filter-group/filter-group"
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
import { Loader2 } from "lucide-react"
import { CategoryTree } from "@/app/components/category-tree"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

type FilterGroupType = FilterGroup & {
  filters: (Filter & {
    options: FilterOption[]
  })[]
}

const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["SIMPLE", "CONFIGURABLE"]),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  status: z.nativeEnum(ProductStatus),
  categoryId: z.string().min(1, "A category must be selected"),
  filterGroupId: z.string().min(1, "A filter group must be selected"),
  tags: z.array(z.string()).optional(),
})

type ProductFormValues = z.infer<typeof ProductSchema>

export default function NewProductPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [filterGroups, setFilterGroups] = useState<FilterGroupType[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      type: "SIMPLE",
      price: 0,
      quantity: 10,
      status: "DRAFT",
      categoryId: "",
      filterGroupId: "",
      tags: [],
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const [cats, groups, allTags] = await Promise.all([
        getCategories(),
        getFilterGroups(),
        getTags(),
      ])
      setCategories(cats)
      setFilterGroups(groups)
      if (allTags.tags) {
        setTags(allTags.tags)
      }
    }
    fetchData()
  }, [form])

  
  const productType = form.watch("type")
  const productName = form.watch("name")
  
  const generateSKU = async (name: string) => {
    const sku = slugify(name)
    form.setValue("sku", sku)
  }

  useEffect(() => {
    generateSKU(productName)
  }, [productName])
  
  const toggleOption = (filterId: string, optionId: string) => {
    setSelectedOptions(prev => {
      const current = prev[filterId] || []
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : productType === "SIMPLE"
        ? [optionId] // single selection
        : [...current, optionId]
      return { ...prev, [filterId]: updated }
    })
  }

  const onSubmit = async (data: ProductFormValues) => {
    const allSelectedOptions = Object.values(selectedOptions)
    setIsSubmitting(true)
    try {
      const product = await createProduct(
        {
          name: data.name,
          description: data.description,
          sku: data.sku || "",
          type: data.type,
          category: { connect: { id: data.categoryId } },
          filterGroup: { connect: { id: data.filterGroupId } },
          slug: slugify(data.name),
          price: data.price,
          status: data.status,
          stock: data.quantity,
          tags: {
            create: selectedTags.map(tagId => ({
              tag: { connect: { id: tagId } },
            })),
          },
        },
        data.type,
        allSelectedOptions
      )
      toast.success("Product created successfully!")
      router.push(`/admin/products/view/${product.id}`)
    } catch (err) {
      console.error("Product creation error:", err)
      toast.error("Failed to create product.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedFilterGroupId = form.watch("filterGroupId")
  const selectedGroup = filterGroups.find(fg => fg.id === selectedFilterGroupId)
  const availableFilters = selectedGroup?.filters.filter(f => selectedFilters.includes(f.id)) || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Product</h1>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="filterGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Filter Group</FormLabel>
                      <Select
                        onValueChange={value => {
                          field.onChange(value)
                          setSelectedFilters([])
                          setSelectedOptions({})
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a filter group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filterGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedGroup && (
                  <div>
                    <Label>Select Filters from Group: {selectedGroup.name}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedGroup.filters.map(filter => (
                        <Button
                          type="button"
                          key={filter.id}
                          variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                          onClick={() =>
                            setSelectedFilters(prev =>
                              prev.includes(filter.id)
                                ? prev.filter(id => id !== filter.id)
                                : [...prev, filter.id]
                            )
                          }
                        >
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {availableFilters.length > 0 && (
                  <div>
                    <Label>Select Options</Label>
                    {availableFilters.map(filter => (
                      <div key={filter.id} className="mb-2">
                        <div className="font-semibold mb-1">{filter.name}</div>
                        <div className="flex flex-wrap gap-2">
                          {filter.options.map(option => (
                            <Button
                              type="button"
                              key={option.id}
                              variant={
                                selectedOptions[filter.id]?.includes(option.id)
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => toggleOption(filter.id, option.id)}
                            >
                              {option.value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SIMPLE">Simple</SelectItem>
                          <SelectItem value="CONFIGURABLE">Configurable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ProductStatus).map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                        <CategoryTree
                            categories={categories}
                            selectedCategoryId={field.value}
                            onSelectCategory={(id) => {
                                form.setValue("categoryId", id, { shouldValidate: true})
                            }}
                        />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Button
                        type="button"
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        onClick={() => {
                          const newSelectedTags = selectedTags.includes(tag.id)
                            ? selectedTags.filter(t => t !== tag.id)
                            : [...selectedTags, tag.id]
                          setSelectedTags(newSelectedTags)
                          form.setValue("tags", newSelectedTags)
                        }}
                      >
                        {tag.name}
                      </Button>
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
  )
}
