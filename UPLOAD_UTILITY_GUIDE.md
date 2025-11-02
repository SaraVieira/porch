# Upload Utility Quick Start Guide

This guide shows you how to use the Zipline upload utility in any component.

## Import the Functions

```typescript
import { uploadFileToZipline, validateFile } from '@/lib/upload'
```

## Basic Usage

### Upload a Single File

```typescript
const handleFileUpload = async (file: File) => {
  // Validate first
  const validation = validateFile(file)
  if (!validation.valid) {
    alert(validation.error)
    return
  }

  // Upload the file
  const result = await uploadFileToZipline(file, {
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`)
    },
    onSuccess: (uploadedFile) => {
      console.log('Upload successful:', uploadedFile.url)
      // Copy URL to clipboard or use it
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    }
  })

  if (result.success) {
    // File uploaded successfully
    const fileUrl = result.data.url
    // Do something with the URL
  }
}
```

### Simple File Input

```typescript
const FileUploader = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    const result = await uploadFileToZipline(file, {
      onSuccess: (result) => setUploadedUrl(result.url),
      onError: (error) => alert(error)
    })
    
    setUploading(false)
  }

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {uploadedUrl && <p>Uploaded: {uploadedUrl}</p>}
    </div>
  )
}
```

### Drag & Drop Example

```typescript
const DropZone = () => {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(f => f.type.startsWith('image/'))

    if (imageFile) {
      await uploadFileToZipline(imageFile, {
        onSuccess: (result) => {
          // Handle success
          navigator.clipboard.writeText(result.url)
        }
      })
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      style={{
        border: dragOver ? '2px solid blue' : '2px dashed gray',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      Drop an image here
    </div>
  )
}
```

## Environment Setup

Make sure you have these in your `.env` file:

```bash
VITE_ZIPLINE_API_ENDPOINT=https://your-zipline-instance.com
VITE_ZIPLINE_API_TOKEN=your_api_token_here
```

## Available Functions

- `uploadFileToZipline(file, options)` - Upload a single file
- `validateFile(file)` - Validate file with error messages
- `validateImageFile(file)` - Quick boolean check for image files
- `formatFileSize(bytes)` - Format file size for display

## Return Values

### uploadFileToZipline Response

```typescript
{
  success: boolean
  data?: {
    id: string
    type: string
    url: string
  }
  error?: string
}
```

That's it! You can now upload files from anywhere in your app.