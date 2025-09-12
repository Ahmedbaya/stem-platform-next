"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Award {
  name: string
  prize?: string
  description?: string
}

interface EvaluationCriteria {
  name: string
  description: string
  weight: number
  maxScore: number
}

export default function NewCompetitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    location: "",
    maxTeams: "",
  })
  const [awards, setAwards] = useState<Award[]>([{ name: "", prize: "", description: "" }])
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>([
    { name: "", description: "", weight: 10, maxScore: 10 }
  ])

  // Calculate total weight
  const totalWeight = evaluationCriteria.reduce((sum, criteria) => sum + Number(criteria.weight), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalWeight !== 100) {
      toast.error("Total weight of evaluation criteria must equal 100%.")
      return
    }
    setLoading(true)

    try {
      // Format the data properly
      const requestData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        location: formData.location,
        maxTeams: parseInt(formData.maxTeams),
        awards: awards.filter(award => award.name.trim() !== ""),
        evaluationCriteria: evaluationCriteria
          .filter(criteria => criteria.name.trim() !== "")
          .map(criteria => ({
            name: criteria.name.trim(),
            description: criteria.description.trim(),
            weight: Number(criteria.weight),
            maxScore: Number(criteria.maxScore)
          }))
      }

      console.log("Sending formatted request data:", requestData)

      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create competition")
      }

      toast.success("Competition created successfully")
      router.push("/dashboard/competitions")
    } catch (error) {
      console.error("Error creating competition:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create competition")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAwardChange = (index: number, field: keyof Award, value: string) => {
    setAwards(prev => {
      const newAwards = [...prev]
      newAwards[index] = {
        ...newAwards[index],
        [field]: value
      }
      return newAwards
    })
  }

  const addAward = () => {
    setAwards(prev => [...prev, { name: "", prize: "", description: "" }])
  }

  const removeAward = (index: number) => {
    setAwards(prev => prev.filter((_, i) => i !== index))
  }

  const handleCriteriaChange = (index: number, field: keyof EvaluationCriteria, value: string | number) => {
    setEvaluationCriteria(prev => {
      const newCriteria = [...prev]
      newCriteria[index] = {
        ...newCriteria[index],
        [field]: value
      }
      return newCriteria
    })
  }

  const addCriteria = () => {
    setEvaluationCriteria(prev => [...prev, { name: "", description: "", weight: 10, maxScore: 10 }])
  }

  const removeCriteria = (index: number) => {
    setEvaluationCriteria(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Competition</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter competition title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter competition description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationDeadline">Registration Deadline</Label>
          <Input
            id="registrationDeadline"
            name="registrationDeadline"
            type="date"
            value={formData.registrationDeadline}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]} // Set min date to today
          />
          <p className="text-sm text-muted-foreground">
            Teams cannot register after this date
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Enter competition location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTeams">Maximum Teams</Label>
          <Input
            id="maxTeams"
            name="maxTeams"
            type="number"
            value={formData.maxTeams}
            onChange={handleChange}
            required
            min="1"
            placeholder="Enter maximum number of teams"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Evaluation Criteria</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCriteria}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Criteria
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total Weight:</span>
            <span className={totalWeight === 100 ? "text-green-600" : "text-red-600 font-bold"}>{totalWeight}%</span>
            {totalWeight !== 100 && (
              <span className="text-red-600 text-sm ml-2">(Must equal 100%)</span>
            )}
          </div>
          
          {evaluationCriteria.map((criteria, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`criteria-name-${index}`}>Criteria Name</Label>
                <Input
                  id={`criteria-name-${index}`}
                  value={criteria.name}
                  onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                  placeholder="e.g., Technical Innovation"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`criteria-weight-${index}`}>Weight (%)</Label>
                <Input
                  id={`criteria-weight-${index}`}
                  type="number"
                  min="1"
                  max="100"
                  value={criteria.weight}
                  onChange={(e) => handleCriteriaChange(index, 'weight', parseInt(e.target.value))}
                  required
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor={`criteria-description-${index}`}>Description</Label>
                <Textarea
                  id={`criteria-description-${index}`}
                  value={criteria.description}
                  onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                  placeholder="Describe what this criteria evaluates"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`criteria-maxScore-${index}`}>Maximum Score</Label>
                <Input
                  id={`criteria-maxScore-${index}`}
                  type="number"
                  min="1"
                  max="100"
                  value={criteria.maxScore}
                  onChange={(e) => handleCriteriaChange(index, 'maxScore', parseInt(e.target.value))}
                  required
                />
              </div>
              
              <div className="col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCriteria(index)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Awards</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAward}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Award
            </Button>
          </div>
          
          {awards.map((award, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`award-name-${index}`}>Award Name</Label>
                <Input
                  id={`award-name-${index}`}
                  value={award.name}
                  onChange={(e) => handleAwardChange(index, 'name', e.target.value)}
                  placeholder="e.g., First Place"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`award-prize-${index}`}>Prize</Label>
                <Input
                  id={`award-prize-${index}`}
                  value={award.prize}
                  onChange={(e) => handleAwardChange(index, 'prize', e.target.value)}
                  placeholder="e.g., $10,000"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor={`award-description-${index}`}>Description</Label>
                <Textarea
                  id={`award-description-${index}`}
                  value={award.description}
                  onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                  placeholder="Describe the award criteria"
                />
              </div>
              
              <div className="col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAward(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Award
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={() => console.log("Submit button clicked")}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Competition"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 