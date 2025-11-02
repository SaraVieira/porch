# Image Upload Feature

This project includes a comprehensive image upload page that integrates with the Zipline API for file hosting and sharing, along with reusable upload utilities for custom implementations.

## Features

- **Drag & Drop Upload**: Simply drag image files onto the upload area
- **File Selection**: Click to browse and select multiple image files
- **Image Format Support**: Supports JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF formats
- **Progress Tracking**: Real-time upload progress for each file
- **Batch Upload**: Upload multiple files at once or individually
- **URL Copying**: One-click copy of uploaded file URLs
- **Error Handling**: Clear error messages and retry functionality
- **Environment-based Authentication**: Secure token management via environment variables
- **Reusable Upload Utilities**: Modular functions for custom upload implementations
- **Toast Notifications**: User-friendly feedback for all actions

## Setup

### 1. Environment Configuration (Optional)

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Your Zipline instance URL (without trailing slash)
VITE_ZIPLINE_API_ENDPOINT=https://your-zipline-instance.com

# Your Zipline API token (REQUIRED)
VITE_ZIPLINE_API_TOKEN=your_api_token_here
```

### 2. Get Your Zipline API Token

1. Log into your Zipline instance
2. Go to your user settings/profile
3. Generate or copy your API token
4. Add it to your `.env` file as `VITE_ZIPLINE_API_TOKEN`

## Usage

1. Navigate to `/upload` in your application
2. Configure your Zipline Instance URL (if not set in environment)
3. Upload images:
   - **Drag & Drop**: Drag image files onto the upload area
   - **File Browser**: Click "Select Images" to browse files
   - **Multiple Files**: Select or drop multiple files at once
4. Manage uploads:
   - **Individual Upload**: Click the upload button next to each file
   - **Batch Upload**: Click "Upload All" to upload all pending files
   - **Remove Files**: Click the X button to remove files from the queue
   - **Clear All**: Remove all files from the queue
5. Copy URLs:
   - After successful upload, click the copy button next to the file URL
   - URLs are automatically copied to your clipboard

## Supported File Types

- JPEG/JPG (`image/jpeg`)
- PNG (`image/png`)
- GIF (`image/gif`)
- WebP (`image/webp`)
- SVG (`image/svg+xml`)
- BMP (`image/bmp`)
- TIFF (`image/tiff`)

## File Status Indicators

- **Pending**: File is ready to upload (gray badge)
- **Uploading**: File is currently uploading with progress bar (blue badge)
- **Success**: File uploaded successfully (green badge with checkmark)
- **Error**: Upload failed with error message (red badge with alert icon)

## API Integration

This upload page integrates with the Zipline API endpoint `/api/upload`. The implementation:

- Uses `multipart/form-data` for file uploads
- Includes proper authentication headers
- Handles progress tracking via XMLHttpRequest
- Provides comprehensive error handling
- Supports the Zipline API response format

### API Response Format

Successful uploads return:
```json
{
  "files": [
    {
      "id": "file_id",
      "type": "image/png",
      "url": "https://your-zipline-instance.com/u/filename.png"
    }
  ],
  "deletesAt": "2024-01-01T00:00:00Z", // Optional
  "assumedMimetypes": [false] // Optional
}
```

## Error Handling

The upload page handles various error scenarios:

- **401 Unauthorized**: Invalid or missing API token
- **403 Forbidden**: Insufficient permissions
- **413 Payload Too Large**: File exceeds size limits
- **400 Bad Request**: Invalid file format or malformed request
- **500 Internal Server Error**: Server-side errors
- **Network Errors**: Connection issues

## Security Considerations

- **Environment-Only Authentication**: API tokens are handled securely via environment variables only
- **No UI Token Exposure**: Tokens are never exposed in the UI, forms, or logs
- **Server-Side Configuration**: All sensitive configuration is managed server-side via environment variables
- **File Type Validation**: Strict validation prevents uploading non-image files
- **Secure Transmission**: HTTPS is recommended for production deployments
- **No Token Storage**: Tokens are not stored in browser localStorage or sessionStorage
- **Build-Time Security**: Tokens are embedded at build time, not runtime, reducing exposure risk

## Troubleshooting

### Common Issues

1. **"API token not configured" Error**
   - Ensure `VITE_ZIPLINE_API_TOKEN` is set in your `.env` file
   - Verify the token has upload permissions
   - Restart your development server after adding the token

2. **"Network Error"**
   - Check your Zipline instance URL is correct and accessible
   - Verify CORS settings on your Zipline instance allow requests from your domain

3. **Files Not Uploading**
   - Ensure files are supported image formats
   - Check file size limits on your Zipline instance
   - Verify you have sufficient quota/storage space

4. **CORS Issues**
   - Configure your Zipline instance to allow requests from your domain
   - Check browser developer tools for CORS-related errors

### Browser Support

This upload feature requires modern browser support for:
- File API
- XMLHttpRequest Level 2
- Drag and Drop API
- Clipboard API (for URL copying)

Supported browsers: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

## Upload Utility Usage

The upload functionality has been extracted into reusable utilities located in `src/lib/upload.ts`. You can use these utilities in other components for custom upload implementations.

### Basic Single File Upload

```typescript
import { uploadFileToZipline } from '@/lib/upload'

const uploadFile = async (file: File) => {
  const result = await uploadFileToZipline(file, {
    onProgress: (progress) => console.log(`Progress: ${progress}%`),
    onSuccess: (result) => console.log('Upload successful:', result.url),
    onError: (error) => console.error('Upload failed:', error)
  })
  
  if (result.success) {
    // Use result.data.url
  }
}
```

### Multiple File Upload

```typescript
import { uploadMultipleFiles } from '@/lib/upload'

const uploadFiles = async (files: File[]) => {
  const results = await uploadMultipleFiles(files, {
    onFileProgress: (file, progress) => console.log(`${file.name}: ${progress}%`),
    onFileSuccess: (file, result) => console.log(`${file.name} uploaded: ${result.url}`),
    onFileError: (file, error) => console.error(`${file.name} failed: ${error}`)
  })
}
```

### File Validation

```typescript
import { validateFile, validateImageFile } from '@/lib/upload'

// Basic image type validation
const isValid = validateImageFile(file) // returns boolean

// Detailed validation with error messages
const validation = validateFile(file)
if (!validation.valid) {
  console.error(validation.error)
}
```

### Custom Configuration

You can override default settings:

```typescript
const result = await uploadFileToZipline(file, {
  apiEndpoint: 'https://custom-zipline.com',
  token: 'custom-token',
  onProgress: (progress) => updateProgressBar(progress)
})
```

### Available Utility Functions

- `uploadFileToZipline(file, options)` - Upload a single file
- `uploadMultipleFiles(files, options)` - Upload multiple files sequentially
- `validateImageFile(file)` - Check if file is a supported image type
- `validateFile(file)` - Validate file with detailed error messages
- `formatFileSize(bytes)` - Format file size for display
- `getSupportedFileTypes()` - Get accepted file types for input elements

### Example Implementation

See `src/lib/upload-example.tsx` for complete usage examples including:
- Simple single file upload
- Multiple file upload with progress tracking
- Custom configuration
- Form integration
- Drag and drop implementation