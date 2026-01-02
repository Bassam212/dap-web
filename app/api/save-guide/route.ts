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
        console.log(`🚀 API VERSION 2.0 (Jan 2026) - XPath Check`)

        // LOGGING: Check Vercel Logs to see if XPath is arriving
        console.log(`📥 Saving Guide: ${title}`)
        console.log(`🔍 First Step XPath:`, steps[0]?.xpath) // <--- LOOK FOR THIS IN VERCEL LOGS

        let guideId = id

        // 1. Create or Update Guide
        if (guideId) {
            const { error } = await supabase
                .from("guides")
                .update({ title: title || "Untitled Guide" })
                .eq("id", guideId)
            if (error) throw error

            // Clear old steps to replace them
            await supabase.from("steps").delete().eq("guide_id", guideId)
        } else {
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

        // 2. Insert Steps (Explicitly mapping XPath)
        const formattedSteps = steps.map((step: any, index: number) => ({
            guide_id: guideId,
            order_index: index,
            selector: step.path || step.id || step.attributes,
            title: step.title || `Step ${index + 1}`,
            content: step.content || `Click this element`,
            action_type: "click",

            // --- CRITICAL FIX ---
            xpath: step.xpath, // Ensure this matches the column name in Supabase
            // --------------------

            element_text: step.content,
            meta_data: {
                tagName: step.tagName,
                hoverSelector: step.hoverSelector,
                color: step.color,
                url: step.url
            }
        }))

        const { error: stepsError } = await supabase.from("steps").insert(formattedSteps)

        if (stepsError) {
            console.error("Steps Insert Error:", stepsError)
            throw stepsError
        }

        return corsResponse(NextResponse.json({ success: true, guideId }))

    } catch (error: any) {
        console.error("Server Error:", error)
        return corsResponse(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
    }
}