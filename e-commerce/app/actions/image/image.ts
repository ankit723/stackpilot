"use server"
import { v4 as uuidv4 } from "uuid"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Readable } from "stream"
import { Storage } from "@google-cloud/storage"

// === GCS Initialization ===

let storage: Storage | null = null
let bucketName: string | null = null

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
const bucketNameEnv = process.env.GOOGLE_CLOUD_STORAGE_BUCKET
const serviceAccountKey = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY // JSON string

if (projectId && bucketNameEnv) {
  bucketName = bucketNameEnv
  try {
    if (serviceAccountKey) {
      const credentials = JSON.parse(serviceAccountKey)
      storage = new Storage({ projectId, credentials })
    } else {
      storage = new Storage({ projectId })
    }
    console.log("Google Cloud Storage initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Google Cloud Storage:", error)
    storage = null
  }
} else {
  console.warn("Google Cloud Storage not configured properly.")
}

// === Validation helpers ===

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'File size too large. Maximum size is 10MB.'
  }
  
  return null
}

// === Upload Image and Save to DB ===

export async function uploadImageAndSaveToDB(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("No file provided")
    }

    // Validate file
    const validationError = validateImage(file)
    if (validationError) {
      throw new Error(validationError)
    }

    if (!storage || !bucketName) {
      throw new Error("Google Cloud Storage is not initialized")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileId = uuidv4()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const destination = `all-images/${fileId}-${sanitizedFileName}`
    const bucket = storage.bucket(bucketName)
    const fileRef = bucket.file(destination)

    // Upload the buffer with metadata
    await new Promise<void>((resolve, reject) => {
      const stream = fileRef.createWriteStream({
        metadata: {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        },
      })

      stream.on("error", (err) => {
        console.error("Upload stream error:", err)
        reject(new Error("Failed to upload image to storage"))
      })
      
      stream.on("finish", () => resolve())
      
      Readable.from(buffer).pipe(stream)
    })

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`

    // Save to DB with additional metadata
    const savedImage = await db.image.create({
      data: {
        url: publicUrl,
        // Add metadata if your schema supports it
        // originalName: file.name,
        // fileSize: file.size,
        // contentType: file.type,
      },
    })

    revalidatePath("/admin/images")
    return { success: true, image: savedImage, url: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to upload image")
  }
}

export async function getAllImages() {
  try {
    const images = await db.image.findMany({
      orderBy: {
        id: 'desc'
      }
    })
    return images
  } catch (error) {
    console.error("Error fetching images:", error)
    throw new Error("Failed to fetch images")
  }
}

export async function addImageToCategory(categoryId: string, imageId: string) {
  try {
    // Validate that category exists
    const category = await db.category.findUnique({
      where: { id: categoryId }
    })
    
    if (!category) {
      throw new Error("Category not found")
    }

    // Validate that image exists
    const image = await db.image.findUnique({
      where: { id: imageId }
    })
    
    if (!image) {
      throw new Error("Image not found")
    }

    await db.category.update({
      where: { id: categoryId },
      data: { image: { connect: { id: imageId } } },
    })
    
    revalidatePath("/admin/category")
    return { success: true }
  } catch (error) {
    console.error("Error adding image to category:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add image to category")
  }
}

export async function addThumbnailImageToProduct(productId: string, imageId: string) {
  try {
    // Validate that product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      throw new Error("Product not found")
    }

    // Validate that image exists
    const image = await db.image.findUnique({
      where: { id: imageId }
    })
    
    if (!image) {
      throw new Error("Image not found")
    }

    await db.product.update({
      where: { id: productId },
      data: { thumbnail: { connect: { id: imageId } } },
    })
    
    revalidatePath("/admin/product")
    return { success: true }
  } catch (error) {
    console.error("Error adding image to product:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add image to product")
  }
}

export async function addImagesToProduct(productId: string, imageIds: string[]) {
  try {
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error("Product not found")
    }

    const images = await db.image.findMany({
      where: { id: { in: imageIds } }
    })

    if (images.length !== imageIds.length) {
      throw new Error("Some images not found")
    }

    await db.product.update({
      where: { id: productId },
      data: { images: { connect: imageIds.map(id => ({ id })) } },
    })

    revalidatePath("/admin/product")
    return { success: true }
  }catch (error) {
    console.error("Error adding images to product:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add images to product")
  }
}

export async function removeSingleImageFromProduct(productId: string, imageId: string) {
  try {
    await db.product.update({
      where: { id: productId },
      data: { images: { disconnect: { id: imageId } } },
    })
  }
  catch (error) {
    console.error("Error removing image from product:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to remove image from product")
  }
}

export async function deleteImage(id: string) {
  try {
    // Find the image first
    const image = await db.image.findUnique({
      where: { id },
      include: {
        // Include relations to check if image is being used
        category: true,
        product: true,
      }
    })
    
    if (!image) {
      throw new Error("Image not found")
    }

    // Check if image is being used (optional safety check)
    const isInUse = image.category || image.product
    if (isInUse) {
      console.warn(`Deleting image ${id} that is currently in use`)
    }

    if (!storage || !bucketName) {
      throw new Error("Google Cloud Storage is not initialized")
    }

    // Extract filename from URL
    const urlParts = image.url.split("/")
    const filename = urlParts[urlParts.length - 1]
    const fullPath = `all-images/${filename}`

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fullPath)

    try {
      // Check if file exists before trying to delete
      const [exists] = await file.exists()
      if (exists) {
        await file.delete()
      } else {
        console.warn(`File ${fullPath} does not exist in storage`)
      }
    } catch (storageError) {
      console.error("Error deleting file from storage:", storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await db.image.delete({
      where: { id },
    })

    revalidatePath("/admin/images")
    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete image")
  }
}

// === Additional utility functions ===

export async function getImageById(id: string) {
  try {
    const image = await db.image.findUnique({
      where: { id },
      include: {
        category: true,
        product: true,
      }
    })
    
    if (!image) {
      throw new Error("Image not found")
    }
    
    return image
  } catch (error) {
    console.error("Error fetching image:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch image")
  }
}

export async function getImagesWithPagination(page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit
    
    const [images, totalCount] = await Promise.all([
      db.image.findMany({
        orderBy: { id: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.image.count()
    ])
    
    return {
      images,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    }
  } catch (error) {
    console.error("Error fetching paginated images:", error)
    throw new Error("Failed to fetch images")
  }
}