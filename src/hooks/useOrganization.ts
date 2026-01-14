"use client"

import { useOrganization as useClerkOrganization } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export interface OrganizationData {
  id: string
  clerk_org_id: string
  name: string
  slug: string
  created_at: string
}

export function useOrganization() {
  const { organization, isLoaded } = useClerkOrganization()
  const [orgData, setOrgData] = useState<OrganizationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && organization) {
      fetchOrganizationData()
    } else if (isLoaded && !organization) {
      setOrgData(null)
      setLoading(false)
    }
  }, [isLoaded, organization])

  const fetchOrganizationData = async () => {
    if (!organization) return

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('clerk_org_id', organization.id)
        .single()

      if (error) throw error

      setOrgData(data)
    } catch (error) {
      console.error('Error fetching organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    organization, // Clerk organization
    orgData, // Supabase organization data
    isLoaded,
    loading
  }
}
