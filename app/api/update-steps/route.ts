import { supabase } from "@/src/lib/supabase"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const { steps } = await request.json()

    // Loop through the steps and update them
    // (In a real production app, we'd do a bulk upsert, but this is safer for now)
    for (const step of steps) {
      const { error } = await supabase
        .from("steps")
        .update({ 
          title: step.title,
          content: step.content 
        })
        .eq("id", step.id)
      
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}