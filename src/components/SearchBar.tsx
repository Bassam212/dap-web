"use client"

import { Search } from "lucide-react"

export default function SearchBar() {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search your guides..."
        className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
