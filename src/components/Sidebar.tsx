"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
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
  const { user, isLoaded } = useUser()

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "?"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`
    }
    if (firstName) return firstName[0]
    if (user.username) return user.username[0].toUpperCase()
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress[0].toUpperCase()
    }
    return "U"
  }

  // Get display name
  const getDisplayName = () => {
    if (!user) return "Loading..."
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName[0]}.`
    }
    if (user.firstName) return user.firstName
    if (user.username) return user.username
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split("@")[0]
    }
    return "User"
  }

  // Get workspace/account info
  const getWorkspaceInfo = () => {
    if (!user) return ""
    // You can customize this based on your workspace/plan logic
    return user.username || "Pro Workspace"
  }

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
        {isLoaded && user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {getDisplayName()}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {getWorkspaceInfo()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
