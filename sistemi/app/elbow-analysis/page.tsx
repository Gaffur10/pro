'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import apiService from "@/lib/api"
import { ElbowChart } from "@/components/elbow-chart"

interface ElbowAnalysisData {
  k_values: number[]
  wcss_values: number[]
  optimal_k: number
  elbow_point: number
}

interface NilaiFilters {
  tahun_ajaran: string[];
  semester: string[];
}

export default function ElbowAnalysisPage() {
  const [elbowData, setElbowData] = useState<ElbowAnalysisData | null>(null)
  const [loadingElbow, setLoadingElbow] = useState(false)
  const [error, setError] = useState("")
  
  const [filters, setFilters] = useState<NilaiFilters>({ tahun_ajaran: [], semester: [] });
  const [selectedFilters, setSelectedFilters] = useState({
    tahun_ajaran: "",
    semester: "",
  });

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const filtersResponse = await apiService.getNilaiFilters();
      let newTahunAjaran: string[] = [];
      let newSemester: string[] = [];

      if (filtersResponse && typeof filtersResponse.data === 'object' && filtersResponse.data !== null) {
        if (Array.isArray(filtersResponse.data.tahun_ajaran)) {
          newTahunAjaran = filtersResponse.data.tahun_ajaran;
        }
        if (Array.isArray(filtersResponse.data.semester)) {
          newSemester = filtersResponse.data.semester;
        }
      }
      setFilters({ tahun_ajaran: newTahunAjaran, semester: newSemester });

    } catch (error: any) {
      setError(error.message || "Gagal memuat data filter");
      setFilters({ tahun_ajaran: [], semester: [] }); // Reset filters on error
    }
  };

  const handleFetchElbow = async () => {
    if (!selectedFilters.tahun_ajaran || !selectedFilters.semester) {
      setError("Silakan pilih Tahun Ajaran dan Semester terlebih dahulu.");
      return;
    }
    
    try {
      setLoadingElbow(true);
      setError("");
      const response = await apiService.getElbowAnalysis({
        tahun_ajaran: selectedFilters.tahun_ajaran,
        semester: selectedFilters.semester,
      });
      setElbowData(response.data);
    } catch (error: any) {
      setError(error.message || "Gagal memuat analisis elbow. Pastikan ada data nilai untuk filter yang dipilih.");
      setElbowData(null);
      console.error('Error fetching elbow analysis:', error);
    } finally {
      setLoadingElbow(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analisis Elbow</h1>
          <p className="text-muted-foreground">Menentukan jumlah cluster optimal menggunakan metode elbow.</p>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5"/>Filter Data</CardTitle>
              <CardDescription>Pilih periode data nilai yang akan dianalisis.</CardDescription>
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
                    {filters?.tahun_ajaran && filters.tahun_ajaran.length > 0 ? (
                      filters.tahun_ajaran.map(ta => <SelectItem key={ta} value={ta}>{ta}</SelectItem>)
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Tidak ada tahun ajaran tersedia</div>
                    )}
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
                    {filters?.semester && filters.semester.length > 0 ? (
                      filters.semester.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Tidak ada semester tersedia</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleFetchElbow} disabled={loadingElbow} className="w-full">
                {loadingElbow ? 'Menganalisis...' : 'Jalankan Analisis'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hasil Analisis Elbow</CardTitle>
              <CardDescription>Grafik dan detail analisis untuk menentukan K optimal.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingElbow ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Memuat analisis elbow...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : elbowData ? (
                <div className="space-y-4">
                  <ElbowChart
                    k_values={elbowData.k_values}
                    wcss_values={elbowData.wcss_values}
                    optimal_k={elbowData.optimal_k}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Jumlah Cluster Optimal (K)</h4>
                      <p className="text-2xl font-bold text-primary">{elbowData.optimal_k}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Titik Elbow</h4>
                      <p className="text-2xl font-bold text-primary">{elbowData.elbow_point}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Detail WCSS per K:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">K</th>
                            <th className="text-left py-2">WCSS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {elbowData.k_values.map((k, index) => (
                            <tr key={k} className="border-b">
                              <td className="py-2">{k}</td>
                              <td className="py-2">{elbowData.wcss_values[index].toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Pilih filter untuk melihat analisis elbow.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
