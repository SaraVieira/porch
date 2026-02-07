import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropZone } from '@/components/pages/upload/DropZone'
import { FileItem } from '@/components/pages/upload/FileItem'
import { useUpload } from '@/hooks/useUpload'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

function UploadPage() {
  const {
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
  } = useUpload()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Image Upload</h1>
        <p className="text-muted-foreground">
          Upload images to Zipline. Supports JPEG, PNG, GIF, WebP, SVG, BMP, and
          TIFF formats.
        </p>
      </div>

      <div className="grid gap-6">
        <DropZone
          isDragOver={isDragOver}
          fileInputRef={fileInputRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileInput={handleFileInput}
        />

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
                  <FileItem
                    key={index}
                    fileWithProgress={fileWithProgress}
                    apiEndpoint={apiEndpoint}
                    onUpload={uploadSingle}
                    onRemove={removeFile}
                    onCopyUrl={copyUrl}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
