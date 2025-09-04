"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, PackageSearch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Product, Category, Tag, ProductTag, Image as ImageType } from "@prisma/client"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type ProductWithDetails = Product & {
    category: Category;
    thumbnail: ImageType | null;
    tags: (ProductTag & {
        tag: Tag;
    })[];
    children: Product[];
}

interface ProductsTableProps {
  products: ProductWithDetails[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredProducts = useMemo(() => products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm])

  const paginatedProducts = useMemo(() => filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ), [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Products</CardTitle>
                <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                />
            </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                            {product.thumbnail ? (
                                <Image src={product.thumbnail.url} alt={product.name} width={80} height={80} className="rounded-md object-cover" />
                            ) : (
                                <Image src="/images/placeholder.png" alt="No Image" width={80} height={80} className="rounded-md object-cover" />
                            )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell><Badge variant="outline">{product.type}</Badge></TableCell>
                        <TableCell>
                        <Badge variant={product.status === "PUBLISHED" ? "default" : "secondary"}>
                            {product.status}
                        </Badge>
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.children.length}</TableCell>
                        <TableCell>₹{product.price.toString()}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/products/view/${product.id}`}>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                             <div className="flex flex-col items-center gap-4">
                                <PackageSearch className="h-12 w-12 text-muted-foreground" />
                                <div className="space-y-1">
                                    <h3 className="font-semibold">
                                        {searchTerm ? "No products found" : "No products yet"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm ? "Try adjusting your search terms." : "Create your first product to see it here."}
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-end space-x-2 py-4 w-full">
            <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            >
            Previous
            </Button>
            <span className="text-sm">
            Page {currentPage} of {totalPages}
            </span>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            >
            Next
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 