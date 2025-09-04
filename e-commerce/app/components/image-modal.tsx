'use client'

import { useState } from "react"
import { uploadImageAndSaveToDB } from "@/app/actions/image/image"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { toast } from "sonner"

interface UploadImageModalProps {
  isUploadOpen: boolean
  setIsUploadOpen: (open: boolean) => void
  onUploadSuccess?: () => void
}

interface FileWithStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const UploadImageModal = ({ isUploadOpen, setIsUploadOpen, onUploadSuccess }: UploadImageModalProps) => {
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return

    const fileArray = Array.from(selected).map(file => ({
      file,
      status: 'pending' as const,
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...fileArray])
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const totalFiles = files.length
      let completedFiles = 0

      // Upload files sequentially to show proper progress
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        
        // Update file status to uploading
        setFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'uploading' } : item
        ))

        try {
          const formData = new FormData()
          formData.append("file", fileItem.file)
          
          await uploadImageAndSaveToDB(formData)
          
          // Update file status to success
          setFiles(prev => prev.map((item, index) => 
            index === i ? { ...item, status: 'success', progress: 100 } : item
          ))
          
          completedFiles++
          
        } catch (error) {
          // Update file status to error
          setFiles(prev => prev.map((item, index) => 
            index === i ? { 
              ...item, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } : item
          ))
          
          toast.error(`Failed to upload ${fileItem.file.name}`)
        }
        
        // Update overall progress
        setUploadProgress((completedFiles / totalFiles) * 100)
      }

      // Check if all files were uploaded successfully
      const successfulUploads = files.filter(f => f.status === 'success').length
      
      if (successfulUploads > 0) {
        toast.success(`Successfully uploaded ${successfulUploads} image${successfulUploads > 1 ? 's' : ''}`)
        onUploadSuccess?.()
      }

      // Close modal if all files were successful
      const allSuccessful = files.every(f => f.status === 'success')
      if (allSuccessful) {
        setFiles([])
        setIsUploadOpen(false)
      }

    } catch (err) {
      console.error("Upload failed:", err)
      toast.error("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getStatusIcon = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Upload className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 border-blue-200'
      case 'success':
        return 'bg-green-100 border-green-200'
      case 'error':
        return 'bg-red-100 border-red-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const hasErrors = files.some(f => f.status === 'error')
  const allCompleted = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error')

  return (
    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Select and upload one or more images. Supported formats: JPEG, PNG, WebP, GIF (max 10MB each)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              You can select multiple images at once
            </p>
          </div>

          {/* Overall Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* File Preview */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Files to Upload</h4>
                <Badge variant="outline">
                  {files.length} file{files.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="max-h-[300px] overflow-auto space-y-2">
                {files.map((fileItem, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(fileItem.status)}`}
                  >
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                      <Image 
                        src={URL.createObjectURL(fileItem.file)} 
                        alt="Preview" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileItem.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {fileItem.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(fileItem.status)}
                      
                      {fileItem.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsUploadOpen(false)}
            disabled={isUploading}
          >
            {allCompleted ? 'Close' : 'Cancel'}
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={pendingFiles.length === 0 || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingFiles.length} Image{pendingFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
          
          {hasErrors && (
            <Button
              variant="destructive"
              onClick={() => setFiles(prev => prev.filter(f => f.status !== 'error'))}
              disabled={isUploading}
            >
              Remove Failed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UploadImageModal
