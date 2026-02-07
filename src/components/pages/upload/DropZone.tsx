import { Image, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getSupportedFileTypes } from '@/lib/upload'

type DropZoneProps = {
  isDragOver: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DropZone({
  isDragOver,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
}: DropZoneProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
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
            onChange={onFileInput}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  )
}
