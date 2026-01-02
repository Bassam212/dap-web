"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function GuideRow({ guide }: { guide: any }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this guide?")) return

        setIsDeleting(true)
        try {
            await fetch('/api/delete-guide', {
                method: 'DELETE',
                body: JSON.stringify({ id: guide.id })
            })
            router.refresh() // Refreshes the server data instantly
        } catch (e) {
            alert("Failed to delete")
            setIsDeleting(false)
        }
    }

    if (isDeleting) return null // Hide immediately for better UX

    return (
        <div className="p-6 hover:bg-gray-50 transition flex justify-between items-center border-b border-gray-100 last:border-0">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${guide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {guide.is_active ? 'ACTIVE' : 'DRAFT'}
                    </span>
                    <span>•</span>
                    <span className="max-w-[300px] truncate block">{guide.trigger_url}</span>
                    <span>•</span>
                    <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <Link
                    href={`/guide/${guide.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                >
                    Edit
                </Link>
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 rounded-md hover:bg-red-50 transition"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}