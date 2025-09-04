'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, use } from "react"
import { ArrowLeft, Edit, Trash2, Plus, Search, Calendar, Tag, MoreHorizontal, Copy, Check, X } from "lucide-react"
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
import { getFilterOptions, deleteFilterOption, updateFilter, updateFilterOption, createFilterOption } from "@/app/actions/admin/filter/filter"
import Link from "next/link"
import { toast } from "sonner"
import { Product } from "@prisma/client"

interface FilterOption {
    id: string
    value: string
    filterId: string
    filter: {
        id: string
        name: string
        createdAt: Date
        updatedAt: Date
        filterGroupId: string | null
    }
    createdAt: Date
    updatedAt: Date
    products?: Product[]
}

interface FilterData {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    filterGroupId: string | null
    options: FilterOption[]
}

export default function FilterPage({ params }: { params: Promise<{ filterId: string }> }) {
    const { filterId } = use(params)
    const [filterData, setFilterData] = useState<FilterData | null>(null)
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
    const [editingOptionValue, setEditingOptionValue] = useState("")
    const [isUpdatingOption, setIsUpdatingOption] = useState(false)
    const [isAddingOption, setIsAddingOption] = useState(false)
    const [newOptionValue, setNewOptionValue] = useState("")
    const [isCreatingOption, setIsCreatingOption] = useState(false)

    const filteredOptions = filterOptions.filter(option =>
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        if (filterId) {
            loadFilterData()
        }
    }, [filterId])

    const loadFilterData = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const options = await getFilterOptions(filterId)
            setFilterOptions(options)
            
            if (options.length > 0) {
                const filter = options[0].filter
                setFilterData({
                    id: filter.id,
                    name: filter.name,
                    createdAt: filter.createdAt,
                    updatedAt: filter.updatedAt,
                    filterGroupId: filter.filterGroupId,
                    options: options
                })
                setEditName(filter.name)
            }
        } catch (err) {
            console.error('Error loading filter data:', err)
            setError('Failed to load filter data. Please try again.')
            toast.error('Failed to load filter data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateFilterName = async () => {
        if (!editName.trim() || editName === filterData?.name) {
            setIsEditing(false)
            return
        }

        try {
            setIsUpdating(true)
            await updateFilter(filterId, { name: editName.trim() })
            
            setFilterData(prev => prev ? { ...prev, name: editName.trim() } : null)
            setIsEditing(false)
            toast.success('Filter name updated successfully')
        } catch (err) {
            console.error('Error updating filter name:', err)
            toast.error('Failed to update filter name')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleStartEditOption = (option: FilterOption) => {
        setEditingOptionId(option.id)
        setEditingOptionValue(option.value)
        setIsAddingOption(false) // Cancel adding if editing
    }

    const handleCancelEditOption = () => {
        setEditingOptionId(null)
        setEditingOptionValue("")
    }

    const handleUpdateOption = async (optionId: string) => {
        if (!editingOptionValue.trim()) {
            toast.error('Option value cannot be empty')
            return
        }

        const originalOption = filterOptions.find(opt => opt.id === optionId)
        if (!originalOption || editingOptionValue.trim() === originalOption.value) {
            handleCancelEditOption()
            return
        }

        // Check for duplicates
        const duplicate = filterOptions.find(opt => 
            opt.id !== optionId && opt.value.toLowerCase() === editingOptionValue.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('An option with this value already exists')
            return
        }

        try {
            setIsUpdatingOption(true)
            await updateFilterOption(optionId, { value: editingOptionValue.trim() })
            
            // Update the local state
            setFilterOptions(prev => 
                prev.map(opt => 
                    opt.id === optionId 
                        ? { ...opt, value: editingOptionValue.trim(), updatedAt: new Date() }
                        : opt
                )
            )
            
            handleCancelEditOption()
            toast.success('Option updated successfully')
        } catch (err) {
            console.error('Error updating option:', err)
            toast.error('Failed to update option')
        } finally {
            setIsUpdatingOption(false)
        }
    }

    const handleStartAddOption = () => {
        setIsAddingOption(true)
        setNewOptionValue("")
        setEditingOptionId(null) // Cancel editing if adding
    }

    const handleCancelAddOption = () => {
        setIsAddingOption(false)
        setNewOptionValue("")
    }

    const handleCreateOption = async () => {
        if (!newOptionValue.trim()) {
            toast.error('Option value cannot be empty')
            return
        }

        // Check for duplicates
        const duplicate = filterOptions.find(opt => 
            opt.value.toLowerCase() === newOptionValue.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('An option with this value already exists')
            return
        }

        try {
            setIsCreatingOption(true)
            const newOption = await createFilterOption({
                value: newOptionValue.trim(),
                filter: {
                    connect: {
                        id: filterId
                    }
                }
            })
            
            // Add to local state
            setFilterOptions(prev => [...prev, {
                id: newOption.id,
                value: newOption.value,
                filterId: filterId,
                filter: filterData!,
                productVariants: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }])
            
            handleCancelAddOption()
            toast.success('Option created successfully')
        } catch (err) {
            console.error('Error creating option:', err)
            toast.error('Failed to create option')
        } finally {
            setIsCreatingOption(false)
        }
    }

    const handleDeleteOption = async (optionId: string, optionValue: string) => {
        if (!confirm(`Are you sure you want to delete the option "${optionValue}"? This action cannot be undone.`)) {
            return
        }

        try {
            await deleteFilterOption(optionId)
            setFilterOptions(prev => prev.filter(opt => opt.id !== optionId))
            toast.success('Filter option deleted successfully')
        } catch (err) {
            console.error('Error deleting filter option:', err)
            toast.error('Failed to delete filter option')
        }
    }

    const handleCopyOptionValue = (value: string) => {
        navigator.clipboard.writeText(value)
        toast.success('Option value copied to clipboard')
    }

    const stats = {
        totalOptions: filterOptions.length,
        totalUsage: filterOptions.reduce((sum, option) => sum + (option.products?.length || 0), 0),
        lastUpdated: filterData?.updatedAt ? new Date(filterData.updatedAt).toLocaleDateString() : 'N/A'
    }

    const LoadingState = () => (
        <div className="space-y-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded"></div>
                    ))}
                </div>
                <div className="h-64 bg-muted rounded"></div>
            </div>
        </div>
    )

    const ErrorState = () => (
        <Card className="text-center py-12">
            <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Tag className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error loading filter</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                    <Button onClick={loadFilterData} variant="outline">
                        Try Again
                    </Button>
                    <Button asChild>
                        <Link href="/admin/filters">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Filters
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <LoadingState />
            </div>
        )
    }

    if (error || !filterData) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <ErrorState />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/filters">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Filters
                        </Link>
                    </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        {isEditing ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 max-w-md">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="text-2xl font-bold h-12 px-4 border-2 border-primary/20 focus-visible:border-primary bg-background/50 backdrop-blur-sm"
                                            placeholder="Enter filter name..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateFilterName()
                                                if (e.key === 'Escape') {
                                                    setIsEditing(false)
                                                    setEditName(filterData?.name || '')
                                                }
                                            }}
                                            autoFocus
                                            maxLength={50}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                            {editName.length}/50
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUpdateFilterName}
                                        disabled={isUpdating || !editName.trim() || editName.trim().length < 2}
                                        size="sm"
                                        className="h-12"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsEditing(false)
                                            setEditName(filterData?.name || '')
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="h-12"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    {editName.trim().length === 0 ? (
                                        <span className="text-red-500 flex items-center gap-1">
                                            <X className="w-3 h-3" />
                                            Filter name is required
                                        </span>
                                    ) : editName.trim().length < 2 ? (
                                        <span className="text-amber-500 flex items-center gap-1">
                                            <X className="w-3 h-3" />
                                            Must be at least 2 characters
                                        </span>
                                    ) : editName.trim() === filterData?.name ? (
                                        <span className="text-muted-foreground">
                                            No changes made
                                        </span>
                                    ) : (
                                        <span className="text-green-600 flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Ready to save
                                        </span>
                                    )}
                                    <span className="text-muted-foreground text-xs">
                                        Press Enter to save, Escape to cancel
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-3 cursor-pointer" onClick={() => setIsEditing(true)}>
                                <h1 className="text-3xl font-bold tracking-tight group-hover:text-primary/80 transition-colors">
                                    {filterData.name}
                                </h1>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setIsEditing(true)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Badge variant="secondary" className="text-xs">
                                        Click to edit
                                    </Badge>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Created {new Date(filterData.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                ID: {filterData.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOptions}</div>
                        <p className="text-xs text-muted-foreground">
                            Filter options available
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsage}</div>
                        <p className="text-xs text-muted-foreground">
                            Product variants using this filter
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lastUpdated}</div>
                        <p className="text-xs text-muted-foreground">
                            Most recent modification
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Options */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Filter Options
                            </CardTitle>
                            <CardDescription>
                                Click on any option to edit it, or add new options directly below.
                            </CardDescription>
                        </div>
                        <Button 
                            onClick={handleStartAddOption}
                            disabled={isAddingOption}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search options..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Add New Option Form */}
                    {isAddingOption && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={newOptionValue}
                                    onChange={(e) => setNewOptionValue(e.target.value)}
                                    placeholder="Enter new option value..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateOption()
                                        if (e.key === 'Escape') handleCancelAddOption()
                                    }}
                                    autoFocus
                                />
                                <Button
                                    onClick={handleCreateOption}
                                    disabled={isCreatingOption || !newOptionValue.trim()}
                                    size="sm"
                                >
                                    {isCreatingOption ? (
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
                                    onClick={handleCancelAddOption}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Options Table */}
                    {filteredOptions.length === 0 && !isAddingOption ? (
                        <div className="text-center py-12">
                            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm ? 'No options found' : 'No options yet'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm ? 
                                    `No options match your search "${searchTerm}"` : 
                                    'Start by adding your first filter option'
                                }
                            </p>
                            {!searchTerm && (
                                <Button onClick={handleStartAddOption}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Option
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Option Value</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOptions.map((option) => (
                                        <TableRow key={option.id} className="hover:bg-muted/50 group">
                                            <TableCell className="font-medium">
                                                {editingOptionId === option.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={editingOptionValue}
                                                            onChange={(e) => setEditingOptionValue(e.target.value)}
                                                            className="max-w-[200px]"
                                                            placeholder="Option value..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateOption(option.id)
                                                                if (e.key === 'Escape') handleCancelEditOption()
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateOption(option.id)}
                                                            disabled={isUpdatingOption}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleCancelEditOption}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Badge 
                                                            variant="outline" 
                                                            className="cursor-pointer hover:bg-muted"
                                                            onClick={() => handleStartEditOption(option)}
                                                        >
                                                            {option.value}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStartEditOption(option)}
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopyOptionValue(option.value)}
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {option.products?.length || 0} products
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(option.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(option.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleStartEditOption(option)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Option
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCopyOptionValue(option.value)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy Value
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteOption(option.id, option.value)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Option
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}