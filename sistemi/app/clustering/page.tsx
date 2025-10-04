'use client'

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Play, Trash2, Download, TrendingUp, Filter } from "lucide-react"
import apiService from "@/lib/api"
import { StudentGradeDetailModal } from '@/components/student-grade-detail-modal'

// Struktur data hasil clustering yang diterima dari backend
interface ClusteringResult {
  id: number
  siswa_id: number
  cluster: number
  keterangan: string   // label cluster dari backend
  jarak_centroid: number
  algoritma: string
  jumlah_cluster: number
  created_at: string
  nis?: string
  nama?: string
  kelas?: string
  nilai_rata_rata: number;
  semester: string;
  tahun_ajaran: string;
}

// Struktur data statistik clustering yang ditampilkan di dashboard
interface ClusteringStats {
  total_results: number
  cluster_distribution: {
    [key: string]: { count: number; percentage: string }
  }
  average_distance: number
  algorithm_used: string
  clusters_count: number
}

// Struktur filter nilai berdasarkan tahun ajaran dan semester
interface NilaiFilters {
  tahun_ajaran: string[];
  semester: string[];
}

export default function ClusteringPage() {
  // State utama
  const [results, setResults] = useState<ClusteringResult[]>([])
  const [stats, setStats] = useState<ClusteringStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")

  // State untuk detail siswa (modal)
  const [detailSiswa, setDetailSiswa] = useState<ClusteringResult | null>(null)

  // State untuk menyimpan opsi filter yang tersedia
  const [filters, setFilters] = useState<NilaiFilters>({ tahun_ajaran: [], semester: [] });

  // State untuk filter sumber data (input form)
  const [selectedFilters, setSelectedFilters] = useState({
    tahun_ajaran: "",
    semester: "",
  });

  // State untuk filter yang aktif digunakan untuk menampilkan data di tabel
  const [activeFilters, setActiveFilters] = useState({
    tahun_ajaran: "",
    semester: "",
  });

  // State untuk filter hasil clustering di tabel
  const [clusterFilter, setClusterFilter] = useState(""); // "" = Semua Cluster

  // State pemicu untuk memaksa re-fetch data
  const [runCounter, setRunCounter] = useState(0);

  // State untuk parameter clustering
  const [clusteringParams, setClusteringParams] = useState({
    algoritma: "k-means",
    jumlah_cluster: "3",
  })

  const fetchClusteringData = useCallback(async (cluster = "") => {
    if (!activeFilters.tahun_ajaran || !activeFilters.semester) {
      setResults([]);
      setStats(null);
      return;
    }

    setLoading(true);
    try {
      const apiParams = { ...activeFilters, cluster, all: 'true' };
      const statsParams = { ...activeFilters };

      const [resultsResponse, statsResponse] = await Promise.all([
        apiService.getClusteringResults(apiParams),
        apiService.getClusteringStats(statsParams),
      ]);

      // Pastikan semester dan tahun_ajaran ada di setiap hasil
      const resultsWithPeriod = resultsResponse.data.map((res: any) => ({
        ...res,
        semester: activeFilters.semester,
        tahun_ajaran: activeFilters.tahun_ajaran,
      }));

      setResults(resultsWithPeriod);
      setStats(statsResponse.data);
    } catch (error: any) {
      setError(error.message || "Gagal memuat data clustering");
    } finally {
      setLoading(false);
    }
  }, [activeFilters]); // Dependensi diubah ke activeFilters

  // Mengambil data filter (tahun ajaran & semester) saat komponen dimuat
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const filtersResponse = await apiService.getNilaiFilters();
        setFilters(filtersResponse.data);
        
        const initialTahunAjaran = filtersResponse.data.tahun_ajaran[0] || "";
        const initialSemester = filtersResponse.data.semester[0] || "";

        // Set filter untuk input form
        setSelectedFilters({ tahun_ajaran: initialTahunAjaran, semester: initialSemester });
        // Set filter untuk data yang ditampilkan pertama kali
        setActiveFilters({ tahun_ajaran: initialTahunAjaran, semester: initialSemester });

      } catch (error: any) {
        setError(error.message || "Gagal memuat opsi filter");
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch data clustering setiap kali filter AKTIF, NAMA CLUSTER, atau pemicu RUNCOUNTER berubah
  useEffect(() => {
    // Jangan jalankan fetch jika ini adalah render pertama dan filter belum siap
    if (activeFilters.tahun_ajaran && activeFilters.semester) {
      fetchClusteringData(clusterFilter);
    }
  }, [clusterFilter, activeFilters, runCounter, fetchClusteringData]);


  // Fungsi: jalankan proses clustering baru
  const handleRunClustering = async () => {
    if (!selectedFilters.tahun_ajaran || !selectedFilters.semester) {
      setError("Silakan pilih Tahun Ajaran dan Semester terlebih dahulu.");
      return;
    }
    try {
      setRunning(true)
      setError("")
      await apiService.runClustering({
        ...clusteringParams,
        ...selectedFilters,
        jumlah_cluster: parseInt(clusteringParams.jumlah_cluster),
      })
      
      // Set filter aktif agar UI konsisten
      setActiveFilters(selectedFilters);
      // Reset filter tabel
      setClusterFilter(""); 
      // Tingkatkan pemicu untuk memaksa re-fetch
      setRunCounter(c => c + 1);

    } catch (error: any) {
      setError(error.message || "Gagal menjalankan clustering")
    } finally {
      setRunning(false)
    }
  }

  const handleClearResults = async () => {
    const { tahun_ajaran, semester } = selectedFilters;
    if (!tahun_ajaran || !semester) {
      setError("Pilih tahun ajaran dan semester untuk menghapus hasil.");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus hasil clustering untuk ${semester} ${tahun_ajaran}?`)) {
      try {
        await apiService.clearClusteringResults(selectedFilters);
        // Re-fetch data to show the cleared state
        await fetchClusteringData();
      } catch (error: any) {
        setError(error.message || "Gagal menghapus hasil clustering");
      }
    }
  };

  // Fungsi: export hasil clustering ke file CSV
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "NIS,Nama,Kelas,Cluster,Keterangan,Jarak Centroid,Algoritma,Jumlah Cluster,Nilai Rata-rata\n" +
      results.map((r: any) => 
        `${r.nis || ""},${r.nama || ""},${r.kelas || ""},${r.cluster},${r.keterangan},${r.jarak_centroid},${r.algoritma},${r.jumlah_cluster},${r.nilai_rata_rata}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "hasil_clustering.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fungsi: mapping warna badge dengan className custom
  const getBadgeClass = (label: string): string => {
    const lower = label.toLowerCase()
    if (lower.includes("sangat tinggi")) return "bg-blue-500 text-white"
    if (lower.includes("tinggi") && !lower.includes("sangat")) return "bg-green-500 text-white"
    if (lower.includes("sedang")) return "bg-gray-400 text-black"
    if (lower.includes("rendah") && !lower.includes("sangat")) return "bg-red-500 text-white"
    if (lower.includes("sangat rendah")) return "bg-yellow-500 text-black"
    return "bg-gray-200 text-black"
  }

  // Tampilan loading awal
  if (loading && !results.length) {
    return <div>Memuat data halaman...</div>
  }

  return (
    <div className="space-y-6">
      <StudentGradeDetailModal siswa={detailSiswa} onClose={() => setDetailSiswa(null)} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clustering Nilai</h1>
          <p className="text-muted-foreground">Analisis pengelompokan nilai siswa.</p>
        </div>
        <div className="flex space-x-2">
          {results.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
              <Button variant="destructive" onClick={handleClearResults}><Trash2 className="mr-2 h-4 w-4" />Hapus Hasil</Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Kartu filter data sumber */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5"/>Filter Data Sumber</CardTitle>
              <CardDescription>Pilih periode data nilai yang akan digunakan untuk clustering.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
                <Select
                  value={selectedFilters.tahun_ajaran}
                  onValueChange={(value) => setSelectedFilters({ ...selectedFilters, tahun_ajaran: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                  <SelectContent>
                    {filters.tahun_ajaran.map(ta => <SelectItem key={ta} value={ta}>{ta}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={selectedFilters.semester}
                  onValueChange={(value) => setSelectedFilters({ ...selectedFilters, semester: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih semester" /></SelectTrigger>
                  <SelectContent>
                    {filters.semester.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Kartu pengaturan clustering */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Clustering</CardTitle>
              <CardDescription>Konfigurasi algoritma dan jumlah cluster.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="algoritma">Algoritma</Label>
                <Select value={clusteringParams.algoritma} onValueChange={(v) => setClusteringParams(p => ({...p, algoritma: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="k-means">K-Means</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jumlah_cluster">Jumlah Cluster</Label>
                <Select value={clusteringParams.jumlah_cluster} onValueChange={(v) => setClusteringParams(p => ({...p, jumlah_cluster: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Cluster</SelectItem>
                    <SelectItem value="3">3 Cluster</SelectItem>
                    <SelectItem value="4">4 Cluster</SelectItem>
                    <SelectItem value="5">5 Cluster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRunClustering} disabled={running} className="w-full">
                {running ? 'Memproses...' : <><Play className="mr-2 h-4 w-4" />Jalankan Clustering</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Kartu statistik clustering */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Siswa</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.total_results || 0}</div><p className="text-xs text-muted-foreground">Data tercluster dari periode terpilih</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Rata-rata Jarak</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.average_distance?.toFixed(4) || "0.00"}</div><p className="text-xs text-muted-foreground">Jarak rata-rata ke centroid</p></CardContent>
            </Card>
          </div>

          {/* Tabel hasil clustering */}
          <Card>
            <CardHeader>
              <CardTitle>Hasil Clustering</CardTitle>
              <CardDescription>Detail hasil pengelompokan siswa.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">Memuat hasil...</div>
              ) : results.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center space-x-3">
                    <Label htmlFor="filter-cluster" className="text-sm font-medium">Tampilkan Cluster:</Label>
                    <Select
                      value={clusterFilter}
                      onValueChange={(value) => setClusterFilter(value === "all" ? "" : value)}
                    >
                      <SelectTrigger id="filter-cluster" className="w-[250px]">
                        <SelectValue placeholder="Tampilkan Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Cluster ({stats?.total_results || 0} siswa)</SelectItem>
                        {stats && stats.cluster_distribution && Object.entries(stats.cluster_distribution).map(([name, data]) => (
                          <SelectItem key={name} value={name} className="capitalize">
                            {name} ({data.count} siswa)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Jarak</TableHead>
                        <TableHead>Nilai Rata-rata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id} onClick={() => setDetailSiswa(result)} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <TableCell>{result.nis || "-"}</TableCell>
                          <TableCell>{result.nama || "-"}</TableCell>
                          <TableCell>{result.kelas || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getBadgeClass(result.keterangan) as any}>{result.keterangan}</Badge>
                          </TableCell>
                          <TableCell>{Number(result.jarak_centroid).toFixed(4)}</TableCell>
                          <TableCell>{result.nilai_rata_rata}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Hasil Clustering</h3>
                  <p className="mt-1 text-sm text-gray-500">Jalankan proses clustering untuk melihat hasilnya di sini.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}