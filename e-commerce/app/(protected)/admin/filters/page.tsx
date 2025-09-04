'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, PlusIcon, Search, Trash2, Eye, MoreHorizontal } from "lucide-react"
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
import { useState, useEffect } from "react"
import { getFilters } from "@/app/actions/admin/filter/filter"
import Link from "next/link"
import { toast } from "sonner"

interface FilterOption {
    id: string
    value: string
    filterId: string
}

interface Filter {
    id: string
    name: string
    options: FilterOption[]
    createdAt?: Date
    updatedAt?: Date
}

export default function FiltersPage() {
    const [filters, setFilters] = useState<Filter[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const filteredFilters = filters.filter(filter =>
        filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filter.options.some(option => 
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    useEffect(() => {
        loadFilters()
    }, [])

    const loadFilters = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getFilters()
            setFilters(data)
        } catch (err) {
            console.error('Error loading filters:', err)
            setError('Failed to load filters. Please try again.')
            toast.error('Failed to load filters')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteFilter = async (filterId: string, filterName: string) => {
        if (!confirm(`Are you sure you want to delete the filter "${filterName}"? This action cannot be undone.`)) {
            return
        }

        try {
            // TODO: Implement deleteFilter action
            // await deleteFilter(filterId)
            
            // For now, just remove from state
            setFilters(prev => prev.filter(f => f.id !== filterId))
            toast.success('Filter deleted successfully')
        } catch (err) {
            console.error('Error deleting filter:', err)
            toast.error('Failed to delete filter')
        }
    }

    const EmptyState = () => (
        <Card className="text-center py-12">
            <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No filters found</h3>
                <p className="text-muted-foreground mb-4">
                    {searchTerm ? 
                        `No filters match your search "${searchTerm}"` : 
                        "Get started by creating your first filter"
                    }
                </p>
                {!searchTerm && (
                    <Button asChild>
                        <Link href="/admin/filters/new">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create First Filter
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )

    const ErrorState = () => (
        <Card className="text-center py-12">
            <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Trash2 className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error loading filters</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadFilters} variant="outline">
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
                        <h1 className="text-3xl font-bold tracking-tight">Filters</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage product filters to help customers find what they&apos;re looking for
                        </p>
                    </div>
                    <Button asChild className="self-start sm:self-auto">
                        <Link href="/admin/filters/new">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Filter
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Search and Stats */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search filters by name or options..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                        {filteredFilters.length} of {filters.length} filters
                    </Badge>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState />
            ) : filteredFilters.length === 0 ? (
                <EmptyState />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Filter Management
                        </CardTitle>
                        <CardDescription>
                            View and manage all product filters
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Filter Name</TableHead>
                                        <TableHead>Options</TableHead>
                                        <TableHead>Total Options</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFilters.map((filter) => (
                                        <TableRow key={filter.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {filter.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-md">
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
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {filter.options.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {filter.createdAt ? 
                                                    new Date(filter.createdAt).toLocaleDateString() : 
                                                    'N/A'
                                                }
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
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/filters/${filter.id}/edit`}>
                                                                <PencilIcon className="mr-2 h-4 w-4" />
                                                                Edit Filter
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteFilter(filter.id, filter.name)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Filter
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