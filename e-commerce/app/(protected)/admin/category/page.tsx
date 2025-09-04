'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { PlusIcon, Search, Edit, Trash2, MoreHorizontal, Eye, Copy, Check, X, FolderTree } from "lucide-react"
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCategories, deleteCategory, updateCategory, createCategory } from "@/app/actions/admin/category/category"
import Link from "next/link"
import { toast } from "sonner"
import { Image as ImageType, Product } from "@prisma/client"
import Image from "next/image"
import { AllImages } from "@/app/components/all-images"

interface Category {
    id: string
    name: string
    slug: string
    viewCount: number
    image?: ImageType | null
    parentId: string | null
    parent?: Category | null
    children?: Category[]
    products?: Product[]
    createdAt: Date
    updatedAt: Date
}

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [editingCategoryName, setEditingCategoryName] = useState("")
    const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getCategories()
            setCategories(data)
        } catch (err) {
            console.error('Error loading categories:', err)
            setError('Failed to load categories. Please try again.')
            toast.error('Failed to load categories')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStartEditCategory = (category: Category) => {
        setEditingCategoryId(category.id)
        setEditingCategoryName(category.name)
        setIsAddingCategory(false)
    }

    const handleCancelEditCategory = () => {
        setEditingCategoryId(null)
        setEditingCategoryName("")
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleUpdateCategory = async (categoryId: string) => {
        if (!editingCategoryName.trim()) {
            toast.error('Category name cannot be empty')
            return
        }

        const originalCategory = categories.find(category => category.id === categoryId)
        if (!originalCategory || editingCategoryName.trim() === originalCategory.name) {
            handleCancelEditCategory()
            return
        }

        // Check for duplicates
        const duplicate = categories.find(category => 
            category.id !== categoryId && category.name.toLowerCase() === editingCategoryName.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('A category with this name already exists')
            return
        }

        try {
            setIsUpdatingCategory(true)
            const newSlug = generateSlug(editingCategoryName.trim())
            
            await updateCategory(categoryId, { 
                name: editingCategoryName.trim(),
                slug: newSlug
            })
            
            setCategories(prev => 
                prev.map(category => 
                    category.id === categoryId 
                        ? { ...category, name: editingCategoryName.trim(), slug: newSlug, updatedAt: new Date() }
                        : category
                )
            )
            
            handleCancelEditCategory()
            toast.success('Category updated successfully')
        } catch (err) {
            console.error('Error updating category:', err)
            toast.error('Failed to update category')
        } finally {
            setIsUpdatingCategory(false)
        }
    }

    const handleStartAddCategory = () => {
        setIsAddingCategory(true)
        setNewCategoryName("")
        setEditingCategoryId(null)
    }

    const handleCancelAddCategory = () => {
        setIsAddingCategory(false)
        setNewCategoryName("")
    }

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name cannot be empty')
            return
        }

        // Check for duplicates
        const duplicate = categories.find(category => 
            category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('A category with this name already exists')
            return
        }

        try {
            setIsCreatingCategory(true)
            const newSlug = generateSlug(newCategoryName.trim())
            
            const newCategory = await createCategory({
                name: newCategoryName.trim(),
                slug: newSlug
            })
            
            setCategories(prev => [newCategory, ...prev])
            handleCancelAddCategory()
            toast.success('Category created successfully')
        } catch (err) {
            console.error('Error creating category:', err)
            toast.error('Failed to create category')
        } finally {
            setIsCreatingCategory(false)
        }
    }

    const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
        const category = categories.find(c => c.id === categoryId)
        if (category?.children && category.children.length > 0) {
            toast.error('Cannot delete category with subcategories. Please delete or move subcategories first.')
            return
        }

        if (category?.products && category.products.length > 0) {
            toast.error('Cannot delete category with products. Please move products to another category first.')
            return
        }

        if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            return
        }

        try {
            await deleteCategory(categoryId)
            setCategories(prev => prev.filter(category => category.id !== categoryId))
            toast.success('Category deleted successfully')
        } catch (err) {
            console.error('Error deleting category:', err)
            toast.error('Failed to delete category')
        }
    }

    const handleCopyCategoryName = (name: string) => {
        navigator.clipboard.writeText(name)
        toast.success('Category name copied to clipboard')
    }

    const getTotalProducts = () => {
        return categories.reduce((total, category) => total + (category.products?.length || 0), 0)
    }

    const getTotalViews = () => {
        return categories.reduce((total, category) => total + category.viewCount, 0)
    }

    const getParentCategories = () => {
        return categories.filter(category => !category.parentId)
    }

    const EmptyState = () => (
        <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderTree className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground text-center mb-6">
                    {searchTerm ? 'No categories match your search criteria.' : 'Get started by creating your first category.'}
                </p>
                {!searchTerm && (
                    <div className="flex gap-2">
                        <Button onClick={handleStartAddCategory}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/category/new">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create New Category
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )

    const ErrorState = () => (
        <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error loading categories</h3>
                <p className="text-muted-foreground text-center mb-6">{error}</p>
                <Button onClick={loadCategories}>Try Again</Button>
            </CardContent>
        </Card>
    )

    const LoadingState = () => (
        <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading categories...</p>
            </CardContent>
        </Card>
    )

    const getCategoryPath = (category: Category): string[] => {
        const path: string[] = []
        let currentId: string | null = category.id
        
        // Build path from current category up to root
        while (currentId) {
            const current = categories.find(c => c.id === currentId)
            if (!current) break
            
            path.unshift(current.name)
            currentId = current.parentId
        }
        
        return path
    }

    const CategoryHierarchyBadge = ({ category }: { category: Category }) => {
        const path = getCategoryPath(category)
        
        if (path.length > 1) {
            return (
                <div className="flex items-center gap-1 text-xs">
                    <div className="flex items-center gap-1">
                        {path.slice(0, -1).map((pathItem, index) => (
                            <span key={index} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                    {pathItem}
                                </Badge>
                                {index < path.length - 2 && <span className="text-muted-foreground">→</span>}
                            </span>
                        ))}
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{path[path.length - 1]}</span>
                    </div>
                </div>
            )
        }
        
        return category.children && category.children.length > 0 ? (
            <div className="flex items-center gap-1">
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                    {category.children.length} subcategories
                </Badge>
            </div>
        ) : (
            <span className="font-medium">{category.name}</span>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage product categories and organize your catalog
                        </p>
                    </div>
                    <div className="flex gap-2 self-start sm:self-auto">
                        <Button 
                            onClick={handleStartAddCategory}
                            disabled={isAddingCategory}
                            variant="outline"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Quick Add
                        </Button>
                        <Button asChild>
                            <Link href="/admin/category/new">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create New Category
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Categories created
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getParentCategories().length}</div>
                        <p className="text-xs text-muted-foreground">
                            Top-level categories
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTotalProducts()}</div>
                        <p className="text-xs text-muted-foreground">
                            Products in categories
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTotalViews()}</div>
                        <p className="text-xs text-muted-foreground">
                            Category page views
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Stats */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search categories by name or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                        {filteredCategories.length} of {categories.length} categories
                    </Badge>
                </div>
            </div>

            {/* Add New Category Form */}
            {isAddingCategory && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                    <div className="flex items-center gap-2">
                        <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name..."
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateCategory()
                                if (e.key === 'Escape') handleCancelAddCategory()
                            }}
                            autoFocus
                        />
                        <Button
                            onClick={handleCreateCategory}
                            disabled={isCreatingCategory || !newCategoryName.trim()}
                            size="sm"
                        >
                            {isCreatingCategory ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Add
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleCancelAddCategory}
                            variant="outline"
                            size="sm"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState />
            ) : filteredCategories.length === 0 && !isAddingCategory ? (
                <EmptyState />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Category Management
                        </CardTitle>
                        <CardDescription>
                            View and manage all categories. Click on any category name to edit it inline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Hierarchy</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.map((category) => (
                                        <TableRow key={category.id} className="hover:bg-muted/50 group">
                                            <TableCell>
                                                {category.image ? (
                                                    <Image src={category.image.url} alt={category.name} width={20} height={20} className="w-20 h-20 object-cover" quality={1000} unoptimized/>
                                                ) : (
                                                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/25 transition-all duration-300">
                                                        <p className="text-muted-foreground" onClick={() => {
                                                            handleStartEditCategory(category)
                                                            setIsImageModalOpen(true)
                                                        }}>Add image</p>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {editingCategoryId === category.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={editingCategoryName}
                                                            onChange={(e) => setEditingCategoryName(e.target.value)}
                                                            className="max-w-[200px]"
                                                            placeholder="Category name..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateCategory(category.id)
                                                                if (e.key === 'Escape') handleCancelEditCategory()
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateCategory(category.id)}
                                                            disabled={isUpdatingCategory}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleCancelEditCategory}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span 
                                                            className="cursor-pointer hover:text-primary"
                                                            onClick={() => handleStartEditCategory(category)}
                                                        >
                                                            {category.name}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStartEditCategory(category)}
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                                    {category.slug}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <CategoryHierarchyBadge category={category} />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {category.products?.length || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {category.viewCount.toLocaleString()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(category.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/category/${category.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStartEditCategory(category)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Category
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCopyCategoryName(category.name)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy Name
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Category
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isImageModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-secondary p-4 rounded-lg w-1/2 h-[80vh] overflow-y-auto">
                        <AllImages categoryId={editingCategoryId || ""} isModal={true} maxSelection={1} onClose={() => {
                            setIsImageModalOpen(false)
                            loadCategories()
                            handleCancelEditCategory()
                        }}/>
                    </div>
                </div>
            )}
        </div>
    )
}