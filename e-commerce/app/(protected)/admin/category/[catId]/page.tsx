'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, use } from "react"
import { ArrowLeft, Edit, X, Check, FolderTree, Hash, Users, Package, Eye, Trash2, Plus, Info, ChevronRight, ChevronDown, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { getCategoryById, updateCategory, deleteCategory, getCategories, createChildCategory, getCategoryPath } from "@/app/actions/admin/category/category"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Image as ImageType } from "@prisma/client"
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
    products?: unknown[]
    createdAt: Date
    updatedAt: Date
}



interface TreeNodeProps {
    category: Category
    level: number
    isExpanded: boolean
    expandedNodes: Set<string>
    onToggle: (categoryId: string) => void
    onDeleteCategory: (categoryId: string, categoryName: string) => void
}

function TreeNode({ category, level, isExpanded, expandedNodes, onToggle, onDeleteCategory }: TreeNodeProps) {
    const hasChildren = category.children && category.children.length > 0
    
    return (
        <div className="select-none">
            <div className="flex items-center py-2 px-3 hover:bg-muted/50 rounded-lg group">
                {/* Indentation */}
                <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                    {/* Tree lines */}
                    {level > 0 && (
                        <div className="flex items-center">
                            <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/20 mr-2"></div>
                        </div>
                    )}
                    
                    {/* Expand/Collapse button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mr-2"
                        onClick={() => hasChildren && onToggle(category.id)}
                        disabled={!hasChildren}
                    >
                        {hasChildren ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )
                        ) : (
                            <div className="w-4 h-4" />
                        )}
                    </Button>

                    {/* Category icon */}
                    <FolderTree className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />

                    {/* Category info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{category.name}</span>
                            <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                                {category.slug}
                            </code>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs h-5">
                                {category.products?.length || 0} products
                            </Badge>
                            <Badge variant="secondary" className="text-xs h-5">
                                {category.viewCount} views
                            </Badge>
                            {hasChildren && (
                                <Badge variant="default" className="text-xs h-5">
                                    {category.children?.length} subcategories
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Link href={`/admin/category/${category.id}`}>
                                <Eye className="w-3 h-3" />
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/category/${category.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/category/${category.id}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Category
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => onDeleteCategory(category.id, category.name)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Category
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Render children */}
            {hasChildren && isExpanded && (
                <div className="ml-4 border-l-2 border-muted-foreground/10">
                    {category.children?.map((child) => (
                        <TreeNode
                            key={child.id}
                            category={child}
                            level={level + 1}
                            isExpanded={expandedNodes.has(child.id)}
                            expandedNodes={expandedNodes}
                            onToggle={onToggle}
                            onDeleteCategory={onDeleteCategory}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface CategoryTreeProps {
    categories: Category[]
    onDeleteCategory: (categoryId: string, categoryName: string) => void
}

function CategoryTree({ categories, onDeleteCategory }: CategoryTreeProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

    // Auto-expand all nodes on mount
    useEffect(() => {
        const getAllCategoryIds = (cats: Category[]): string[] => {
            const ids: string[] = []
            cats.forEach(cat => {
                ids.push(cat.id)
                if (cat.children) {
                    ids.push(...getAllCategoryIds(cat.children))
                }
            })
            return ids
        }
        
        setExpandedNodes(new Set(getAllCategoryIds(categories)))
    }, [categories])

    const toggleNode = (categoryId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId)
            } else {
                newSet.add(categoryId)
            }
            return newSet
        })
    }

    const expandAll = () => {
        const getAllCategoryIds = (cats: Category[]): string[] => {
            const ids: string[] = []
            cats.forEach(cat => {
                ids.push(cat.id)
                if (cat.children) {
                    ids.push(...getAllCategoryIds(cat.children))
                }
            })
            return ids
        }
        
        setExpandedNodes(new Set(getAllCategoryIds(categories)))
    }

    const collapseAll = () => {
        setExpandedNodes(new Set())
    }

    if (categories.length === 0) {
        return (
            <div className="text-center py-8">
                <FolderTree className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subcategories found</h3>
                <p className="text-muted-foreground mb-4">
                    Create child categories to organize products in a hierarchical structure.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {categories.length} subcategories
                </p>
                <div className="flex items-center gap-2">
                    <Button onClick={expandAll} size="sm" variant="outline">
                        Expand All
                    </Button>
                    <Button onClick={collapseAll} size="sm" variant="outline">
                        Collapse All
                    </Button>
                </div>
            </div>
            
            <div className="border rounded-lg p-2 bg-muted/20">
                {categories.map((category) => (
                    <TreeNode
                        key={category.id}
                        category={category}
                        level={0}
                        isExpanded={expandedNodes.has(category.id)}
                        expandedNodes={expandedNodes}
                        onToggle={toggleNode}
                        onDeleteCategory={onDeleteCategory}
                    />
                ))}
            </div>
        </div>
    )
}

export default function CategoryPage({ params }: { params: Promise<{ catId: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [category, setCategory] = useState<Category | null>(null)
    const [allCategories, setAllCategories] = useState<Category[]>([])
    const [categoryPath, setCategoryPath] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Editing states
    const [isEditingName, setIsEditingName] = useState(false)
    const [editingName, setEditingName] = useState("")
    const [isEditingSlug, setIsEditingSlug] = useState(false)
    const [editingSlug, setEditingSlug] = useState("")
    const [isEditingParent, setIsEditingParent] = useState(false)
    const [editingParentId, setEditingParentId] = useState<string | null>(null)
    
    // Child creation states
    const [isAddingChild, setIsAddingChild] = useState(false)
    const [newChildName, setNewChildName] = useState("")
    const [newChildSlug, setNewChildSlug] = useState("")
    const [isChildSlugManual, setIsChildSlugManual] = useState(false)
    const [isCreatingChild, setIsCreatingChild] = useState(false)
    
    const [isUpdating, setIsUpdating] = useState(false)

    const [isImageModalOpen, setIsImageModalOpen] = useState(false)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const [categoryData, allCategoriesData, pathData] = await Promise.all([
                getCategoryById(resolvedParams.catId),
                getCategories(),
                getCategoryPath(resolvedParams.catId)
            ])

            console.log("categoryData", categoryData)
            
            if (!categoryData) {
                setError('Category not found')
                return
            }
            
            setCategory(categoryData)
            setAllCategories(allCategoriesData)
            setCategoryPath(pathData)
            setEditingName(categoryData.name)
            setEditingSlug(categoryData.slug)
            setEditingParentId(categoryData.parentId)
            
        } catch (err) {
            console.error('Error loading category:', err)
            setError('Failed to load category. Please try again.')
            toast.error('Failed to load category')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [resolvedParams.catId])

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleNewChildNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setNewChildName(newName)
        
        // Auto-generate slug if not manually edited
        if (!isChildSlugManual) {
            setNewChildSlug(generateSlug(newName))
        }
    }

    const handleNewChildSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value
        setNewChildSlug(newSlug)
        setIsChildSlugManual(true)
    }

    const handleStartAddChild = () => {
        setIsAddingChild(true)
        setNewChildName("")
        setNewChildSlug("")
        setIsChildSlugManual(false)
    }

    const handleCancelAddChild = () => {
        setIsAddingChild(false)
        setNewChildName("")
        setNewChildSlug("")
        setIsChildSlugManual(false)
    }

    const handleCreateChild = async () => {
        if (!newChildName.trim()) {
            toast.error('Child category name cannot be empty')
            return
        }

        if (!newChildSlug.trim()) {
            toast.error('Child category slug cannot be empty')
            return
        }

        if (!/^[a-z0-9-]+$/.test(newChildSlug.trim())) {
            toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
            return
        }

        // Check for duplicates
        const duplicateName = allCategories.find(cat => 
            cat.name.toLowerCase() === newChildName.trim().toLowerCase()
        )
        if (duplicateName) {
            toast.error('A category with this name already exists')
            return
        }

        const duplicateSlug = allCategories.find(cat => 
            cat.slug.toLowerCase() === newChildSlug.trim().toLowerCase()
        )
        if (duplicateSlug) {
            toast.error('A category with this slug already exists')
            return
        }

        try {
            setIsCreatingChild(true)
            const newChild = await createChildCategory(resolvedParams.catId, {
                name: newChildName.trim(),
                slug: newChildSlug.trim()
            })

            // Update the current category with the new child
            setCategory(prev => prev ? {
                ...prev,
                children: [...(prev.children || []), newChild]
            } : null)

            // Update all categories list
            setAllCategories(prev => [...prev, newChild])

            handleCancelAddChild()
            toast.success('Child category created successfully')
        } catch (err) {
            console.error('Error creating child category:', err)
            toast.error('Failed to create child category')
        } finally {
            setIsCreatingChild(false)
        }
    }

    const handleUpdateName = async () => {
        if (!editingName.trim()) {
            toast.error('Category name cannot be empty')
            return
        }

        if (editingName.trim() === category?.name) {
            setIsEditingName(false)
            return
        }

        // Check for duplicates
        const duplicate = allCategories.find(cat => 
            cat.id !== category?.id && cat.name.toLowerCase() === editingName.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('A category with this name already exists')
            return
        }

        try {
            setIsUpdating(true)
            await updateCategory(resolvedParams.catId, { name: editingName.trim() })
            
            setCategory(prev => prev ? { ...prev, name: editingName.trim(), updatedAt: new Date() } : null)
            setIsEditingName(false)
            toast.success('Category name updated successfully')
        } catch (err) {
            console.error('Error updating category name:', err)
            toast.error('Failed to update category name')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleUpdateSlug = async () => {
        if (!editingSlug.trim()) {
            toast.error('Category slug cannot be empty')
            return
        }

        if (editingSlug.trim() === category?.slug) {
            setIsEditingSlug(false)
            return
        }

        if (!/^[a-z0-9-]+$/.test(editingSlug.trim())) {
            toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
            return
        }

        // Check for duplicates
        const duplicate = allCategories.find(cat => 
            cat.id !== category?.id && cat.slug.toLowerCase() === editingSlug.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('A category with this slug already exists')
            return
        }

        try {
            setIsUpdating(true)
            await updateCategory(resolvedParams.catId, { slug: editingSlug.trim() })
            
            setCategory(prev => prev ? { ...prev, slug: editingSlug.trim(), updatedAt: new Date() } : null)
            setIsEditingSlug(false)
            toast.success('Category slug updated successfully')
        } catch (err) {
            console.error('Error updating category slug:', err)
            toast.error('Failed to update category slug')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleUpdateParent = async () => {
        if (editingParentId === category?.parentId) {
            setIsEditingParent(false)
            return
        }

        try {
            setIsUpdating(true)
            await updateCategory(resolvedParams.catId, { 
                parent: editingParentId ? { connect: { id: editingParentId } } : { disconnect: true }
            })
            
            const parentCategory = editingParentId ? allCategories.find(cat => cat.id === editingParentId) : undefined
            setCategory(prev => prev ? { 
                ...prev, 
                parentId: editingParentId, 
                parent: parentCategory,
                updatedAt: new Date() 
            } : null)
            
            setIsEditingParent(false)
            toast.success('Category parent updated successfully')
        } catch (err) {
            console.error('Error updating category parent:', err)
            toast.error('Failed to update category parent')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteCategory = async () => {
        if (!category) return

        if (category.children && category.children.length > 0) {
            toast.error('Cannot delete category with subcategories. Please delete or move subcategories first.')
            return
        }

        if (category.products && category.products.length > 0) {
            toast.error('Cannot delete category with products. Please move products to another category first.')
            return
        }

        if (!confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
            return
        }

        try {
            await deleteCategory(resolvedParams.catId)
            toast.success('Category deleted successfully')
            router.push('/admin/category')
        } catch (err) {
            console.error('Error deleting category:', err)
            toast.error('Failed to delete category')
        }
    }

    const handleDeleteSubcategory = async (categoryId: string, categoryName: string) => {
        if (!category) return

        // Find the category to delete in the tree
        const findCategoryInTree = (cats: Category[], id: string): Category | null => {
            for (const cat of cats) {
                if (cat.id === id) return cat
                if (cat.children) {
                    const found = findCategoryInTree(cat.children, id)
                    if (found) return found
                }
            }
            return null
        }

        const categoryToDelete = findCategoryInTree(category.children || [], categoryId)
        if (!categoryToDelete) {
            toast.error('Category not found')
            return
        }

        if (categoryToDelete.children && categoryToDelete.children.length > 0) {
            toast.error('Cannot delete category with subcategories. Please delete or move subcategories first.')
            return
        }

        if (categoryToDelete.products && categoryToDelete.products.length > 0) {
            toast.error('Cannot delete category with products. Please move products to another category first.')
            return
        }

        if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
            return
        }

        try {
            await deleteCategory(categoryId)
            
            // Remove from local state
            const removeFromTree = (cats: Category[]): Category[] => {
                return cats.filter(cat => cat.id !== categoryId).map(cat => ({
                    ...cat,
                    children: cat.children ? removeFromTree(cat.children) : undefined
                }))
            }

            setCategory(prev => prev ? {
                ...prev,
                children: removeFromTree(prev.children || [])
            } : null)

            setAllCategories(prev => prev.filter(cat => cat.id !== categoryId))
            toast.success('Category deleted successfully')
        } catch (err) {
            console.error('Error deleting category:', err)
            toast.error('Failed to delete category')
        }
    }

    const getAvailableParents = () => {
        return allCategories.filter(cat => 
            cat.id !== category?.id && // Can't be parent to itself
            cat.parentId !== category?.id // Can't be parent to its own parent (avoid cycles)
        )
    }

    const LoadingState = () => (
        <div className="container mx-auto p-6 max-w-6xl">
            <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading category...</p>
                </CardContent>
            </Card>
        </div>
    )

    const ErrorState = () => (
        <div className="container mx-auto p-6 max-w-6xl">
            <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Error loading category</h3>
                    <p className="text-muted-foreground text-center mb-6">{error}</p>
                    <Button onClick={() => router.push('/admin/category')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Categories
                    </Button>
                </CardContent>
            </Card>
        </div>
    )

    if (isLoading) return <LoadingState />
    if (error || !category) return <ErrorState />

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/category">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Categories
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center justify-between">
        <div>
                        <h1 className="text-3xl font-bold tracking-tight">Category Details</h1>
                        <p className="text-muted-foreground mt-2">
                            View and manage category information
                        </p>
                        {categoryPath.length > 1 && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <FolderTree className="w-4 h-4" />
                                <span>Path: {categoryPath.join(' → ')}</span>
                            </div>
                        )}
                    </div>
                    <Button 
                        onClick={handleDeleteCategory}
                        variant="destructive"
                        size="sm"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Category
                    </Button>
                </div>
            </div>

            {/* Category Information */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Category name and URL identifier
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            {/* Category Name */}
                            <div className="space-y-2">
                                <Label>Category Name</Label>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            placeholder="Category name..."
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateName()
                                                if (e.key === 'Escape') {
                                                    setEditingName(category.name)
                                                    setIsEditingName(false)
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleUpdateName}
                                            disabled={isUpdating}
                                            className="h-9 px-3"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingName(category.name)
                                                setIsEditingName(false)
                                            }}
                                            className="h-9 px-3"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{category.name}</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsEditingName(true)}
                                            className="h-6 px-2"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Category Slug */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Category Slug
                                </Label>
                                {isEditingSlug ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editingSlug}
                                            onChange={(e) => setEditingSlug(e.target.value)}
                                            placeholder="category-slug..."
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateSlug()
                                                if (e.key === 'Escape') {
                                                    setEditingSlug(category.slug)
                                                    setIsEditingSlug(false)
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleUpdateSlug}
                                            disabled={isUpdating}
                                            className="h-9 px-3"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingSlug(category.slug)
                                                setIsEditingSlug(false)
                                            }}
                                            className="h-9 px-3"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                            {category.slug}
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsEditingSlug(true)}
                                            className="h-6 px-2"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    URL: /category/{category.slug}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category Image</Label>
                            {
                                category.image ?(
                                    <div className="relative">
                                        <Image src={category.image.url} alt={category.name} width={100} height={100} className="w-full h-full object-cover" quality={1000} unoptimized={true}/>
                                        <Button size="sm" variant="outline" onClick={() => setIsImageModalOpen(true)} className="absolute top-2 right-2 text-primary bg-white hover:text-primary/80 cursor-pointer">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ):(
                                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/25 transition-all duration-300" onClick={() => setIsImageModalOpen(true)}>
                                        <p className="text-muted-foreground">Add image</p>
                                    </div>
                                )
                            }
                            {isImageModalOpen && (
                                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-secondary p-4 rounded-lg w-1/2 h-[80vh] overflow-y-auto">
                                        <AllImages categoryId={category.id} isModal={true} maxSelection={1} onClose={() => {
                                            setIsImageModalOpen(false)
                                            fetchData()
                                        }}/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Hierarchy & Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Hierarchy & Statistics
                        </CardTitle>
                        <CardDescription>
                            Category relationships and usage metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Parent Category */}
                        <div className="space-y-2">
                            <Label>Parent Category</Label>
                            {isEditingParent ? (
                                <div className="flex items-center gap-2">
                                    <Select 
                                        value={editingParentId || "none"} 
                                        onValueChange={(value) => setEditingParentId(value === "none" ? null : value)}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select parent category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Parent (Top Level)</SelectItem>
                                            {getAvailableParents().map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateParent}
                                        disabled={isUpdating}
                                        className="h-9 px-3"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingParentId(category.parentId)
                                            setIsEditingParent(false)
                                        }}
                                        className="h-9 px-3"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Badge variant={category.parent ? "outline" : "secondary"}>
                                        {category.parent ? category.parent.name : "Top Level"}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsEditingParent(true)}
                                        className="h-6 px-2"
                                    >
                                        <Edit className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-sm text-muted-foreground">Subcategories</Label>
                                <p className="text-2xl font-bold">{category.children?.length || 0}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm text-muted-foreground">Products</Label>
                                <p className="text-2xl font-bold">{category.products?.length || 0}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm text-muted-foreground">Page Views</Label>
                                <p className="text-2xl font-bold">{category.viewCount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm text-muted-foreground">Created</Label>
                                <p className="text-sm font-medium">{new Date(category.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subcategories */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderTree className="w-5 h-5" />
                        Subcategories ({category.children?.length || 0})
                    </CardTitle>
                    <CardDescription>
                        Categories that belong to this category
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Add New Child Form */}
                    {isAddingChild && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                            <h4 className="font-medium mb-4">Add New Child Category</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-child-name">Name *</Label>
                                    <Input
                                        id="new-child-name"
                                        value={newChildName}
                                        onChange={handleNewChildNameChange}
                                        placeholder="e.g., iPhone, Samsung Galaxy"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateChild()
                                            if (e.key === 'Escape') handleCancelAddChild()
                                        }}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-child-slug">Slug *</Label>
                                    <Input
                                        id="new-child-slug"
                                        value={newChildSlug}
                                        onChange={handleNewChildSlugChange}
                                        placeholder="e.g., iphone, samsung-galaxy"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateChild()
                                            if (e.key === 'Escape') handleCancelAddChild()
                                        }}
                                    />
                                </div>
                            </div>
                            {newChildName && (
                                <div className="mt-3 p-2 bg-muted rounded text-sm">
                                    <p className="text-muted-foreground">
                                        Path: {categoryPath.join(' → ')} → {newChildName}
                                    </p>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-4">
                                <Button
                                    onClick={handleCreateChild}
                                    disabled={isCreatingChild || !newChildName.trim() || !newChildSlug.trim()}
                                    size="sm"
                                >
                                    {isCreatingChild ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Create Child
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleCancelAddChild}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Button onClick={handleStartAddChild} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Child Category
                            </Button>
                        </div>
                        
                        {category.children && category.children.length > 0 ? (
                            <CategoryTree 
                                categories={category.children} 
                                onDeleteCategory={handleDeleteSubcategory}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <FolderTree className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No subcategories found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create child categories to organize products in a hierarchical structure.
                                </p>
                                <Button onClick={handleStartAddChild} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Child Category
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Products ({category.products?.length || 0})
                    </CardTitle>
                    <CardDescription>
                        Products assigned to this category
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {category.products && category.products.length > 0 ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Product management will be implemented here
                            </p>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {category.products.map((product: unknown) => {
                                const prod = product as { id: string; name: string; slug: string; price: number; isActive: boolean }
                                return (
                                    <Card key={prod.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{prod.name}</h4>
                                                    <code className="text-xs text-muted-foreground">{prod.slug}</code>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            ${prod.price}
                                                        </Badge>
                                                        <Badge variant={prod.isActive ? "default" : "secondary"} className="text-xs">
                                                            {prod.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-4">
                                This category does not have any products assigned yet.
                            </p>
                            <Button variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Products
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}