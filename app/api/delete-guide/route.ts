import { supabase } from "@/src/lib/supabase"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()

        // Delete the guide (Cascade rules in SQL should auto-delete steps/analytics, 
        // but if not, Supabase usually handles it if Foreign Keys are set up right)
        const { error } = await supabase
            .from('guides')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}