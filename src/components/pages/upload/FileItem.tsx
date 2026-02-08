import { AlertCircle, Check, Copy, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatFileSize } from '@/lib/upload'
import type { FileWithProgress } from '@/hooks/useUpload'

type FileItemProps = {
  fileWithProgress: FileWithProgress
  apiEndpoint: string
  onUpload: (f: FileWithProgress) => void
  onRemove: (file: File) => void
  onCopyUrl: (url: string) => void
}

export function FileItem({
  fileWithProgress,
  apiEndpoint,
  onUpload,
  onRemove,
  onCopyUrl,
}: FileItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-medium truncate">{fileWithProgress.file.name}</p>
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
          <Progress value={fileWithProgress.progress} className="mt-2" />
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
              onClick={() => onCopyUrl(fileWithProgress.result!.url)}
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
            onClick={() => onUpload(fileWithProgress)}
            disabled={!apiEndpoint.trim()}
          >
            <Upload className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(fileWithProgress.file)}
          disabled={fileWithProgress.status === 'uploading'}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
