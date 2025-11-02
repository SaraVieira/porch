import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Check, Copy, Image, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  uploadFileToZipline,
  validateImageFile,
  formatFileSize,
  getSupportedFileTypes,
  type UploadedFile,
} from '@/lib/upload'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  result?: UploadedFile
  error?: string
}

function UploadPage() {
  const [files, setFiles] = useState<Array<FileWithProgress>>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const apiEndpoint = import.meta.env.VITE_ZIPLINE_API_ENDPOINT

  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (
    fileWithProgress: FileWithProgress,
  ): Promise<void> => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file === fileWithProgress.file
          ? { ...f, status: 'uploading', progress: 0 }
          : f,
      ),
    )

    await uploadFileToZipline(fileWithProgress.file, {
      apiEndpoint,
      onProgress: (progress) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileWithProgress.file ? { ...f, progress } : f,
          ),
        )
      },
      onSuccess: (result) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileWithProgress.file
              ? { ...f, status: 'success', progress: 100, result }
              : f,
          ),
        )
      },
      onError: (error) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileWithProgress.file
              ? { ...f, status: 'error', error }
              : f,
          ),
        )
      },
    })
  }

  const handleFiles = useCallback((newFiles: Array<File>) => {
    const validFiles = newFiles.filter(validateImageFile)
    const invalidFiles = newFiles.filter((f) => !validateImageFile(f))

    if (invalidFiles.length > 0) {
      toast.warning(
        `${invalidFiles.length} file(s) were skipped because they are not supported image types.`,
      )
    }

    const filesWithProgress: Array<FileWithProgress> = validFiles.map(
      (file) => ({
        file,
        progress: 0,
        status: 'pending',
      }),
    )

    setFiles((prev) => [...prev, ...filesWithProgress])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files)
        handleFiles(selectedFiles)
        e.target.value = ''
      }
    },
    [handleFiles],
  )

  const removeFile = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== fileToRemove))
  }

  const clearAllFiles = () => {
    setFiles([])
    toast.success('All files cleared')
  }

  const uploadSingle = async (fileWithProgress: FileWithProgress) => {
    await uploadFile(fileWithProgress)
  }

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')

    for (const file of pendingFiles) {
      await uploadFile(file)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Image Upload</h1>
        <p className="text-muted-foreground">
          Upload images to Zipline. Supports JPEG, PNG, GIF, WebP, SVG, BMP, and
          TIFF formats.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag and drop images here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF files
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={getSupportedFileTypes()}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Files ({files.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearAllFiles}
                    disabled={files.length === 0}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={uploadAll}
                    disabled={
                      !apiEndpoint.trim() ||
                      files.every((f) => f.status !== 'pending')
                    }
                  >
                    Upload All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((fileWithProgress, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium truncate">
                          {fileWithProgress.file.name}
                        </p>
                        <Badge
                          variant={
                            fileWithProgress.status === 'success'
                              ? 'default'
                              : fileWithProgress.status === 'error'
                                ? 'destructive'
                                : fileWithProgress.status === 'uploading'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {fileWithProgress.status === 'success' && (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          {fileWithProgress.status === 'error' && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {fileWithProgress.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(fileWithProgress.file.size)} •{' '}
                        {fileWithProgress.file.type}
                      </p>

                      {fileWithProgress.status === 'uploading' && (
                        <Progress
                          value={fileWithProgress.progress}
                          className="mt-2"
                        />
                      )}

                      {fileWithProgress.status === 'error' && (
                        <p className="text-sm text-destructive mt-2">
                          {fileWithProgress.error}
                        </p>
                      )}

                      {fileWithProgress.result && (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            value={fileWithProgress.result.url}
                            readOnly
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyUrl(fileWithProgress.result!.url)
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {fileWithProgress.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => uploadSingle(fileWithProgress)}
                          disabled={!apiEndpoint.trim()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(fileWithProgress.file)}
                        disabled={fileWithProgress.status === 'uploading'}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
