"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import Image from "next/image"

interface ProfileEditFormProps {
  initialData: {
    name: string
    email: string
    image?: string
  }
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)
  const [imageError, setImageError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      // Update the session with new data
      await updateSession({
        name: formData.name,
        email: formData.email,
        image: formData.image,
      })

      toast.success(data.message || "Profile updated successfully")
      router.refresh()
      router.push("/profile")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'image') {
      setImageError(false)
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted">
          {formData.image && !imageError ? (
            <div className="relative w-full h-full">
              <Image
                src={formData.image}
                alt={formData.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-2xl text-muted-foreground">
                {formData.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="image">Profile Image URL</Label>
          <Input
            id="image"
            name="image"
            type="url"
            value={formData.image || ""}
            onChange={handleChange}
            placeholder="https://example.com/your-image.jpg"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/profile")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
} 