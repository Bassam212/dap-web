import { supabase } from "@/src/lib/supabase"
import { NextResponse } from "next/server"

function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return corsResponse(NextResponse.json({}, { status: 200 }))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, url, steps } = body

    // LOGGING: Check Vercel Logs to see if ID/XPath is arriving
    console.log(`📥 API Received: ${title}`, {
      hasId: !!id,
      stepsCount: steps.length,
      firstStepXPath: steps[0]?.xpath
    })

    let guideId = id

    // 1. CREATE or UPDATE Guide
    if (guideId) {
      // --- UPDATE EXISTING ---
      console.log("♻️ Updating Guide ID:", guideId)
      const { error } = await supabase
        .from("guides")
        .update({
          title: title || "Untitled Guide",
          // trigger_url: url, // Optional: Update URL on save?
        })
        .eq("id", guideId)

      if (error) throw error

      // Clean old steps to replace them
      await supabase.from("steps").delete().eq("guide_id", guideId)

    } else {
      // --- CREATE NEW ---
      console.log("✨ Creating NEW Guide")
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

    // 2. INSERT STEPS (With XPath Support)
    const formattedSteps = steps.map((step: any, index: number) => {
      // Fallback: If title is empty, make one up
      const stepTitle = step.title || `Step ${index + 1}`

      return {
        guide_id: guideId,
        order_index: index,

        // CSS Selectors
        selector: step.path || step.id || step.attributes,

        // Text Content
        title: stepTitle,
        content: step.content || `Click this element`,
        action_type: "click", // Default action

        // --- ROBUSTNESS FIELDS (This fixes the NULLs) ---
        xpath: step.xpath || null,
        element_text: step.content || null,

        // --- METADATA (JSON) ---
        meta_data: {
          tagName: step.tagName,
          hoverSelector: step.hoverSelector || null,
          color: step.color || null,
          url: step.url
        }
      }
    })

    const { error: stepsError } = await supabase
      .from("steps")
      .insert(formattedSteps)

    if (stepsError) {
      console.error("Steps Insert Error:", stepsError)
      throw stepsError
    }

    return corsResponse(NextResponse.json({ success: true, guideId }))

  } catch (error: any) {
    console.error("❌ Server Error:", error)
    return corsResponse(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
  }
}