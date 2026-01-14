"use client"

import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { UserPlus, Mail, Shield, User as UserIcon, Trash2, Crown } from "lucide-react"
import { usePermissions } from "@/src/hooks/usePermissions"

interface Member {
  id: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: string
}

export default function UsersPage() {
  const { user } = useUser()
  const { organization, memberships, invitations } = useOrganization({
    memberships: {
      infinite: true,
      keepPreviousData: true,
    },
    invitations: {
      infinite: true,
      keepPreviousData: true,
    },
  })
  const permissions = usePermissions()

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user")
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState("")

  if (!organization) {
    return (
      <div className="p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800">
              Please create or join an organization first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsInviting(true)

    try {
      // Clerk role mapping: we use org:admin for admin, org:member for user
      const clerkRole = inviteRole === "admin" ? "org:admin" : "org:member"

      await organization.inviteMember({
        emailAddress: inviteEmail,
        role: clerkRole,
      })

      setShowInviteModal(false)
      setInviteEmail("")
      setInviteRole("user")

      // Refresh memberships
      await invitations?.revalidate?.()
    } catch (err: any) {
      console.error('Error inviting member:', err)
      setError(err.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const membership = memberships?.data?.find(m => m.publicUserData?.userId === userId)
      if (membership) {
        await membership.destroy()
        await memberships?.revalidate?.()
      }
    } catch (err: any) {
      console.error('Error removing member:', err)
      alert('Failed to remove member: ' + err.message)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      const membership = memberships?.data?.find(m => m.publicUserData?.userId === userId)
      if (membership) {
        const clerkRole = newRole === "admin" ? "org:admin" : "org:member"
        await membership.update({ role: clerkRole })
        await memberships?.revalidate?.()
      }
    } catch (err: any) {
      console.error('Error updating role:', err)
      alert('Failed to update role: ' + err.message)
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === 'org:admin' || role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
          <Shield size={12} />
          Admin
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
        <UserIcon size={12} />
        User
        </span>
    )
  }

  const getSuperAdminBadge = () => (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700">
      <Crown size={12} />
      Super Admin
    </span>
  )

  // Check if current user is super admin (creator)
  const isCreator = (userId: string) => {
    return userId === organization.createdBy
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-500 mt-1">
              Manage your organization members and invitations
            </p>
          </div>

          {permissions.canManageMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus size={18} />
              Invite Member
            </button>
          )}
        </div>

        {/* Current Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Members ({memberships?.count || 0})</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {memberships?.data?.map((membership) => {
              const isUserCreator = isCreator(membership.publicUserData?.userId!)
              const canModify = permissions.canManageMembers && !isUserCreator

              return (
                <div key={membership.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {membership.publicUserData?.firstName?.[0] || membership.publicUserData?.identifier?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {membership.publicUserData?.firstName} {membership.publicUserData?.lastName}
                            {membership.publicUserData?.userId === user?.id && (
                              <span className="text-xs text-gray-500 ml-2">(You)</span>
                            )}
                          </h3>
                          {isUserCreator ? getSuperAdminBadge() : getRoleBadge(membership.role)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {membership.publicUserData?.identifier}
                        </p>
                      </div>
                    </div>

                    {canModify && (
                      <div className="flex items-center gap-2">
                        <select
                          value={membership.role === 'org:admin' ? 'admin' : 'user'}
                          onChange={(e) => handleUpdateRole(membership.publicUserData?.userId!, e.target.value as any)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          onClick={() => handleRemoveMember(membership.publicUserData?.userId!)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                          title="Remove member"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}

                    {isUserCreator && (
                      <div className="text-xs text-gray-500">
                        Organization Owner
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations && invitations.count! > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Pending Invitations ({invitations.count})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {invitations.data?.map((invitation) => (
                <div key={invitation.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {invitation.emailAddress}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Invited • {getRoleBadge(invitation.role)}
                        </p>
                      </div>
                    </div>

                    {permissions.canManageMembers && (
                      <button
                        onClick={async () => {
                          if (confirm('Revoke this invitation?')) {
                            await invitation.revoke()
                            await invitations.revalidate?.()
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Team Member</h2>

              <form onSubmit={handleInvite}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                    disabled={isInviting}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isInviting}
                  >
                    <option value="user">User - Basic access</option>
                    <option value="admin">Admin - Can manage members and settings</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Super Admin role can only be assigned manually via database
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false)
                      setInviteEmail("")
                      setError("")
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
                    disabled={isInviting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
