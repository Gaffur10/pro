"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Play, Trash2, Download, TrendingUp } from "lucide-react"
import apiService from "@/lib/api"

interface ClusteringResult {
  id: number
  siswa_id: number
  cluster: number
  jarak_centroid: number
  algoritma: string
  jumlah_cluster: number
  created_at: string
  siswa?: {
    id: number
    nama: string
    nis: string
    kelas: string
  }
}

interface ClusteringStats {
  total_results: number
  cluster_distribution: {
    tinggi: { count: number; percentage: string }
    sedang: { count: number; percentage: string }
    rendah: { count: number; percentage: string }
  }
  average_distance: number
  algorithm_used: string
  clusters_count: number
}

export default function ClusteringPage() {
  const [results, setResults] = useState<ClusteringResult[]>([])
  const [stats, setStats] = useState<ClusteringStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")
  const [clusteringParams, setClusteringParams] = useState({
    algoritma: "k-means",
    jumlah_cluster: "3",
  })

  useEffect(() => {
    fetchClusteringData()
  }, [])

  const fetchClusteringData = async () => {
    try {
      setLoading(true)
      const [resultsResponse, statsResponse] = await Promise.all([
        apiService.getClusteringResults(),
        apiService.getClusteringStats()
      ])
      setResults(resultsResponse.data)
      setStats(statsResponse.data)
    } catch (error: any) {
      setError(error.message || "Gagal memuat data clustering")
    } finally {
      setLoading(false)
    }
  }

  const handleRunClustering = async () => {
    try {
      setRunning(true)
      setError("")

      // Normalize algorithm name before sending to backend
      let normalizedAlgoritma = clusteringParams.algoritma.toLowerCase().replace("-", "")
      
      await apiService.runClustering({
        algoritma: normalizedAlgoritma,
        jumlah_cluster: parseInt(clusteringParams.jumlah_cluster)
      })
      
      // Refresh data after clustering
      await fetchClusteringData()
    } catch (error: any) {
      setError(error.message || "Gagal menjalankan clustering")
    } finally {
      setRunning(false)
    }
  }

  const handleClearResults = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua hasil clustering?")) {
      try {
        await apiService.clearClusteringResults()
        setResults([])
        setStats(null)
      } catch (error: any) {
        setError(error.message || "Gagal menghapus hasil clustering")
      }
    }
  }

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "NIS,Nama,Kelas,Cluster,Jarak Centroid,Algoritma,Jumlah Cluster\n" +
      results.map((r) => 
        `${r.siswa?.nis || ""},${r.siswa?.nama || ""},${r.siswa?.kelas || ""},${r.cluster},${r.jarak_centroid},${r.algoritma},${r.jumlah_cluster}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "hasil_clustering.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getClusterLabel = (cluster: number) => {
    switch (cluster) {
      case 1:
        return { label: "Tinggi", variant: "default" as const }
      case 2:
        return { label: "Sedang", variant: "secondary" as const }
      case 3:
        return { label: "Rendah", variant: "destructive" as const }
      default:
        return { label: `Cluster ${cluster}`, variant: "outline" as const }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clustering Nilai</h1>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clustering Nilai</h1>
          <p className="text-muted-foreground">Analisis clustering nilai siswa menggunakan algoritma K-Means</p>
        </div>
        <div className="flex space-x-2">
          {results.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={handleClearResults}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Hasil
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {typeof error === "string"
            ? error
            : (typeof error === "object" && error !== null && "message" in error)
              ? (error as any).message || "Terjadi kesalahan"
              : "Terjadi kesalahan"}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hasil</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground">Data siswa tercluster</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Algoritma</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">
            {stats?.algorithm_used
              ? stats.algorithm_used === "kmeans"
                ? "K-Means"
                : stats.algorithm_used === "kmedoids"
                ? "K-Medoids"
                : stats.algorithm_used === "hierarchical"
                ? "Hierarchical"
                : stats.algorithm_used
              : "K-Means"}
          </div>
            <p className="text-xs text-muted-foreground">Metode clustering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Cluster</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clusters_count || 3}</div>
            <p className="text-xs text-muted-foreground">Grup yang dibentuk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Jarak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_distance?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Jarak ke centroid</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Distribusi Cluster</CardTitle>
            <CardDescription>Sebaran siswa berdasarkan hasil clustering</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {stats && stats.cluster_distribution ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cluster Tinggi</span>
                      <span className="text-sm text-muted-foreground">{stats.cluster_distribution.tinggi?.count || 0} siswa</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.cluster_distribution.tinggi?.percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cluster Sedang</span>
                      <span className="text-sm text-muted-foreground">{stats.cluster_distribution.sedang?.count || 0} siswa</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${stats.cluster_distribution.sedang?.percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cluster Rendah</span>
                      <span className="text-sm text-muted-foreground">{stats.cluster_distribution.rendah?.count || 0} siswa</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${stats.cluster_distribution.rendah?.percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada data clustering</p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pengaturan Clustering</CardTitle>
            <CardDescription>Konfigurasi algoritma clustering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="algoritma">Algoritma</Label>
              <Select
                value={clusteringParams.algoritma}
                onValueChange={(value) => setClusteringParams({ ...clusteringParams, algoritma: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih algoritma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="k-means">K-Means</SelectItem>
                  {/* <SelectItem value="k-medoids">K-Medoids</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jumlah_cluster">Jumlah Cluster</Label>
              <Select
                value={clusteringParams.jumlah_cluster}
                onValueChange={(value) => setClusteringParams({ ...clusteringParams, jumlah_cluster: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jumlah cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Cluster</SelectItem>
                  <SelectItem value="3">3 Cluster</SelectItem>
                  <SelectItem value="4">4 Cluster</SelectItem>
                  <SelectItem value="5">5 Cluster</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleRunClustering} 
              disabled={running}
              className="w-full"
            >
              {running ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Jalankan Clustering
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Clustering</CardTitle>
            <CardDescription>Detail hasil clustering nilai siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Jarak Centroid</TableHead>
                  <TableHead>Algoritma</TableHead>
                  <TableHead>Jumlah Cluster</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => {
                  const clusterInfo = getClusterLabel(result.cluster)
                  return (
                    <TableRow key={result.id}>
                      
                      <TableCell>
                        <Badge variant={clusterInfo.variant}>
                          {clusterInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.jarak_centroid != null && !isNaN(Number(result.jarak_centroid))
                          ? Number(result.jarak_centroid).toFixed(4)
                          : "-"}
                      </TableCell>
                      <TableCell>{result.algoritma}</TableCell>
                      <TableCell>{result.jumlah_cluster}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

