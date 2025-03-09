"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({
  modal = false,
  defaultOpen = false,
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root> & {
  modal?: boolean
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const handleOpenChange = React.useCallback((open: boolean) => {
    // 如果是打开操作，允许打开
    if (open) {
      setIsOpen(true);
      onOpenChange?.(true);
    }
    // 如果是关闭操作，不做任何事情
  }, [onOpenChange]);

  return (
    <SheetPrimitive.Root 
      modal={false} 
      open={isOpen}
      onOpenChange={handleOpenChange}
      {...props} 
    />
  );
}

function SheetTrigger({
  className,
  position = "middle",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger> & {
  position?: "top" | "middle" | "bottom"
}) {
  const positionClasses = {
    top: "top-[100px]",
    middle: "top-[300px]",
    bottom: "top-[500px]"
  }

  return (
    <SheetPrimitive.Trigger
      data-slot="sheet-trigger"
      className={cn(
        `fixed right-0 z-50 px-4 py-2 bg-white hover:bg-gray-100 
        border-2 border-gray-200 rounded-l-lg shadow-md 
        transition-all duration-200 hover:translate-x-1
        text-gray-800 font-medium
        ${positionClasses[position]}`,
        className
      )}
      {...props}
    />
  )
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  position = "middle",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  position?: "top" | "middle" | "bottom"
}) {
  const positionClasses = {
    top: "top-[100px]",
    middle: "top-[300px]",
    bottom: "top-[500px]"
  }

  return (
    <SheetPortal>
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-white data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-40 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            `data-[state=closed]:translate-x-0 data-[state=open]:translate-x-0 right-0 h-[250px] w-3/4 border-2 border-gray-200 rounded-l-lg sm:max-w-sm ${positionClasses[position]}`,
          side === "left" &&
            `data-[state=closed]:translate-x-0 data-[state=open]:translate-x-0 left-0 h-[250px] w-3/4 border-2 border-gray-200 rounded-r-lg sm:max-w-sm ${positionClasses[position]}`,
          side === "top" &&
            "data-[state=closed]:translate-y-0 data-[state=open]:translate-y-0 inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:translate-y-0 data-[state=open]:translate-y-0 inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
