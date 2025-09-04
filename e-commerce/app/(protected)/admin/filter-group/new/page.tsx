'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Save, X } from "lucide-react"
import { toast } from "sonner"
import { createFilterGroup, getAvailableFilters } from "@/app/actions/admin/filter-group/filter-group"
import { useRouter } from "next/navigation"

interface Filter {
    id: string
    name: string
    options: { id: string; value: string }[]
}

interface FormErrors {
    groupName?: string
}

export default function NewFilterGroupPage() {
    const router = useRouter()
    const [groupName, setGroupName] = useState("")
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [availableFilters, setAvailableFilters] = useState<Filter[]>([])
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingFilters, setIsLoadingFilters] = useState(true)

    useEffect(() => {
        const fetchAvailableFilters = async () => {
            try {
                setIsLoadingFilters(true)
                const filters = await getAvailableFilters()
                setAvailableFilters(filters)
            } catch (error) {
                console.error('Error fetching available filters:', error)
                toast.error('Failed to load available filters')
            } finally {
                setIsLoadingFilters(false)
            }
        }

        fetchAvailableFilters()
    }, [])

    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value)
        // Clear error when user starts typing
        if (errors.groupName) {
            setErrors(prev => ({ ...prev, groupName: undefined }))
        }
    }

    const handleFilterSelect = (filterId: string) => {
        if (!selectedFilters.includes(filterId)) {
            setSelectedFilters([...selectedFilters, filterId])
        }
    }

    const handleRemoveFilter = (filterId: string) => {
        setSelectedFilters(selectedFilters.filter(id => id !== filterId))
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        
        // Validate group name
        if (!groupName.trim()) {
            newErrors.groupName = "Filter group name is required"
        } else if (groupName.trim().length < 2) {
            newErrors.groupName = "Filter group name must be at least 2 characters"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateFilterGroup = async () => {
        if (!validateForm()) return
        
        setIsLoading(true)
        
        try {
            await createFilterGroup({
                name: groupName.trim(),
                filters: selectedFilters.length > 0 ? {
                    connect: selectedFilters.map(id => ({ id }))
                } : undefined
            })

            toast.success('Filter group created successfully')
            router.push('/admin/filter-group')
            
        } catch (error) {
            console.error('Error creating filter group:', error)
            toast.error('Error creating filter group')
        } finally {
            setIsLoading(false)
        }
    }

    const getSelectedFilterDetails = () => {
        return selectedFilters.map(id => 
            availableFilters.find(filter => filter.id === id)
        ).filter(Boolean) as Filter[]
    }

    const unselectedFilters = availableFilters.filter(filter => 
        !selectedFilters.includes(filter.id)
    )

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Filter Group</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new filter group to organize related filters together
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Filter Group Details Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Group Details
                        </CardTitle>
                        <CardDescription>
                            Define the filter group name and properties
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Filter Group Name *</Label>
                            <Input
                                id="group-name"
                                type="text"
                                placeholder="e.g., Product Attributes, Style Options"
                                value={groupName}
                                onChange={handleGroupNameChange}
                                className={errors.groupName ? "border-red-500" : ""}
                                aria-describedby={errors.groupName ? "group-name-error" : undefined}
                            />
                            {errors.groupName && (
                                <p id="group-name-error" className="text-sm text-red-500">
                                    {errors.groupName}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Filter Assignment Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Assign Filters
                        </CardTitle>
                        <CardDescription>
                            Select filters to include in this group (optional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingFilters ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                {unselectedFilters.length > 0 ? (
                                    <div className="space-y-3">
                                        <Label>Available Filters</Label>
                                        <Select onValueChange={handleFilterSelect}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a filter to add" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unselectedFilters.map((filter) => (
                                                    <SelectItem key={filter.id} value={filter.id}>
                                                        {filter.name} ({filter.options.length} options)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4">
                                        No available filters to assign
                                    </p>
                                )}

                                {/* Selected Filters */}
                                {selectedFilters.length > 0 && (
                                    <div className="space-y-3">
                                        <Label>Selected Filters</Label>
                                        <div className="space-y-2">
                                            {getSelectedFilterDetails().map((filter) => (
                                                <div
                                                    key={filter.id}
                                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium">{filter.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {filter.options.length} options
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveFilter(filter.id)}
                                                        className="shrink-0"
                                                        aria-label={`Remove ${filter.name} from group`}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Summary Section */}
            {(groupName.trim() || selectedFilters.length > 0) && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                        <CardDescription>
                            Review your filter group before creating
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Group Name:</strong> {groupName.trim() || 'Not specified'}</p>
                            <p><strong>Filters to Include:</strong> {selectedFilters.length || 'None'}</p>
                            {selectedFilters.length > 0 && (
                                <div className="ml-4 mt-2">
                                    <ul className="list-disc space-y-1">
                                        {getSelectedFilterDetails().map((filter) => (
                                            <li key={filter.id} className="text-sm text-muted-foreground">
                                                {filter.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/filter-group')}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setGroupName("")
                        setSelectedFilters([])
                        setErrors({})
                    }}
                    disabled={isLoading}
                >
                    Clear Form
                </Button>
                <Button
                    type="button"
                    onClick={handleCreateFilterGroup}
                    disabled={isLoading || !groupName.trim()}
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
                            Create Group
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
} 