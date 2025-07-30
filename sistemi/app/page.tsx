"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, FileText, BarChart3, TrendingUp, Award } from "lucide-react"
import apiService from "@/lib/api"

interface DashboardStats {
  stats: {
    total_siswa: number
    total_nilai: number
    total_users: number
    total_clustering: number
    rata_rata_nilai: string
    siswa_berprestasi: number
    perlu_perhatian: number
  }
  changes: {
    siswa: string
    nilai: string
    clustering: string
    users: string
  }
  cluster_distribution: {
    tinggi: { count: number; percentage: string }
    sedang: { count: number; percentage: string }
    rendah: { count: number; percentage: string }
  }
  recent_activities: Array<{
    id: number
    action: string
    user: string
    time: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.getDashboardStats()
        setStats(response.data)
      } catch (error: any) {
        setError(error.message || "Gagal memuat data dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tidak ada data</p>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      name: "Total Pengguna",
      value: stats.stats.total_users.toString(),
      icon: Users,
      change: stats.changes.users,
      changeType: "increase",
    },
    {
      name: "Total Siswa",
      value: stats.stats.total_siswa.toString(),
      icon: GraduationCap,
      change: stats.changes.siswa,
      changeType: "increase",
    },
    {
      name: "Data Nilai",
      value: stats.stats.total_nilai.toString(),
      icon: FileText,
      change: stats.changes.nilai,
      changeType: "increase",
    },
    {
      name: "Cluster Aktif",
      value: stats.stats.total_clustering.toString(),
      icon: BarChart3,
      change: stats.changes.clustering,
      changeType: "neutral",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di Sistem Informasi Clustering Nilai Siswa</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : stat.changeType === "decrease"
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                dari bulan lalu
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Distribusi Cluster</CardTitle>
            <CardDescription>Sebaran siswa berdasarkan hasil clustering</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cluster Tinggi</span>
                    <span className="text-sm text-muted-foreground">{stats.cluster_distribution.tinggi.count} siswa</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.cluster_distribution.tinggi.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cluster Sedang</span>
                    <span className="text-sm text-muted-foreground">{stats.cluster_distribution.sedang.count} siswa</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${stats.cluster_distribution.sedang.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cluster Rendah</span>
                    <span className="text-sm text-muted-foreground">{stats.cluster_distribution.rendah.count} siswa</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${stats.cluster_distribution.rendah.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas sistem dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">
                      oleh {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.rata_rata_nilai}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1</span> dari semester lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siswa Berprestasi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.siswa_berprestasi}</div>
            <p className="text-xs text-muted-foreground">Nilai ≥ 80</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Perhatian</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.perlu_perhatian}</div>
            <p className="text-xs text-muted-foreground">Nilai {"<"} 60</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
