import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import MDEditor from '@uiw/react-md-editor'

import { ArrowLeft, Calendar, Image as ImageIcon, Save } from 'lucide-react'
import type { MoodType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { uploadFileToZipline, validateFile } from '@/lib/upload'
import { MOODS } from '@/lib/consts'

export const Route = createFileRoute('/memos/create')({
  ssr: false,
  component: CreateMemoPage,
})

export interface Memo {
  id: number
  title: string
  content: string
  mood: string
  date: string
  createdAt: Date | null
  updatedAt: Date | null
}

// Client-side API function for creating memo
async function createMemo(memo: {
  title: string
  content: string
  mood: string
  date: string
}): Promise<Memo> {
  const response = await fetch('/api/memos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memo),
  })
  if (!response.ok) throw new Error('Failed to create memo')
  return response.json()
}

function CreateMemoPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState<MoodType>('neutral')
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  // Create memo mutation
  const createMemoMutation = useMutation({
    mutationFn: createMemo,
    onMutate: () => {
      setIsSaving(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] })
      toast.success('Memo created successfully!')
      router.navigate({ to: '/memos' })
    },
    onError: (error) => {
      toast.error(`Failed to create memo: ${error.message}`)
    },
    onSettled: () => {
      setIsSaving(false)
    },
  })

  const handleImageUpload = useCallback(() => {
    if (!fileInputRef.current) return
    fileInputRef.current.click()
  }, [])

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      setUploading(true)
      try {
        const result = await uploadFileToZipline(file, {
          onProgress: (progress) => {
            toast.loading(`Uploading image: ${progress}%`)
          },
          onSuccess: (uploadedFile) => {
            setContent((prevContent) => {
              const imageMarkdown = `![${uploadedFile.id}](${uploadedFile.url})`
              const newContent = prevContent
                ? prevContent + '\n' + imageMarkdown
                : imageMarkdown
              return newContent
            })
            toast.success('Image uploaded successfully!')
          },
          onError: (error) => {
            toast.error(`Upload failed: ${error}`)
          },
        })

        if (!result.success) {
          toast.error(`Upload failed: ${result.error}`)
        }
      } catch (error) {
        toast.error('Failed to upload image')
      } finally {
        setUploading(false)
      }
    },
    [],
  )

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please enter some content')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    createMemoMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      mood: selectedMood,
      date: today,
    })
  }

  const handleCancel = () => {
    router.navigate({ to: '/memos', reloadDocument: true })
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Memos
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Memo</h1>
          <p className="text-muted-foreground">
            Capture your thoughts and feelings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                New Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your memo..."
                  className="w-full"
                />
              </div>

              {/* Mood Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  How are you feeling?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map((mood) => {
                    const IconComponent = mood.icon
                    return (
                      <button
                        key={mood.type}
                        onClick={() => setSelectedMood(mood.type)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedMood === mood.type
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {mood.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Content</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImageUpload}
                      disabled={uploading}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {uploading ? 'Uploading...' : 'Add Image'}
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg">
                  <MDEditor
                    preview="edit"
                    height={200}
                    value={content}
                    onChange={(e) => setContent(e!)}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Memo'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Mood */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Mood</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const currentMood = MOODS.find((m) => m.type === selectedMood)
                if (!currentMood) return null
                const IconComponent = currentMood.icon
                return (
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">{currentMood.label}</p>
                      <Badge className={currentMood.color}>
                        {currentMood.label}
                      </Badge>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Write about what happened today</p>
              <p>• Express your feelings honestly</p>
              <p>• Include photos to capture memories</p>
              <p>• Don't worry about perfect grammar</p>
              <p>• Focus on what's important to you</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
