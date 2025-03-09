"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "./textarea"

export interface DiaryInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'autoSave' | 'value' | 'defaultValue'> {
  onSave?: (content: string) => void
  autoSave?: boolean
  autoSaveInterval?: number // in milliseconds
  initialValue?: string
  savingIndicatorTimeout?: number // in milliseconds
}

const DiaryInput = React.forwardRef<HTMLTextAreaElement, DiaryInputProps>(
  (
    {
      className,
      onSave,
      autoSave = true,
      autoSaveInterval = 3000,
      initialValue = "",
      savingIndicatorTimeout = 1000,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = React.useState(initialValue)
    const [isSaving, setIsSaving] = React.useState(false)
    const previousContent = React.useRef(initialValue)
    const savingTimer = React.useRef<ReturnType<typeof setTimeout>>()

    // Handle content changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value)
    }

    // Save content
    const saveContent = React.useCallback(() => {
      if (!onSave || content === previousContent.current) return

      setIsSaving(true)
      onSave(content)
      previousContent.current = content

      // Clear previous timer if exists
      if (savingTimer.current) {
        clearTimeout(savingTimer.current)
      }

      // Set new timer for saving indicator
      savingTimer.current = setTimeout(() => {
        setIsSaving(false)
      }, savingIndicatorTimeout)
    }, [content, onSave, savingIndicatorTimeout])

    // Auto-save functionality
    React.useEffect(() => {
      if (!autoSave) return

      const timer = setTimeout(() => {
        saveContent()
      }, autoSaveInterval)

      return () => {
        clearTimeout(timer)
        if (savingTimer.current) {
          clearTimeout(savingTimer.current)
        }
      }
    }, [content, autoSave, autoSaveInterval, saveContent])

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (savingTimer.current) {
          clearTimeout(savingTimer.current)
        }
      }
    }, [])

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          className={cn(
            "min-h-[200px] w-full resize-none rounded-lg p-4",
            "text-base leading-relaxed",
            "focus:ring-2 focus:ring-offset-2",
            "placeholder:text-muted-foreground/50",
            className
          )}
          value={content}
          onChange={handleContentChange}
          placeholder="What happened today? Write down your thoughts..."
          {...props}
        />
        {isSaving && (
          <div className="text-muted-foreground absolute bottom-2 right-2 text-sm">
            Saving...
          </div>
        )}
      </div>
    )
  }
)

DiaryInput.displayName = "DiaryInput"

export { DiaryInput } 