import { supabase } from "@/src/lib/supabase"
import AnalyticsDashboard from "@/src/components/AnalyticsDashboard"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const { data: analytics } = await supabase
    .from('analytics')
    .select('*')
  
  return <AnalyticsDashboard data={analytics || []} />
}