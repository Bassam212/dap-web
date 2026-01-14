"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, BarChart3, Users, Settings, Share2, Puzzle } from "lucide-react"

const menuItems = [
  { name: "My Guides", icon: LayoutGrid, href: "/" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Affiliate Program", icon: Share2, href: "/affiliate" },
  { name: "Chrome Extension", icon: Puzzle, href: "/extension" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">GUIO.</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold">
            B
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Brett M.</div>
            <div className="text-xs text-gray-500">Pro Workspace</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
