"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";

import { DiaryInput } from "@/components/ui/diary-input";    

export default function Home() {
  const [selectedText, setSelectedText] = useState(""); // selecte
  const [inputValue, setInputValue] = useState("");     // input 
  const [droppedText, setDroppedText] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // listener text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
    }
  };

  // Draggable Block
  function DraggableBlock({ text }: { text: string }) {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: "text-block" });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="p-2 bg-blue-100 border border-blue-400 cursor-grab"
        >
            {text}
        </div>
    );
}

  // Droppable area
  function DroppableInput() {
    const { setNodeRef, isOver } = useDroppable({ id: "input-area" });

    return (
        <DiaryInput
            ref={setNodeRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`${isOver ? "bg-green-100" : ""}`}
            placeholder="拖拽文本到这里"
        />
    );
}

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id === "text-block" && over?.id === "input-area") {
        setInputValue((prev) => prev + (prev ? " " : "") + selectedText);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开日记</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>我的日记</SheetTitle>
            <SheetDescription>
              在这里记录你的想法
            </SheetDescription>
          </SheetHeader>
          <DndContext onDragEnd={handleDragEnd}>
            {/* 文字区域 */}
            <div
                onMouseUp={handleTextSelection} 
                className="p-4 border rounded-lg bg-gray-100"
            >
                请选中这段文字，然后尝试拖拽。  
                <br /> 
                这是一个可以拖拽的文字块，请选中它并拖拽到下方的输入框中。 
            </div>

            {/* Droppable 输入框 */}
            <div className="mt-4">
                <DroppableInput />
            </div>
          </DndContext>
        </SheetContent>
      </Sheet>
    </main>
  );
}
