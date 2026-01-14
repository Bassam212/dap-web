"use client"

import { useOrganizationList, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export type UserRole = 'super_admin' | 'admin' | 'user'

export interface UserPermissions {
  role: UserRole | null
  canManageOrganization: boolean
  canDeleteOrganization: boolean
  canManageBilling: boolean
  canReadBilling: boolean
  canManageDomains: boolean
  canReadDomains: boolean
  canManageMembers: boolean
  canReadMembers: boolean
  isLoading: boolean
}

export function usePermissions(organizationId?: string): UserPermissions {
  const { user } = useUser()
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && userMemberships.data) {
      fetchUserRole()
    }
  }, [user, userMemberships.data, organizationId])

  const fetchUserRole = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      // Get the current active organization
      const activeMembership = userMemberships.data?.[0]

      if (!activeMembership) {
        setRole(null)
        setIsLoading(false)
        return
      }

      // Fetch role from Supabase
      const { data, error } = await supabase
        .from('organization_members')
        .select('role, organization:organizations!inner(clerk_org_id)')
        .eq('clerk_user_id', user.id)
        .eq('organization.clerk_org_id', activeMembership.organization.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } else {
        setRole(data.role as UserRole)
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      setRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate permissions based on role
  const canManageOrganization = role === 'super_admin'
  const canDeleteOrganization = role === 'super_admin'
  const canManageBilling = role === 'super_admin' || role === 'admin'
  const canReadBilling = role === 'super_admin' || role === 'admin'
  const canManageDomains = role === 'super_admin' || role === 'admin'
  const canReadDomains = role === 'super_admin' || role === 'admin'
  const canManageMembers = role === 'super_admin' || role === 'admin'
  const canReadMembers = role !== null

  return {
    role,
    canManageOrganization,
    canDeleteOrganization,
    canManageBilling,
    canReadBilling,
    canManageDomains,
    canReadDomains,
    canManageMembers,
    canReadMembers,
    isLoading,
  }
}
