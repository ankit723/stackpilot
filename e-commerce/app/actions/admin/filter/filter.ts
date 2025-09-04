'use server'

import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

//create filter and filter option
export async function createFilter(data: Prisma.FilterCreateInput) {
    const filter = await db.filter.create({
        data
    })

    return filter
}

export async function createFilterOption(data: Prisma.FilterOptionCreateInput) {
    const filterOption = await db.filterOption.create({
        data
    })

    return filterOption
}


//read filter and filter option

export async function getFilters() {
    const filters = await db.filter.findMany({
        include: {
            options: true
        }
    })

    return filters
}

export async function getFilterOptions(filterId: string) {
    const filterOptions = await db.filterOption.findMany({
        where: {
            filterId
        },
        include: {
            filter: true
        }
    })

    return filterOptions
}

//update filter and filter option

export async function updateFilter(filterId: string, data: Prisma.FilterUpdateInput) {
    const filter = await db.filter.update({
        where: { id: filterId },
        data
    })

    return filter
}

export async function updateFilterOption(filterOptionId: string, data: Prisma.FilterOptionUpdateInput) {
    const filterOption = await db.filterOption.update({
        where: { id: filterOptionId },
        data
    })

    return filterOption
}

//delete filter and filter option

export async function deleteFilter(filterId: string) {
    const filter = await db.filter.delete({
        where: { id: filterId }
    })

    return filter
}

export async function deleteFilterOption(filterOptionId: string) {
    const filterOption = await db.filterOption.delete({
        where: { id: filterOptionId }
    })

    return filterOption
}