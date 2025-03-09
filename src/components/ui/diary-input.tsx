"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "./textarea"

export interface DiaryInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'autoSave'> {
  onSave?: (content: string) => void
  autoSave?: boolean
  autoSaveInterval?: number
  initialValue?: string
  savingIndicatorTimeout?: number
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
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = React.useState(() => initialValue)
    const [isSaving, setIsSaving] = React.useState(false)
    const previousContent = React.useRef(initialValue)
    const savingTimer = React.useRef<ReturnType<typeof setTimeout>>()

    // Handle content changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      } else {
        setContent(e.target.value)
      }
    }

    // Use controlled value if provided
    const currentValue = value !== undefined ? String(value) : content;

    // Save content
    const saveContent = React.useCallback(() => {
      if (!onSave || currentValue === previousContent.current) return

      setIsSaving(true)
      onSave(currentValue)
      previousContent.current = currentValue

      if (savingTimer.current) {
        clearTimeout(savingTimer.current)
      }

      savingTimer.current = setTimeout(() => {
        setIsSaving(false)
      }, Number(savingIndicatorTimeout))
    }, [currentValue, onSave, savingIndicatorTimeout])

    React.useEffect(() => {
      if (!autoSave) return

      const timer = setTimeout(() => {
        saveContent()
      }, Number(autoSaveInterval))

      return () => {
        clearTimeout(timer)
        if (savingTimer.current) {
          clearTimeout(savingTimer.current)
        }
      }
    }, [currentValue, autoSave, autoSaveInterval, saveContent])

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
          value={currentValue}
          onChange={handleContentChange}
          placeholder="在这里输入或拖拽文本..."
          {...props}
        />
        {isSaving && (
          <div className="text-muted-foreground absolute bottom-2 right-2 text-sm">
            保存中...
          </div>
        )}
      </div>
    )
  }
)

DiaryInput.displayName = "DiaryInput"

export { DiaryInput } 