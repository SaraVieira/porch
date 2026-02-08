import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { UploadedFile } from '@/lib/upload'
import { uploadFileToZipline, validateImageFile } from '@/lib/upload'

export interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  result?: UploadedFile
  error?: string
}

export function useUpload() {
  const [files, setFiles] = useState<Array<FileWithProgress>>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const apiEndpoint = import.meta.env.VITE_ZIPLINE_API_ENDPOINT
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (fileWithProgress: FileWithProgress) => {
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
      handleFiles(Array.from(e.dataTransfer.files))
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
        handleFiles(Array.from(e.target.files))
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

  return {
    files,
    isDragOver,
    apiEndpoint,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    removeFile,
    clearAllFiles,
    uploadSingle,
    uploadAll,
    copyUrl,
  }
}
