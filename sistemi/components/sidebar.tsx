"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, GraduationCap, FileText, BarChart3, LogOut, TrendingUp } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Data Pengguna",
    href: "/users",
    icon: Users,
  },
  {
    name: "Data Siswa",
    href: "/students",
    icon: GraduationCap,
  },
  {
    name: "Data Nilai",
    href: "/grades",
    icon: FileText,
  },
  {
    name: "Analisis Elbow",
    href: "/elbow-analysis",
    icon: TrendingUp,
  },
  {
    name: "Hasil Clustering",
    href: "/clustering",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center border-b px-6">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-lg font-semibold">SIS Clustering</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Keluar
        </Button>
      </div>
    </div>
  )
}
