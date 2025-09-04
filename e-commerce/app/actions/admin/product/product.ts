"use server"

import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { generateCartesianProduct, slugify } from "@/lib/utils"

export const generateUniqueSlugAndSKU = async (baseSlug: string, filterOptions: string[]): Promise<string> => {

    const filterOptionValues = await Promise.all(filterOptions.map(async (id) => {
        const filterOption = await db.filterOption.findUnique({ where: { id } })
        return filterOption?.value
    }))

    const slug = slugify(baseSlug) + "-" + filterOptionValues.join("-")
    return slug

}

async function createVariants({
  baseProductData,
  cartesianOptions,
}: {
  baseProductData: Prisma.ProductCreateInput
  cartesianOptions: string[][]
}) {
  const variants: Prisma.ProductCreateInput[] = []

  for (let i = 0; i < cartesianOptions.length; i++) {
    const filterOptionIds = cartesianOptions[i]

    const variantName = `${baseProductData.name} - ${filterOptionIds.join(" / ")}`
    const variantSKU = await generateUniqueSlugAndSKU(baseProductData.sku || baseProductData.name, filterOptionIds)

    const variant: Prisma.ProductCreateInput = {
      ...baseProductData,
      name: variantName,
      slug: await generateUniqueSlugAndSKU(variantName, filterOptionIds),
      sku: variantSKU,
      type: "SIMPLE",
      productFilterOptions: {
        create: filterOptionIds.map(id => ({
          filterOption: { connect: { id } }
        }))
      },
    }

    variants.push(variant)
  }

  return Promise.all(
    variants.map(variant => db.product.create({ data: variant }))
  )
}

export async function createProduct(
  productData: Prisma.ProductCreateInput,
  type: "SIMPLE" | "CONFIGURABLE",
  selectedProductFilterOptions: string[][]
) {
  try {
    const finalSlug = await generateUniqueSlugAndSKU(productData.name, [])
    const finalSKU = await generateUniqueSlugAndSKU(productData.name, [])

    const { category, filterGroup, ...restProductData } = productData

    const baseProduct = await db.product.create({
      data: {
        ...restProductData,
        slug: finalSlug,
        sku: finalSKU,
        type,
        category: {
          connect: {
            id: category?.connect?.id
          }
        },
        filterGroup: {
          connect: {
            id: filterGroup?.connect?.id
          }
        },
      }
    })

    if (type === "CONFIGURABLE") {
        const cartesianOptions = generateCartesianProduct(selectedProductFilterOptions)

        await createVariants({
            baseProductData: {
                ...restProductData,
                parent: {
                    connect: {
                        id: baseProduct.id
                    }
                },
                 category: {
                    connect: {
                        id: category?.connect?.id
                    }
                },
                filterGroup: {
                    connect: {
                        id: filterGroup?.connect?.id
                    }
                },
            },
            cartesianOptions
        })
    }
    return baseProduct
  } catch (err) {
    console.error("❌ Product creation failed:", err)
    throw new Error("Product creation failed")
  }
}

export async function updateProduct(
  productId: string,
  productData: Prisma.ProductUpdateInput,
  tags: string[] | undefined
) {
  try {

    const product = await db.product.update({
      where: { id: productId },
      data: {
        ...productData,
        tags: {
          deleteMany: {},
          create: tags?.map(tagId => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
    })
    return product
  } catch (err) {
    console.error("❌ Product update failed:", err)
    throw new Error("Product update failed")
  }
}

export async function getProducts() {
    const products = await db.product.findMany({
        where: {
            // only get parent products
            parentId: null
        },
        include: {
            category: true,
            thumbnail: true,
            tags: {
                include: {
                    tag: true
                }
            },
            children: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return products
}

export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
        where: { id },
        include: {
            category: true,
            filterGroup: {
                include: {
                    filters: {
                        include: {
                            options: true
                        }
                    }
                }
            },
            tags: {
                include: {
                    tag: true
                }
            },
            productFilterOptions: {
                include: {
                    filterOption: true
                }
            },
            children: {
                include: {
                    productFilterOptions: {
                        include: {
                            filterOption: {
                                include: {
                                    filter: true
                                }
                            }
                        }
                    }
                }
            },
            images: true,
            thumbnail: true
        }
    })

    return product;
  } catch (err) {
    console.error("❌ Product retrieval failed:", err)
    throw new Error("Product retrieval failed")
  }
}