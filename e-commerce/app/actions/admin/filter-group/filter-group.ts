'use server'

import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

// Create filter group
export async function createFilterGroup(data: Prisma.FilterGroupCreateInput) {
    try {
        const filterGroup = await db.filterGroup.create({
            data,
            include: {
                filters: {
                    include: {
                        options: true
                    }
                },
                products: true
            }
        })

        return filterGroup
    } catch (error) {
        console.error('Error creating filter group:', error)
        throw new Error('Failed to create filter group')
    }
}

// Read filter groups
export async function getFilterGroups() {
    try {
        const filterGroups = await db.filterGroup.findMany({
            include: {
                filters: {
                    include: {
                        options: true
                    }
                },
                products: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return filterGroups
    } catch (error) {
        console.error('Error fetching filter groups:', error)
        throw new Error('Failed to fetch filter groups')
    }
}

export async function getFilterGroup(id: string) {
    try {
        const filterGroup = await db.filterGroup.findUnique({
            where: { id },
            include: {
                filters: {
                    include: {
                        options: true
                    }
                },
                products: true
            }
        })

        return filterGroup
    } catch (error) {
        console.error('Error fetching filter group:', error)
        throw new Error('Failed to fetch filter group')
    }
}

// Update filter group
export async function updateFilterGroup(id: string, data: Prisma.FilterGroupUpdateInput) {
    try {
        const filterGroup = await db.filterGroup.update({
            where: { id },
            data,
            include: {
                filters: {
                    include: {
                        options: true
                    }
                },
                products: true
            }
        })

        return filterGroup
    } catch (error) {
        console.error('Error updating filter group:', error)
        throw new Error('Failed to update filter group')
    }
}

// Delete filter group
export async function deleteFilterGroup(id: string) {
    try {
        // First, disconnect all filters from this group
        await db.filter.updateMany({
            where: { filterGroupId: id },
            data: { filterGroupId: null }
        })

        // Then delete the filter group
        const filterGroup = await db.filterGroup.delete({
            where: { id }
        })

        return filterGroup
    } catch (error) {
        console.error('Error deleting filter group:', error)
        throw new Error('Failed to delete filter group')
    }
}

// Get available filters (not assigned to any group)
export async function getAvailableFilters() {
    try {
        const availableFilters = await db.filter.findMany({
            where: {
                filterGroupId: null
            },
            include: {
                options: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return availableFilters
    } catch (error) {
        console.error('Error fetching available filters:', error)
        throw new Error('Failed to fetch available filters')
    }
}

// Assign filter to filter group
export async function assignFilterToGroup(filterId: string, filterGroupId: string) {
    try {
        const filter = await db.filter.update({
            where: { id: filterId },
            data: { filterGroupId },
            include: {
                options: true
            }
        })

        return filter
    } catch (error) {
        console.error('Error assigning filter to group:', error)
        throw new Error('Failed to assign filter to group')
    }
}

// Remove filter from filter group
export async function removeFilterFromGroup(filterId: string) {
    try {
        const filter = await db.filter.update({
            where: { id: filterId },
            data: { filterGroupId: null },
            include: {
                options: true
            }
        })

        return filter
    } catch (error) {
        console.error('Error removing filter from group:', error)
        throw new Error('Failed to remove filter from group')
    }
} 