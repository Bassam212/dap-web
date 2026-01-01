import { supabase } from "@/src/lib/supabase"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { userAgent } from "next/server"

// --- CORS HELPER ---
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// 1. HANDLE PREFLIGHT (The missing piece!)
export async function OPTIONS() {
  return corsResponse(NextResponse.json({}, { status: 200 }))
}

// 2. HANDLE POST (Tracking)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guideId, event } = body

    if (!guideId) {
      return corsResponse(NextResponse.json({ error: "Missing Guide ID" }, { status: 400 }))
    }

    // Get Geo & Device Data
    const reqHeaders = await headers()
    const { device, browser, os } = userAgent({ headers: reqHeaders })
    // 'x-vercel-ip-country' is provided by Vercel hosting
    const country = reqHeaders.get('x-vercel-ip-country') || 'Unknown'

    // Insert into Supabase
    const { error } = await supabase.from('analytics').insert({
      guide_id: guideId,
      event_type: event,
      country: country,
      device: device.type === 'mobile' ? 'Mobile' : 'Desktop',
      browser: browser.name,
      os: os.name
    })

    if (error) {
      console.error("Supabase Error:", error)
      throw error
    }

    return corsResponse(NextResponse.json({ success: true }))
  } catch (error) {
    console.error("Track Error:", error)
    return corsResponse(NextResponse.json({ error: "Failed to track" }, { status: 500 }))
  }
}