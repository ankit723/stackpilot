'use server'

import { db } from "@/lib/db"
import { Category, Prisma } from "@prisma/client"

// create category
export async function createCategory(data: Prisma.CategoryCreateInput) {
    const category = await db.category.create({
        data,
        include: {
            children: true,
            parent: true,
            image: {
                select: {
                    id: true,
                    url: true
                }
            }
        }
    })

    return category
}

// Create category with children
export async function createCategoryWithChildren(data: {
    name: string
    slug: string
    parentId?: string
    children?: { name: string; slug: string }[]
}) {
    const { children, parentId, ...categoryData } = data
    
    const category = await db.category.create({
        data: {
            ...categoryData,
            parent: parentId ? { connect: { id: parentId } } : undefined,
            children: children ? {
                create: children.map(child => ({
                    name: child.name,
                    slug: child.slug
                }))
            } : undefined
        },
        include: {
            children: true,
            parent: true,
            image: {
                select: {
                    id: true,
                    url: true
                }
            }
        }
    })

    return category
}

// Create child category
export async function createChildCategory(parentId: string, data: {
    name: string
    slug: string
}) {
    const childCategory = await db.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            parent: {
                connect: { id: parentId }
            }
        },
        include: {
            parent: true,
            children: true
        }
    })

    return childCategory
}

// Get full category path
export async function getCategoryPath(categoryId: string): Promise<string[]> {
    const category = await db.category.findUnique({
        where: { id: categoryId },
        include: {
            parent: {
                include: {
                    parent: {
                        include: {
                            parent: {
                                include: {
                                    parent: true // Support up to 5 levels deep
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!category) return []

    const path: string[] = []
    let current = category
    
    // Build path from current category up to root
    while (current) {
        path.unshift(current.name)
        current = current.parent as any
    }
    
    return path
}

// Get category tree with full hierarchy
export async function getCategoryTree() {
    const categories = await db.category.findMany({
        include: {
            children: {
                include: {
                    children: {
                        include: {
                            children: {
                                include: {
                                    children: true
                                }
                            }
                        }
                    }
                }
            },
            parent: true
        },
        orderBy: {
            name: 'asc'
        }
    })

    // Filter to get only root categories (no parent)
    const rootCategories = categories.filter(category => !category.parentId)
    
    return rootCategories
}

// read categories
export async function getCategories() {
    const categories = await db.category.findMany(
        {
            include: {
                children: true,
                parent: true,
                image: {
                    select: {
                        id: true,
                        url: true
                    }
                }
            }
        }
    )

    const categoryMap = new Map();
    categories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
    });

    const tree: Category[] = [];
    categories.forEach(category => {
        if (category.parentId) {
            const parent = categoryMap.get(category.parentId);
            if (parent) {
                parent.children.push(categoryMap.get(category.id));
            }
        } else {
            tree.push(categoryMap.get(category.id));
        }
    });

    return tree;
}

export async function getCategoryById(id: string) {
    const category = await db.category.findUnique({
        where: { id },
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
                                            products: true,
                                            image: {
                                                select: {
                                                    id: true,
                                                    url: true
                                                }
                                            }
                                        }
                                    },
                                    products: true,
                                    image: {
                                        select: {
                                            id: true,
                                            url: true
                                        }
                                    }
                                }
                            },
                            products: true,
                            image: {
                                select: {
                                    id: true,
                                    url: true
                                }
                            }
                        }
                    },
                    products: true,
                    image: {
                        select: {
                            id: true,
                            url: true
                        }
                    }
                }
            },
            parent: true,
            products: true,
            image: {
                select: {
                    id: true,
                    url: true
                }
            }
        }
    })

    return category
}

export async function getCategoryBySlug(slug: string) {
    const category = await db.category.findUnique({
        where: { slug },
        include: {
            children: true,
            parent: true,
            image: {
                select: {
                    id: true,
                    url: true
                }
            }
        }
    })

    return category
}

export async function getCategoryParent(id: string) {
    const category = await db.category.findUnique({
        where: { id },
        include: {
            parent: true
        }
    })

    return category
}

// update category
export async function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    const category = await db.category.update({
        where: { id },
        data,
        include: {
            children: true,
            parent: true,
            image: {
                select: {
                    id: true,
                    url: true
                }
            }
        }
    })

    return category
}

// delete category
export async function deleteCategory(id: string) {
    const category = await db.category.delete({
        where: { id }
    })

    return category
}