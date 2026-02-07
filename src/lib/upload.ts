export interface UploadedFile {
  id: string
  type: string
  url: string
  pending?: boolean
}

export interface UploadResponse {
  files: Array<UploadedFile>
  deletesAt?: string
  assumedMimetypes?: Array<boolean>
}

export interface UploadOptions {
  onProgress?: (progress: number) => void
  onSuccess?: (result: UploadedFile) => void
  onError?: (error: string) => void
  apiEndpoint?: string
  token?: string
}

export interface UploadResult {
  success: boolean
  data?: UploadedFile
  error?: string
}

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
]

export const validateImageFile = (file: File): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(file.type)
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const uploadFileToZipline = async (
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> => {
  const {
    onProgress,
    onSuccess,
    onError,
    apiEndpoint = import.meta.env.VITE_ZIPLINE_API_ENDPOINT ||
      'https://your-zipline-instance.com',
    token = import.meta.env.VITE_ZIPLINE_API_TOKEN || '',
  } = options

  // Validate file type
  if (!validateImageFile(file)) {
    const error = `File type ${file.type} is not supported. Only image files are allowed.`
    onError?.(error)
    return { success: false, error }
  }

  // Validate token
  if (!token) {
    const error =
      'API token not configured. Please set VITE_ZIPLINE_API_TOKEN in your environment.'
    onError?.(error)
    return { success: false, error }
  }

  // Validate endpoint
  if (!apiEndpoint.trim()) {
    const error =
      'API endpoint not configured. Please set VITE_ZIPLINE_API_ENDPOINT.'
    onError?.(error)
    return { success: false, error }
  }

  const formData = new FormData()
  formData.append('file', file)

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress?.(progress)
      }
    })

    // Handle successful response
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response: UploadResponse = JSON.parse(xhr.responseText)
          const uploadedFile = response.files[0]

          onSuccess?.(uploadedFile)
          resolve({ success: true, data: uploadedFile })
        } catch (error) {
          const errorMessage = 'Failed to parse server response'
          onError?.(errorMessage)
          resolve({ success: false, error: errorMessage })
        }
      } else {
        let errorMessage = `Upload failed (${xhr.status})`
        try {
          const errorResponse = JSON.parse(xhr.responseText)
          errorMessage = errorResponse.message || errorMessage
        } catch {
          // Use default error message if response can't be parsed
        }

        onError?.(errorMessage)
        resolve({ success: false, error: errorMessage })
      }
    })

    // Handle network errors
    xhr.addEventListener('error', () => {
      const errorMessage = 'Network error occurred during upload'
      onError?.(errorMessage)
      resolve({ success: false, error: errorMessage })
    })

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      const errorMessage = 'Upload request timed out'
      onError?.(errorMessage)
      resolve({ success: false, error: errorMessage })
    })

    // Configure and send request
    xhr.open('POST', `${apiEndpoint}/api/upload`)
    xhr.setRequestHeader('Authorization', token)
    xhr.timeout = 60000 // 60 second timeout
    xhr.send(formData)
  })
}

export const uploadMultipleFiles = async (
  files: Array<File>,
  options: Omit<UploadOptions, 'onProgress' | 'onSuccess' | 'onError'> & {
    onFileProgress?: (file: File, progress: number) => void
    onFileSuccess?: (file: File, result: UploadedFile) => void
    onFileError?: (file: File, error: string) => void
    onComplete?: (results: Array<UploadResult>) => void
  } = {},
): Promise<Array<UploadResult>> => {
  const {
    onFileProgress,
    onFileSuccess,
    onFileError,
    onComplete,
    ...uploadOptions
  } = options

  const results: Array<UploadResult> = []

  for (const file of files) {
    const result = await uploadFileToZipline(file, {
      ...uploadOptions,
      onProgress: (progress) => onFileProgress?.(file, progress),
      onSuccess: (uploadedFile) => onFileSuccess?.(file, uploadedFile),
      onError: (error) => onFileError?.(file, error),
    })

    results.push(result)
  }

  onComplete?.(results)
  return results
}

// Helper function to get supported file types for input accept attribute
export const getSupportedFileTypes = (): string => {
  return ACCEPTED_IMAGE_TYPES.join(',')
}

// Helper function to check if file is valid before upload
export const validateFile = (
  file: File,
): { valid: boolean; error?: string } => {
  if (!validateImageFile(file)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Only image files are allowed.`,
    }
  }

  // Check file size (optional - can be configured)
  const maxSize = 100 * 1024 * 1024 // 100MB default
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}.`,
    }
  }

  return { valid: true }
}
