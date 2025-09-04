'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Trash2, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { createFilter } from "@/app/actions/admin/filter/filter"

interface FilterOption {
    name: string
    value: string
}

interface FormErrors {
    filterName?: string
    filterOptions?: (string | undefined)[]
}

export default function NewFilterPage() {
    const [filterName, setFilterName] = useState("")
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([{ name: "", value: "" }])
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)

    const handleFilterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(e.target.value)
        // Clear error when user starts typing
        if (errors.filterName) {
            setErrors(prev => ({ ...prev, filterName: undefined }))
        }
    }

    const handleFilterOptionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newOptions = [...filterOptions]
        newOptions[index] = { name: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') }
        setFilterOptions(newOptions)
        
        // Clear error for this specific option
        if (errors.filterOptions?.[index]) {
            const newOptionErrors = [...(errors.filterOptions || [])]
            newOptionErrors[index] = undefined
            setErrors(prev => ({ ...prev, filterOptions: newOptionErrors }))
        }
    }

    const handleAddFilterOption = () => {
        setFilterOptions([...filterOptions, { name: "", value: "" }])
    }

    const handleRemoveFilterOption = (index: number) => {
        const newOptions = filterOptions.filter((_, i) => i !== index)
        setFilterOptions(newOptions)
        
        // Remove corresponding error
        if (errors.filterOptions) {
            const newOptionErrors = errors.filterOptions.filter((_, i) => i !== index)
            setErrors(prev => ({ ...prev, filterOptions: newOptionErrors }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        
        // Validate filter name
        if (!filterName.trim()) {
            newErrors.filterName = "Filter name is required"
        } else if (filterName.trim().length < 2) {
            newErrors.filterName = "Filter name must be at least 2 characters"
        }
        
        // Validate filter options
        const optionErrors: string[] = []
        const seenNames = new Set<string>()
        
        filterOptions.forEach((option, index) => {
            if (!option.name.trim()) {
                optionErrors[index] = "Option name is required"
            } else if (option.name.trim().length < 2) {
                optionErrors[index] = "Option name must be at least 2 characters"
            } else if (seenNames.has(option.name.trim().toLowerCase())) {
                optionErrors[index] = "Option names must be unique"
            } else {
                seenNames.add(option.name.trim().toLowerCase())
            }
        })
        
        if (optionErrors.some(error => error)) {
            newErrors.filterOptions = optionErrors
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateFilter = async () => {
        if (!validateForm()) return
        
        setIsLoading(true)
        
        try {
            await createFilter({
                name: filterName.trim(),
                options: {
                    create: filterOptions.map(option => ({
                        value: option.value
                    }))
                }
            })

            setFilterName("")
            setFilterOptions([{ name: "", value: "" }])
            setErrors({})
            toast.success('Filter created successfully')
            
        } catch (error) {
            console.error('Error creating filter:', error)
            toast.error('Error creating filter')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Filter</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new filter to help customers find products more easily
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Filter Name Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Filter Details
                        </CardTitle>
                        <CardDescription>
                            Define the main filter name and properties
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="filter-name">Filter Name *</Label>
                            <Input
                                id="filter-name"
                                type="text"
                                placeholder="e.g., Size, Color, Brand"
                                value={filterName}
                                onChange={handleFilterNameChange}
                                className={errors.filterName ? "border-red-500" : ""}
                                aria-describedby={errors.filterName ? "filter-name-error" : undefined}
                            />
                            {errors.filterName && (
                                <p id="filter-name-error" className="text-sm text-red-500">
                                    {errors.filterName}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Filter Options Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Filter Options
                        </CardTitle>
                        <CardDescription>
                            Add the different options available for this filter
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {filterOptions.map((option, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor={`option-${index}`} className="sr-only">
                                                Filter Option {index + 1}
                                            </Label>
                                            <Input
                                                id={`option-${index}`}
                                                type="text"
                                                placeholder={`Option ${index + 1} (e.g., Small, Red, Nike)`}
                                                value={option.name}
                                                onChange={(e) => handleFilterOptionChange(e, index)}
                                                className={errors.filterOptions?.[index] ? "border-red-500" : ""}
                                                aria-describedby={errors.filterOptions?.[index] ? `option-${index}-error` : undefined}
                                            />
                                        </div>
                                        {filterOptions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveFilterOption(index)}
                                                className="shrink-0"
                                                aria-label={`Remove option ${index + 1}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {errors.filterOptions?.[index] && (
                                        <p id={`option-${index}-error`} className="text-sm text-red-500">
                                            {errors.filterOptions[index]}
                                        </p>
                                    )}
                                    {option.name && (
                                        <p className="text-xs text-muted-foreground">
                                            Value: {option.value}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddFilterOption}
                            className="w-full"
                            disabled={isLoading}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Option
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setFilterName("")
                        setFilterOptions([{ name: "", value: "" }])
                        setErrors({})
                    }}
                    disabled={isLoading}
                >
                    Clear Form
                </Button>
                <Button
                    type="button"
                    onClick={handleCreateFilter}
                    disabled={isLoading || !filterName.trim() || filterOptions.some(opt => !opt.name.trim())}
                    className="min-w-[120px]"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Filter
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}