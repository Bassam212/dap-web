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
    const { title, url, steps } = body

    console.log("📝 Received guide:", title)

    // Create the Guide
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

    // 2. Format the steps
    const formattedSteps = steps.map((step: any, index: number) => ({
      guide_id: guideData.id,
      order_index: index,

      // PRIMARY STRATEGY: The best CSS selector we have
      selector: step.id || step.attributes || step.path,

      // FALLBACK STRATEGIES (New!)
      xpath: step.xpath,
      element_text: step.content, // Often the inner text of the button

      // METADATA
      meta_data: {
        tagName: step.tagName,
        hoverSelector: step.hoverSelector,
        originalPath: step.path
      },

      title: step.title || `Step ${index + 1}`,
      content: step.content || `Click on this element`,
      action_type: "click",
    }))

    // Insert steps
    const { error: stepsError } = await supabase
      .from("steps")
      .insert(formattedSteps)

    if (stepsError) throw stepsError

    // Success Response with CORS headers
    return corsResponse(NextResponse.json({ success: true, guideId: guideData.id }))

  } catch (error: any) {
    console.error("❌ Server Error:", error)
    // Error Response with CORS headers
    return corsResponse(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
  }
}