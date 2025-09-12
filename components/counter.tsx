"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="icon" onClick={() => setCount((prev) => prev - 1)}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-2xl font-bold min-w-[3ch] text-center">{count}</span>
      <Button variant="outline" size="icon" onClick={() => setCount((prev) => prev + 1)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

