"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"

type Task = {
  id: number
  text: string
  completed: boolean
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [inputValue, setInputValue] = useState("")

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputValue, completed: false }])
      setInputValue("")
    }
  }

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task"
        />
        <Button type="submit">Add Task</Button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
              <label
                htmlFor={`task-${task.id}`}
                className={`${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {task.text}
              </label>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

