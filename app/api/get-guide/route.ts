import { supabase } from "@/src/lib/supabase"
import { NextResponse } from "next/server"

// Helper for CORS (Same as before)
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return corsResponse(NextResponse.json({}, { status: 200 }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return corsResponse(NextResponse.json({ error: "URL is required" }, { status: 400 }))
    }

    console.log("🔍 Searching for guide on:", url)

    // 1. Find the guide for this URL
    // We also fetch the 'steps' relation automatically
    const { data: guide, error } = await supabase
      .from("guides")
      .select("*, steps(*)")
      .eq("trigger_url", url)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (!guide) {
      return corsResponse(NextResponse.json({ found: false }, { status: 200 }))
    }

    // 2. Sort steps by order_index (important!)
    if (guide.steps) {
      guide.steps.sort((a: any, b: any) => a.order_index - b.order_index)
    }

    return corsResponse(NextResponse.json({ found: true, guide }))

  } catch (error: any) {
    console.error("Server Error:", error)
    return corsResponse(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}