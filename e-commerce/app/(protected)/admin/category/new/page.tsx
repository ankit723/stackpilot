'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Save, ArrowLeft, FolderTree, Hash, Info, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { createCategoryWithChildren, getCategories } from "@/app/actions/admin/category/category"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Image } from "@prisma/client"
import { Product } from "@prisma/client"

interface Category {
    id: string
    name: string
    slug: string
    viewCount: number
    image?: Image[]
    parentId: string | null
    parent?: Category | null
    children?: Category[]
    products?: Product[]
    createdAt: Date
    updatedAt: Date
}

interface ChildCategory {
    id: string
    name: string
    slug: string
    isSlugManual: boolean
}

interface FormErrors {
    name?: string
    slug?: string
    parentId?: string
    children?: { name?: string; slug?: string }[]
}

export default function NewCategoryPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [parentId, setParentId] = useState<string | null>(null)
    const [isSlugManual, setIsSlugManual] = useState(false)
    const [availableCategories, setAvailableCategories] = useState<Category[]>([])
    const [children, setChildren] = useState<ChildCategory[]>([])
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true)
                const categories = await getCategories()
                setAvailableCategories(categories)
            } catch (error) {
                console.error('Error fetching categories:', error)
                toast.error('Failed to load parent categories')
            } finally {
                setIsLoadingCategories(false)
            }
        }

        fetchCategories()
    }, [])

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const generateUniqueId = () => {
        return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setName(newName)
        
        // Auto-generate slug if not manually edited
        if (!isSlugManual) {
            setSlug(generateSlug(newName))
        }
        
        // Clear error when user starts typing
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: undefined }))
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value
        setSlug(newSlug)
        setIsSlugManual(true)
        
        // Clear error when user starts typing
        if (errors.slug) {
            setErrors(prev => ({ ...prev, slug: undefined }))
        }
    }

    const handleParentChange = (value: string) => {
        setParentId(value === 'none' ? null : value)
        
        // Clear error when user makes selection
        if (errors.parentId) {
            setErrors(prev => ({ ...prev, parentId: undefined }))
        }
    }

    const handleAddChild = () => {
        const newChild: ChildCategory = {
            id: generateUniqueId(),
            name: "",
            slug: "",
            isSlugManual: false
        }
        setChildren([...children, newChild])
    }

    const handleRemoveChild = (childId: string) => {
        setChildren(children.filter(child => child.id !== childId))
        
        // Clear child errors
        if (errors.children) {
            const childIndex = children.findIndex(child => child.id === childId)
            if (childIndex !== -1) {
                const newChildErrors = [...errors.children]
                newChildErrors.splice(childIndex, 1)
                setErrors(prev => ({ ...prev, children: newChildErrors }))
            }
        }
    }

    const handleChildNameChange = (childId: string, newName: string) => {
        setChildren(children.map(child => {
            if (child.id === childId) {
                const updatedChild = { ...child, name: newName }
                // Auto-generate slug if not manually edited
                if (!child.isSlugManual) {
                    updatedChild.slug = generateSlug(newName)
                }
                return updatedChild
            }
            return child
        }))
        
        // Clear child error
        const childIndex = children.findIndex(child => child.id === childId)
        if (childIndex !== -1 && errors.children?.[childIndex]?.name) {
            const newChildErrors = [...(errors.children || [])]
            newChildErrors[childIndex] = { ...newChildErrors[childIndex], name: undefined }
            setErrors(prev => ({ ...prev, children: newChildErrors }))
        }
    }

    const handleChildSlugChange = (childId: string, newSlug: string) => {
        setChildren(children.map(child => {
            if (child.id === childId) {
                return { ...child, slug: newSlug, isSlugManual: true }
            }
            return child
        }))
        
        // Clear child error
        const childIndex = children.findIndex(child => child.id === childId)
        if (childIndex !== -1 && errors.children?.[childIndex]?.slug) {
            const newChildErrors = [...(errors.children || [])]
            newChildErrors[childIndex] = { ...newChildErrors[childIndex], slug: undefined }
            setErrors(prev => ({ ...prev, children: newChildErrors }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        
        // Validate name
        if (!name.trim()) {
            newErrors.name = "Category name is required"
        } else if (name.trim().length < 2) {
            newErrors.name = "Category name must be at least 2 characters"
        }
        
        // Validate slug
        if (!slug.trim()) {
            newErrors.slug = "Category slug is required"
        } else if (slug.trim().length < 2) {
            newErrors.slug = "Category slug must be at least 2 characters"
        } else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
            newErrors.slug = "Category slug can only contain lowercase letters, numbers, and hyphens"
        }
        
        // Check for duplicate name
        const duplicateName = availableCategories.find(category => 
            category.name.toLowerCase() === name.trim().toLowerCase()
        )
        if (duplicateName) {
            newErrors.name = "A category with this name already exists"
        }
        
        // Check for duplicate slug
        const duplicateSlug = availableCategories.find(category => 
            category.slug.toLowerCase() === slug.trim().toLowerCase()
        )
        if (duplicateSlug) {
            newErrors.slug = "A category with this slug already exists"
        }
        
        // Validate children
        if (children.length > 0) {
            const childErrors: { name?: string; slug?: string }[] = []
            const seenChildNames = new Set<string>()
            const seenChildSlugs = new Set<string>()
            
            children.forEach((child, index) => {
                const childError: { name?: string; slug?: string } = {}
                
                // Validate child name
                if (!child.name.trim()) {
                    childError.name = "Child name is required"
                } else if (child.name.trim().length < 2) {
                    childError.name = "Child name must be at least 2 characters"
                } else if (seenChildNames.has(child.name.trim().toLowerCase())) {
                    childError.name = "Child names must be unique"
                } else {
                    seenChildNames.add(child.name.trim().toLowerCase())
                }
                
                // Validate child slug
                if (!child.slug.trim()) {
                    childError.slug = "Child slug is required"
                } else if (child.slug.trim().length < 2) {
                    childError.slug = "Child slug must be at least 2 characters"
                } else if (!/^[a-z0-9-]+$/.test(child.slug.trim())) {
                    childError.slug = "Child slug can only contain lowercase letters, numbers, and hyphens"
                } else if (seenChildSlugs.has(child.slug.trim().toLowerCase())) {
                    childError.slug = "Child slugs must be unique"
                } else {
                    seenChildSlugs.add(child.slug.trim().toLowerCase())
                }
                
                // Check for duplicate child name in existing categories
                const duplicateChildName = availableCategories.find(category => 
                    category.name.toLowerCase() === child.name.trim().toLowerCase()
                )
                if (duplicateChildName) {
                    childError.name = "A category with this name already exists"
                }
                
                // Check for duplicate child slug in existing categories
                const duplicateChildSlug = availableCategories.find(category => 
                    category.slug.toLowerCase() === child.slug.trim().toLowerCase()
                )
                if (duplicateChildSlug) {
                    childError.slug = "A category with this slug already exists"
                }
                
                childErrors[index] = childError
            })
            
            if (childErrors.some(error => error.name || error.slug)) {
                newErrors.children = childErrors
            }
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateCategory = async () => {
        if (!validateForm()) return
        
        setIsLoading(true)
        
        try {
            const childrenData = children.length > 0 ? children.map(child => ({
                name: child.name.trim(),
                slug: child.slug.trim()
            })) : undefined

            await createCategoryWithChildren({
                name: name.trim(),
                slug: slug.trim(),
                parentId: parentId || undefined,
                children: childrenData
            })

            toast.success(`Category created successfully${children.length > 0 ? ` with ${children.length} child categories` : ''}`)
            router.push('/admin/category')
            
        } catch (error) {
            console.error('Error creating category:', error)
            toast.error('Error creating category')
        } finally {
            setIsLoading(false)
        }
    }

    const getSelectedParent = () => {
        if (!parentId) return null
        return availableCategories.find(cat => cat.id === parentId)
    }

    const getParentCategories = () => {
        return availableCategories.filter(category => !category.parentId)
    }

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
                <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
                <p className="text-muted-foreground mt-2">
                    Add a new category and optionally create child categories at the same time
                </p>
            </div>

            <div className="grid gap-6">
                {/* Basic Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderTree className="w-5 h-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Define the category name and URL-friendly slug
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category-name">Category Name *</Label>
                                <Input
                                    id="category-name"
                                    type="text"
                                    placeholder="e.g., Electronics, Clothing, Books"
                                    value={name}
                                    onChange={handleNameChange}
                                    className={errors.name ? "border-red-500" : ""}
                                    aria-describedby={errors.name ? "name-error" : undefined}
                                />
                                {errors.name && (
                                    <p id="name-error" className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category-slug" className="flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Category Slug *
                                </Label>
                                <Input
                                    id="category-slug"
                                    type="text"
                                    placeholder="e.g., electronics, clothing, books"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    className={errors.slug ? "border-red-500" : ""}
                                    aria-describedby={errors.slug ? "slug-error" : undefined}
                                />
                                {errors.slug && (
                                    <p id="slug-error" className="text-sm text-red-500">
                                        {errors.slug}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    URL: /category/{slug || 'category-slug'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hierarchy & Organization */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Category Hierarchy
                            </CardTitle>
                            <CardDescription>
                                Organize categories in a hierarchical structure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingCategories ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label>Parent Category (Optional)</Label>
                                    <Select onValueChange={handleParentChange} value={parentId || "none"}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a parent category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Parent (Top Level)</SelectItem>
                                            {getParentCategories().map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    {getSelectedParent() && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm font-medium">Selected Parent:</p>
                                            <p className="text-sm text-muted-foreground">
                                                {getSelectedParent()?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Path: {getSelectedParent()?.name} → {name || 'New Category'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Child Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Child Categories
                        </CardTitle>
                        <CardDescription>
                            Create child categories that will belong to this category
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {children.length === 0 ? (
                            <div className="text-center py-8">
                                <FolderTree className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No child categories</h3>
                                <p className="text-muted-foreground mb-4">
                                    Add child categories to create a hierarchical structure
                                </p>
                                <Button onClick={handleAddChild} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Child Category
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {children.map((child, index) => (
                                    <Card key={child.id} className="border-l-4 border-l-primary">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between mb-4">
                                                <h4 className="font-medium">Child Category {index + 1}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveChild(child.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`child-name-${child.id}`}>Name *</Label>
                                                    <Input
                                                        id={`child-name-${child.id}`}
                                                        type="text"
                                                        placeholder="e.g., Mobile Phones, Laptops"
                                                        value={child.name}
                                                        onChange={(e) => handleChildNameChange(child.id, e.target.value)}
                                                        className={errors.children?.[index]?.name ? "border-red-500" : ""}
                                                    />
                                                    {errors.children?.[index]?.name && (
                                                        <p className="text-sm text-red-500">
                                                            {errors.children[index].name}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor={`child-slug-${child.id}`}>Slug *</Label>
                                                    <Input
                                                        id={`child-slug-${child.id}`}
                                                        type="text"
                                                        placeholder="e.g., mobile-phones, laptops"
                                                        value={child.slug}
                                                        onChange={(e) => handleChildSlugChange(child.id, e.target.value)}
                                                        className={errors.children?.[index]?.slug ? "border-red-500" : ""}
                                                    />
                                                    {errors.children?.[index]?.slug && (
                                                        <p className="text-sm text-red-500">
                                                            {errors.children[index].slug}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {child.name && (
                                                <div className="mt-3 p-2 bg-muted rounded text-sm">
                                                    <p className="text-muted-foreground">
                                                        Path: {getSelectedParent()?.name || 'Root'} → {name || 'New Category'} → {child.name}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                
                                <Button onClick={handleAddChild} variant="outline" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Another Child Category
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview Section */}
                {(name.trim() || slug.trim() || children.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Preview</CardTitle>
                            <CardDescription>
                                Review your category structure before creating
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Category Details</Label>
                                        <div className="space-y-1">
                                            <p><strong>Name:</strong> {name || 'Not specified'}</p>
                                            <p><strong>Slug:</strong> {slug || 'Not specified'}</p>
                                            <p><strong>URL:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">/category/{slug || 'category-slug'}</code></p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Hierarchy</Label>
                                        <div className="space-y-1">
                                            <p><strong>Parent:</strong> {getSelectedParent()?.name || 'None (Top Level)'}</p>
                                            <p><strong>Children:</strong> {children.length} child categories</p>
                                            <p><strong>Level:</strong> {getSelectedParent() ? 'Child Category' : 'Parent Category'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {children.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Child Categories</Label>
                                        <div className="space-y-1">
                                            {children.map((child, index) => (
                                                <div key={child.id} className="flex items-center gap-2 text-sm">
                                                    <span className="text-muted-foreground">{index + 1}.</span>
                                                    <span className="font-medium">{child.name || 'Unnamed'}</span>
                                                    <span className="text-muted-foreground">({child.slug || 'no-slug'})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
                <Button asChild variant="outline" disabled={isLoading}>
                    <Link href="/admin/category">
                        Cancel
                    </Link>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setName("")
                        setSlug("")
                        setParentId(null)
                        setChildren([])
                        setIsSlugManual(false)
                        setErrors({})
                    }}
                    disabled={isLoading}
                >
                    Clear Form
                </Button>
                <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isLoading || !name.trim() || !slug.trim()}
                    className="min-w-[140px]"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Category{children.length > 0 ? ` & ${children.length} Children` : ''}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}