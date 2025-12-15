import { supabase } from "@/src/lib/supabase"
import StepEditor from "@/src/components/StepEditor"
import Link from "next/link"

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
    // Await the params object before using it
    const { id } = await params; 
  
    // 1. Fetch the specific guide
    const { data: guide } = await supabase
      .from("guides")
      .select("*")
      .eq("id", id) // <--- Use the extracted 'id'
      .single()

  // 2. Fetch the steps for this guide (ordered!)
  const { data: steps } = await supabase
    .from("steps")
    .select("*")
    .eq("guide_id", id)
    .order("order_index", { ascending: true })

  if (!guide) return <div>Guide not found</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="text-gray-500 hover:text-gray-900 mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{guide.title}</h1>
          <a 
            href={guide.trigger_url} 
            target="_blank" 
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            {guide.trigger_url} ↗
          </a>
        </div>

        {/* The Client Editor Component */}
        <StepEditor steps={steps || []} guideId={guide.id} />
      </div>
    </div>
  )
}