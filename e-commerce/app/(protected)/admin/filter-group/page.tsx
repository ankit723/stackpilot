'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { PlusIcon, Search, Edit, Trash2, MoreHorizontal, Eye, Copy, Check, X, Users, Filter as FilterIcon } from "lucide-react"
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
import { getFilterGroups, deleteFilterGroup, updateFilterGroup, createFilterGroup } from "@/app/actions/admin/filter-group/filter-group"
import Link from "next/link"
import { toast } from "sonner"
import { FilterGroup as FilterGroupWithDetails, Filter as FilterWithDetails, FilterOption as FilterOptionType, Product } from "@prisma/client"

type Filter = FilterWithDetails & {
    options: FilterOptionType[]
}

type FilterGroup = FilterGroupWithDetails & {
    filters: Filter[]
    products: Product[]
}

export default function FilterGroupPage() {
    const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editingGroupName, setEditingGroupName] = useState("")
    const [isUpdatingGroup, setIsUpdatingGroup] = useState(false)
    const [isAddingGroup, setIsAddingGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)

    const filteredGroups = filterGroups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.filters.some(filter => 
            filter.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    useEffect(() => {
        loadFilterGroups()
    }, [])

    const loadFilterGroups = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getFilterGroups()
            setFilterGroups(data as FilterGroup[])
        } catch (err) {
            console.error('Error loading filter groups:', err)
            setError('Failed to load filter groups. Please try again.')
            toast.error('Failed to load filter groups')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStartEditGroup = (group: FilterGroup) => {
        setEditingGroupId(group.id)
        setEditingGroupName(group.name)
        setIsAddingGroup(false)
    }

    const handleCancelEditGroup = () => {
        setEditingGroupId(null)
        setEditingGroupName("")
    }

    const handleUpdateGroup = async (groupId: string) => {
        if (!editingGroupName.trim()) {
            toast.error('Group name cannot be empty')
            return
        }

        const originalGroup = filterGroups.find(group => group.id === groupId)
        if (!originalGroup || editingGroupName.trim() === originalGroup.name) {
            handleCancelEditGroup()
            return
        }

        // Check for duplicates
        const duplicate = filterGroups.find(group => 
            group.id !== groupId && group.name.toLowerCase() === editingGroupName.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('A group with this name already exists')
            return
        }

        try {
            setIsUpdatingGroup(true)
            await updateFilterGroup(groupId, { name: editingGroupName.trim() })
            
            setFilterGroups(prev => 
                prev.map(group => 
                    group.id === groupId 
                        ? { ...group, name: editingGroupName.trim(), updatedAt: new Date() }
                        : group
                )
            )
            
            handleCancelEditGroup()
            toast.success('Group updated successfully')
        } catch (err) {
            console.error('Error updating group:', err)
            toast.error('Failed to update group')
        } finally {
            setIsUpdatingGroup(false)
        }
    }

    const handleStartAddGroup = () => {
        setIsAddingGroup(true)
        setNewGroupName("")
        setEditingGroupId(null)
    }

    const handleCancelAddGroup = () => {
        setIsAddingGroup(false)
        setNewGroupName("")
    }

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error('Group name cannot be empty')
            return
        }

        // Check for duplicates
        const duplicate = filterGroups.find(group => 
            group.name.toLowerCase() === newGroupName.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('A group with this name already exists')
            return
        }

        try {
            setIsCreatingGroup(true)
            const newGroup = await createFilterGroup({
                name: newGroupName.trim()
            })
            
            setFilterGroups(prev => [newGroup as FilterGroup, ...prev])
            handleCancelAddGroup()
            toast.success('Group created successfully')
        } catch (err) {
            console.error('Error creating group:', err)
            toast.error('Failed to create group')
        } finally {
            setIsCreatingGroup(false)
        }
    }

    const handleDeleteGroup = async (groupId: string, groupName: string) => {
        if (!confirm(`Are you sure you want to delete the group "${groupName}"? This will remove all filters from this group but won't delete the filters themselves.`)) {
            return
        }

        try {
            await deleteFilterGroup(groupId)
            setFilterGroups(prev => prev.filter(group => group.id !== groupId))
            toast.success('Group deleted successfully')
        } catch (err) {
            console.error('Error deleting group:', err)
            toast.error('Failed to delete group')
        }
    }

    const handleCopyGroupName = (name: string) => {
        navigator.clipboard.writeText(name)
        toast.success('Group name copied to clipboard')
    }

    const getTotalFilters = () => {
        return filterGroups.reduce((sum, group) => sum + group.filters.length, 0)
    }

    const getTotalProducts = () => {
        return filterGroups.reduce((sum, group) => sum + group.products.length, 0)
    }

    const EmptyState = () => (
        <Card className="text-center py-12">
            <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No filter groups found</h3>
                <p className="text-muted-foreground mb-4">
                    {searchTerm ? 
                        `No groups match your search "${searchTerm}"` : 
                        "Get started by creating your first filter group"
                    }
                </p>
                {!searchTerm && (
                    <Button onClick={handleStartAddGroup}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create First Group
                    </Button>
                )}
            </CardContent>
        </Card>
    )

    const ErrorState = () => (
        <Card className="text-center py-12">
            <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Users className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error loading filter groups</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadFilterGroups} variant="outline">
                    Try Again
                </Button>
            </CardContent>
        </Card>
    )

    const LoadingState = () => (
        <Card>
            <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Filter Groups</h1>
                        <p className="text-muted-foreground mt-2">
                            Organize your filters into logical groups for better product categorization
                        </p>
                    </div>
                    <div className="flex gap-2 self-start sm:self-auto">
                        <Button 
                            onClick={handleStartAddGroup}
                            disabled={isAddingGroup}
                            variant="outline"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Quick Add
                        </Button>
                        <Button asChild>
                            <Link href="/admin/filter-group/new">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create New Group
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filterGroups.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Filter groups created
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTotalFilters()}</div>
                        <p className="text-xs text-muted-foreground">
                            Filters organized in groups
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
                            Products using these groups
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Stats */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search groups by name or filters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                        {filteredGroups.length} of {filterGroups.length} groups
                    </Badge>
                </div>
            </div>

            {/* Add New Group Form */}
            {isAddingGroup && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                    <div className="flex items-center gap-2">
                        <Input
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name..."
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateGroup()
                                if (e.key === 'Escape') handleCancelAddGroup()
                            }}
                            autoFocus
                        />
                        <Button
                            onClick={handleCreateGroup}
                            disabled={isCreatingGroup || !newGroupName.trim()}
                            size="sm"
                        >
                            {isCreatingGroup ? (
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
                            onClick={handleCancelAddGroup}
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
            ) : filteredGroups.length === 0 && !isAddingGroup ? (
                <EmptyState />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Filter Group Management
                        </CardTitle>
                        <CardDescription>
                            View and manage all filter groups. Click on any group name to edit it inline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group Name</TableHead>
                                        <TableHead>Filters</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGroups.map((group) => (
                                        <TableRow key={group.id} className="hover:bg-muted/50 group">
                                            <TableCell className="font-medium">
                                                {editingGroupId === group.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={editingGroupName}
                                                            onChange={(e) => setEditingGroupName(e.target.value)}
                                                            className="max-w-[200px]"
                                                            placeholder="Group name..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateGroup(group.id)
                                                                if (e.key === 'Escape') handleCancelEditGroup()
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateGroup(group.id)}
                                                            disabled={isUpdatingGroup}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleCancelEditGroup}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span 
                                                            className="cursor-pointer hover:text-primary"
                                                            onClick={() => handleStartEditGroup(group)}
                                                        >
                                                            {group.name}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStartEditGroup(group)}
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopyGroupName(group.name)}
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {group.filters.slice(0, 3).map((filter) => (
                                                        <Badge 
                                                            key={filter.id} 
                                                            variant="outline" 
                                                            className="text-xs"
                                                        >
                                                            <FilterIcon className="w-3 h-3 mr-1" />
                                                            {filter.name}
                                                        </Badge>
                                                    ))}
                                                    {group.filters.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{group.filters.length - 3} more
                                                        </Badge>
                                                    )}
                                                    {group.filters.length === 0 && (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                            No filters
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {group.products.length} products
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(group.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(group.updatedAt).toLocaleDateString()}
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
                                                            <Link href={`/admin/filter-group/${group.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStartEditGroup(group)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Group
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCopyGroupName(group.name)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy Name
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteGroup(group.id, group.name)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Group
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
        </div>
    )
}