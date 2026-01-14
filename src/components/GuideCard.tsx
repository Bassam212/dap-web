"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function GuideCard({ guide }: { guide: any }) {
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
            router.refresh()
        } catch (e) {
            alert("Failed to delete")
            setIsDeleting(false)
        }
    }

    if (isDeleting) return null

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                        {guide.is_active && (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                                ACTIVE
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <ExternalLink size={14} />
                        <a
                            href={guide.trigger_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors truncate max-w-lg"
                        >
                            {guide.trigger_url}
                        </a>
                    </div>

                    <div className="text-sm text-gray-500">
                        {new Date(guide.created_at).toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                </div>

                <div className="flex gap-3 items-center ml-6">
                    <Link
                        href={`/guide/${guide.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
