"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function StepEditor({ steps: initialSteps, guideId }: any) {
  const [steps, setSteps] = useState(initialSteps)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleChange = (index: number, field: string, value: string) => {
    const newSteps = [...steps]
    newSteps[index][field] = value
    setSteps(newSteps)
  }

  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/update-steps", {
        method: "PUT",
        body: JSON.stringify({ steps }),
      })
      if (res.ok) {
        alert("✅ Updates Saved!")
        router.refresh() // Reloads data from server
      } else {
        alert("❌ Failed to save")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Steps</h2>
      
      <div className="space-y-6">
        {steps.map((step: any, index: number) => (
          <div key={step.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Step {index + 1}
              </span>
              <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
                {step.selector}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black" // Added text-black here
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content / Instructions</label>
                <textarea
                  value={step.content}
                  onChange={(e) => handleChange(index, "content", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-24 text-black" // Added text-black here
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}