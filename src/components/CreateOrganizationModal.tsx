"use client"

import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, X } from "lucide-react"

export default function CreateOrganizationModal() {
  const { organization } = useOrganization()
  const { organizationList, setActive } = useOrganizationList()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [orgName, setOrgName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Show modal if user has no organization
    if (organizationList && organizationList.length === 0 && !organization) {
      setIsOpen(true)
    }
  }, [organizationList, organization])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsCreating(true)

    try {
      if (!setActive) {
        throw new Error("Organization list not loaded")
      }

      // Create organization through Clerk
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const newOrg = await setActive({
        organization: {
          name: orgName,
          slug: slug,
        },
      })

      // Clerk webhook will handle syncing to Supabase
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error('Error creating organization:', err)
      setError(err.message || 'Failed to create organization')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Your Organization</h2>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Welcome! Let's get started by creating your organization. You'll be the super admin and can invite your team later.
        </p>

        <form onSubmit={handleCreate}>
          <div className="mb-6">
            <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
              minLength={2}
              maxLength={50}
              disabled={isCreating}
            />
            <p className="text-xs text-gray-500 mt-2">
              This will be your workspace name. You can change it later.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || !orgName.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Organization'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You'll be able to invite team members after creation
        </p>
      </div>
    </div>
  )
}
