'use server'

import { db } from "@/lib/db"

export async function createTag(name: string, slug: string) {
    try {
        const tag = await db.tag.create({
            data: {
                name,
                slug
            }
        })
        return { success: "Tag created successfully", tag }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create tag" }
    }
}

export async function getTags() {
    try {
        const tags = await db.tag.findMany()
        return { success: "Tags fetched successfully", tags }
    } catch (error) {
        console.error(error)
        return { error: "Failed to get tags" }
    }
}

export async function getTagById(id: string) {  
    try {
        const tag = await db.tag.findUnique({
            where: { id }
        })
        return { success: "Tag fetched successfully", tag }
    } catch (error) {   
        console.error(error)
        return { error: "Failed to get tag" }
    }
}

export async function getTagProducts(id: string) {
    try {
        const tag = await db.tag.findUnique({
            where: { id },
            include: { 
                products: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    select: {
                                        id: true,
                                        url: true
                                    }
                                }
                            }
                        }
                    }
                } 
            }
        })
        return { success: "Tag products fetched successfully", products: tag?.products }
    } catch (error) {
        console.error(error)
        return { error: "Failed to get tag products" }
    }
}

export async function updateTag(id: string, name: string, slug: string) {
    try {
        const tag = await db.tag.update({
            where: { id },
            data: { name, slug }
        })
        return { success: "Tag updated successfully", tag }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update tag" }
    }
}

export async function deleteTag(id: string) {
    try {
        await db.tag.delete({ where: { id } })
        return { success: "Tag deleted successfully" }
    } catch (error) {
        console.error(error)
        return { error: "Failed to delete tag" }
    }
}