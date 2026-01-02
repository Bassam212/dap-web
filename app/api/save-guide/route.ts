import { supabase } from "@/src/lib/supabase"
import { NextResponse } from "next/server"

// Helper to add CORS headers
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*') // Allow ALL sites (Extension runs everywhere)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// 1. Handle the "Preflight" check (Browser asks: "Can I talk to you?")
export async function OPTIONS() {
  return corsResponse(NextResponse.json({}, { status: 200 }))
}

// 2. Handle the actual Data Save
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, url, steps, id } = body
    let guideId = id

    console.log("📝 Received guide:", title)
    // 1. Create OR Update Guide
    if (guideId) {
      // UPDATE EXISTING
      console.log("♻️ Updating Guide:", guideId)
      const { error } = await supabase
        .from("guides")
        .update({
          title: title || "Untitled Guide",
          // Don't overwrite trigger_url usually, but you can if needed
        })
        .eq("id", guideId)

      if (error) throw error

      // Clear old steps so we can replace them
      await supabase.from("steps").delete().eq("guide_id", guideId)

    } else {
      // CREATE NEW
      console.log("✨ Creating New Guide")
      const { data: guideData, error: guideError } = await supabase
        .from("guides")
        .insert([{
          title: title || "Untitled Guide",
          trigger_url: url,
          is_active: true,
        }])
        .select()
        .single()

      if (guideError) throw guideError
      guideId = guideData.id
    }

    // 2. Format the steps
    // 2. Format the steps to match Database Columns
    const formattedSteps = steps.map((step: any, index: number) => ({
      guide_id: guideId,
      order_index: index,
      selector: step.path || step.id || step.attributes,

      title: step.title || `Step ${index + 1}`,
      content: step.content || `Click on the <${step.tagName}> element`,
      action_type: "click",

      // --- NEW FIELDS MAPPING ---
      xpath: step.xpath, // <--- Save the XPath!

      // Store extra useful info in the JSONB column
      meta_data: {
        tagName: step.tagName,
        hoverSelector: step.hoverSelector, // Save the hover trigger
        color: step.color,
        url: step.url
      }
    }))

    // Insert steps
    const { error: stepsError } = await supabase
      .from("steps")
      .insert(formattedSteps)

    if (stepsError) throw stepsError

    // Success Response with CORS headers
    return corsResponse(NextResponse.json({ success: true, guideId: guideId }))

  } catch (error: any) {
    console.error("❌ Server Error:", error)
    // Error Response with CORS headers
    return corsResponse(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
  }
}