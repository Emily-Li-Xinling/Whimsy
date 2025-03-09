import {
    DndContext,
    useDraggable,
    useDroppable,
    DragEndEvent
} from "@dnd-kit/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/diary-input";

export default function App() {
    const [selectedText, setSelectedText] = useState(""); // 被选中的文本
    const [inputValue, setInputValue] = useState("");     // 输入框内容

    // 监听文本选中
    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            setSelectedText(selection.toString().trim());
        }
    };

    // 拖拽的 Block
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

    // Droppable 区域 (输入框)
    function DroppableInput() {
        const { setNodeRef, isOver } = useDroppable({ id: "input-area" });

        return (
            <Input
                ref={setNodeRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`${isOver ? "bg-green-100" : ""}`}
                placeholder="拖拽文本到这里"
            />
        );
    }

    // 拖拽完成时的逻辑
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id === "text-block" && over?.id === "input-area") {
            setInputValue((prev) => prev + (prev ? " " : "") + selectedText);
        }
    };

    return (
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

            {/* 选中后的 block */}
            {selectedText && <DraggableBlock text={selectedText} />}

            {/* Droppable 输入框 */}
            <div className="mt-4">
                <DroppableInput />
            </div>
        </DndContext>
    );
}
