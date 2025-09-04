'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, use } from "react"
import { ArrowLeft, Edit, Trash2, Plus, Search, Calendar, Users, MoreHorizontal, Eye, Copy, Check, X, Filter as FilterIcon } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getFilterGroup, updateFilterGroup, assignFilterToGroup, removeFilterFromGroup, getAvailableFilters } from "@/app/actions/admin/filter-group/filter-group"
import Link from "next/link"
import { toast } from "sonner"
import { Product } from "@prisma/client"

interface FilterOption {
    id: string
    value: string
    filterId: string
}

interface Filter {
    id: string
    name: string
    options: FilterOption[]
    createdAt: Date
    updatedAt: Date
}

interface FilterGroup {
    id: string
    name: string
    filters: Filter[]
    products: Product[]
    createdAt: Date
    updatedAt: Date
}

export default function FilterGroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = use(params)
    const [filterGroup, setFilterGroup] = useState<FilterGroup | null>(null)
    const [availableFilters, setAvailableFilters] = useState<Filter[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState<string>("")
    const [isAssigning, setIsAssigning] = useState(false)

    const filteredGroupFilters = filterGroup?.filters.filter(filter =>
        filter.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    useEffect(() => {
        if (groupId) {
            loadFilterGroupData()
        }
    }, [groupId])

    const loadFilterGroupData = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const [groupData, availableFiltersData] = await Promise.all([
                getFilterGroup(groupId),
                getAvailableFilters()
            ])
            
            if (groupData) {
                setFilterGroup(groupData)
                setEditName(groupData.name)
            }
            setAvailableFilters(availableFiltersData)
        } catch (err) {
            console.error('Error loading filter group data:', err)
            setError('Failed to load filter group data. Please try again.')
            toast.error('Failed to load filter group data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateGroupName = async () => {
        if (!editName.trim() || editName === filterGroup?.name) {
            setIsEditing(false)
            return
        }

        try {
            setIsUpdating(true)
            await updateFilterGroup(groupId, { name: editName.trim() })
            
            setFilterGroup(prev => prev ? { ...prev, name: editName.trim() } : null)
            setIsEditing(false)
            toast.success('Group name updated successfully')
        } catch (err) {
            console.error('Error updating group name:', err)
            toast.error('Failed to update group name')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleAssignFilter = async () => {
        if (!selectedFilter) {
            toast.error('Please select a filter to assign')
            return
        }

        try {
            setIsAssigning(true)
            await assignFilterToGroup(selectedFilter, groupId)
            
            // Move filter from available to assigned
            const filterToMove = availableFilters.find(f => f.id === selectedFilter)
            if (filterToMove) {
                setFilterGroup(prev => prev ? { 
                    ...prev, 
                    filters: [...prev.filters, filterToMove] 
                } : null)
                setAvailableFilters(prev => prev.filter(f => f.id !== selectedFilter))
            }
            
            setSelectedFilter("")
            toast.success('Filter assigned successfully')
        } catch (err) {
            console.error('Error assigning filter:', err)
            toast.error('Failed to assign filter')
        } finally {
            setIsAssigning(false)
        }
    }

    const handleRemoveFilter = async (filterId: string, filterName: string) => {
        if (!confirm(`Are you sure you want to remove "${filterName}" from this group? The filter will still exist but won't be part of this group.`)) {
            return
        }

        try {
            await removeFilterFromGroup(filterId)
            
            // Move filter from assigned to available
            const filterToMove = filterGroup?.filters.find(f => f.id === filterId)
            if (filterToMove) {
                setFilterGroup(prev => prev ? { 
                    ...prev, 
                    filters: prev.filters.filter(f => f.id !== filterId) 
                } : null)
                setAvailableFilters(prev => [...prev, filterToMove])
            }
            
            toast.success('Filter removed successfully')
        } catch (err) {
            console.error('Error removing filter:', err)
            toast.error('Failed to remove filter')
        }
    }

    const handleCopyFilterName = (name: string) => {
        navigator.clipboard.writeText(name)
        toast.success('Filter name copied to clipboard')
    }

    const stats = {
        totalFilters: filterGroup?.filters.length || 0,
        totalOptions: filterGroup?.filters.reduce((sum, filter) => sum + filter.options.length, 0) || 0,
        totalProducts: filterGroup?.products.length || 0,
        lastUpdated: filterGroup?.updatedAt ? new Date(filterGroup.updatedAt).toLocaleDateString() : 'N/A'
    }

    const LoadingState = () => (
        <div className="space-y-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
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
                    <Users className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error loading filter group</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                    <Button onClick={loadFilterGroupData} variant="outline">
                        Try Again
                    </Button>
                    <Button asChild>
                        <Link href="/admin/filter-group">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Groups
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

    if (error || !filterGroup) {
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
                        <Link href="/admin/filter-group">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Groups
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
                                            placeholder="Enter group name..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateGroupName()
                                                if (e.key === 'Escape') {
                                                    setIsEditing(false)
                                                    setEditName(filterGroup?.name || '')
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
                                        onClick={handleUpdateGroupName}
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
                                            setEditName(filterGroup?.name || '')
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
                                            Group name is required
                                        </span>
                                    ) : editName.trim().length < 2 ? (
                                        <span className="text-amber-500 flex items-center gap-1">
                                            <X className="w-3 h-3" />
                                            Must be at least 2 characters
                                        </span>
                                    ) : editName.trim() === filterGroup?.name ? (
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
                                    {filterGroup.name}
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
                                Created {new Date(filterGroup.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                ID: {filterGroup.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFilters}</div>
                        <p className="text-xs text-muted-foreground">
                            Filters in this group
                        </p>
                    </CardContent>
                </Card>
                
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
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Products using this group
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

            {/* Assign Filter Section */}
            {availableFilters.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Assign Filter to Group
                        </CardTitle>
                        <CardDescription>
                            Add existing filters to this group
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select a filter to assign..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableFilters.map((filter) => (
                                        <SelectItem key={filter.id} value={filter.id}>
                                            <div className="flex items-center gap-2">
                                                <FilterIcon className="w-4 h-4" />
                                                {filter.name}
                                                <Badge variant="secondary" className="ml-2">
                                                    {filter.options.length} options
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleAssignFilter}
                                disabled={!selectedFilter || isAssigning}
                            >
                                {isAssigning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Assign
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Group Filters */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FilterIcon className="w-5 h-5" />
                                Group Filters
                            </CardTitle>
                            <CardDescription>
                                Manage filters assigned to this group
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search filters..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Filters Table */}
                    {filteredGroupFilters.length === 0 ? (
                        <div className="text-center py-12">
                            <FilterIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm ? 'No filters found' : 'No filters assigned'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm ? 
                                    `No filters match your search "${searchTerm}"` : 
                                    'Start by assigning filters to this group'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Filter Name</TableHead>
                                        <TableHead>Options</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGroupFilters.map((filter) => (
                                        <TableRow key={filter.id} className="hover:bg-muted/50 group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FilterIcon className="w-4 h-4" />
                                                    <Link 
                                                        href={`/admin/filters/${filter.id}`}
                                                        className="hover:text-primary"
                                                    >
                                                        {filter.name}
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopyFilterName(filter.name)}
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {filter.options.slice(0, 3).map((option) => (
                                                        <Badge 
                                                            key={option.id} 
                                                            variant="outline" 
                                                            className="text-xs"
                                                        >
                                                            {option.value}
                                                        </Badge>
                                                    ))}
                                                    {filter.options.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{filter.options.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(filter.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(filter.updatedAt).toLocaleDateString()}
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
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/filters/${filter.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Filter
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCopyFilterName(filter.name)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy Name
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleRemoveFilter(filter.id, filter.name)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remove from Group
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