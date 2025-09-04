'use server'

import { db } from "@/lib/db"

export async function getCategories(parentId?: string) {
    const categories = await db.category.findMany({
        where: {
            parentId: parentId || null,
        },
        include: {
            children: {
                include: {
                    children: {
                        include: {
                            children: {
                                include: {
                                    children: {
                                        include: {
                                            children: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    return categories
}