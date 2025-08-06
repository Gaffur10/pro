"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Download } from "lucide-react"
import apiService from "@/lib/api"

interface NilaiSiswa {
  id: number;
  siswa_id: number;
  semester: string;
  tahun_ajaran: string;
  Matematika: number;
  PKN: number;
  Seni_Budaya: number;
  ipa: number;
  Bahasa_Indonesia: number;
  Bahasa_Inggris: number;
  PJOK: number;
  IPS: number;
  Pend_Agama: number;
  TIK: number;
  rata_rata: number;
  created_at: string;
  updated_at: string;
  siswa?: {
    id: number;
    nama: string;
    nis: string;
    kelas: string;
  };
}

interface Siswa {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<NilaiSiswa[]>([])
  const [students, setStudents] = useState<Siswa[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<NilaiSiswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    siswa_id: "",
    semester: "",
    tahun_ajaran: "",
    Matematika: "",
    PKN: "",
    Seni_Budaya: "",
    ipa: "",
    Bahasa_Indonesia: "",
    Bahasa_Inggris: "",
    PJOK: "",
    IPS: "",
    Pend_Agama: "",
    TIK: "",
  })

  useEffect(() => {
    fetchGrades()
    fetchStudents()
  }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      // Always get all nilai without pagination
      const params = {
        all: 'true'
      }
      const response = await apiService.getNilai(params)
      setGrades(response.data)
    } catch (error: any) {
      setError(error.message || "Gagal memuat data nilai")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await apiService.getSiswa()
      setStudents(response.data)
    } catch (error: any) {
      console.error("Gagal memuat data siswa:", error)
    }
  }

  const filteredGrades = grades.filter((grade) => {
    const studentName = grade.siswa?.nama || ""
    const studentNis = grade.siswa?.nis || ""
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentNis.includes(searchTerm) ||
      grade.semester.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const calculateAverage = (values: any) => {
    const numericValues = Object.values(values).filter(val => val !== "" && !isNaN(Number(val)))
    if (numericValues.length === 0) return 0
    const sum = numericValues.reduce((acc: number, val: any) => acc + Number(val), 0)
    return (sum / numericValues.length).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const nilaiData = {
        ...formData,
        siswa_id: parseInt(formData.siswa_id),
        Matematika: parseFloat(formData.Matematika) || 0,
        PKN: parseFloat(formData.PKN) || 0,
        Seni_Budaya: parseFloat(formData.Seni_Budaya) || 0,
        ipa: parseFloat(formData.ipa) || 0,
        Bahasa_Indonesia: parseFloat(formData.Bahasa_Indonesia) || 0,
        Bahasa_Inggris: parseFloat(formData.Bahasa_Inggris) || 0,
        PJOK: parseFloat(formData.PJOK) || 0,
        IPS: parseFloat(formData.IPS) || 0,
        Pend_Agama: parseFloat(formData.Pend_Agama) || 0,
        TIK: parseFloat(formData.TIK) || 0,
      }

      if (editingGrade) {
        await apiService.updateNilai(editingGrade.id, nilaiData)
      } else {
        await apiService.createNilai(nilaiData)
      }
      
      setIsDialogOpen(false)
      setEditingGrade(null)
      resetForm()
      fetchGrades() // Refresh data
    } catch (error: any) {
      setError(error.message || "Gagal menyimpan data nilai")
    }
  }

  const handleEdit = (grade: NilaiSiswa) => {
    setEditingGrade(grade)
    setFormData({
      siswa_id: grade.siswa_id.toString(),
      semester: grade.semester,
      tahun_ajaran: grade.tahun_ajaran,
      Matematika: grade.Matematika.toString(),
      PKN: grade.PKN.toString(),
      Seni_Budaya: grade.Seni_Budaya.toString(),
      ipa: grade.ipa.toString(),
      Bahasa_Indonesia: grade.Bahasa_Indonesia.toString(),
      Bahasa_Inggris: grade.Bahasa_Inggris.toString(),
      PJOK: grade.PJOK.toString(),
      IPS: grade.IPS.toString(),
      Pend_Agama: grade.Pend_Agama.toString(),
      TIK: grade.TIK.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data nilai ini?")) {
      try {
        await apiService.deleteNilai(id)
        fetchGrades() // Refresh data
      } catch (error: any) {
        setError(error.message || "Gagal menghapus data nilai")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      siswa_id: "",
      semester: "",
      tahun_ajaran: "",
      Matematika: "",
      PKN: "",
      Seni_Budaya: "",
      ipa: "",
      Bahasa_Indonesia: "",
      Bahasa_Inggris: "",
      PJOK: "",
      IPS: "",
      Pend_Agama: "",
      TIK: "",
    })
  }

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "NIS,Nama,Kelas,Semester,Matematika,PKN,Seni Budaya,IPA,Bahasa Indonesia,Bahasa Inggris,PJOK,IPS,Pendidikan Agama,TIK,Rata-rata\n" +
      grades.map((g) => 
        `${g.siswa?.nis || ""},${g.siswa?.nama || ""},${g.siswa?.kelas || ""},${g.semester},${g.Matematika},${g.PKN},${g.Seni_Budaya},${g.ipa},${g.Bahasa_Indonesia},${g.Bahasa_Inggris},${g.PJOK},${g.IPS},${g.Pend_Agama},${g.TIK},${g.rata_rata}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "data_nilai.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Nilai</h1>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Nilai</h1>
          <p className="text-muted-foreground">Kelola data nilai siswa</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingGrade(null)
                  resetForm()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Nilai
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGrade ? "Edit Nilai" : "Tambah Nilai Baru"}</DialogTitle>
                <DialogDescription>
                  {editingGrade ? "Ubah nilai siswa" : "Masukkan nilai siswa baru"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="siswa_id">Siswa</Label>
                      <Select
                        value={formData.siswa_id}
                        onValueChange={(value) => setFormData({ ...formData, siswa_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih siswa" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.nis} - {student.nama} ({student.kelas})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={formData.semester}
                        onValueChange={(value) => setFormData({ ...formData, semester: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ganjil">Semester Ganjil</SelectItem>
                          <SelectItem value="Genap">Semester Genap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
                      <Input
                        id="tahun_ajaran"
                        placeholder="Contoh: 2023/2024"
                        value={formData.tahun_ajaran}
                        onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="Matematika">Matematika</Label>
                      <Input
                        id="Matematika"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.Matematika}
                        onChange={(e) => setFormData({ ...formData, Matematika: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="PKN">PKN</Label>
                      <Input
                        id="PKN"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.PKN}
                        onChange={(e) => setFormData({ ...formData, PKN: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Seni_Budaya">Seni Budaya</Label>
                      <Input
                        id="Seni_Budaya"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.Seni_Budaya}
                        onChange={(e) => setFormData({ ...formData, Seni_Budaya: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ipa">IPA</Label>
                      <Input
                        id="ipa"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.ipa}
                        onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Bahasa_Indonesia">Bahasa Indonesia</Label>
                      <Input
                        id="Bahasa_Indonesia"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.Bahasa_Indonesia}
                        onChange={(e) => setFormData({ ...formData, Bahasa_Indonesia: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Bahasa_Inggris">Bahasa Inggris</Label>
                      <Input
                        id="Bahasa_Inggris"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.Bahasa_Inggris}
                        onChange={(e) => setFormData({ ...formData, Bahasa_Inggris: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="PJOK">PJOK</Label>
                      <Input
                        id="PJOK"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.PJOK}
                        onChange={(e) => setFormData({ ...formData, PJOK: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="IPS">IPS</Label>
                      <Input
                        id="IPS"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.IPS}
                        onChange={(e) => setFormData({ ...formData, IPS: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Pend_Agama">Pendidikan Agama</Label>
                      <Input
                        id="Pend_Agama"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.Pend_Agama}
                        onChange={(e) => setFormData({ ...formData, Pend_Agama: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="TIK">TIK</Label>
                      <Input
                        id="TIK"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.TIK}
                        onChange={(e) => setFormData({ ...formData, TIK: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingGrade ? "Simpan Perubahan" : "Tambah Nilai"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Nilai</CardTitle>
          <CardDescription>Total {grades.length} data nilai</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari nilai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
     
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIS</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead>Matematika</TableHead>
              <TableHead>PKN</TableHead>
              <TableHead>Seni Budaya</TableHead>
              <TableHead>IPA</TableHead>
              <TableHead>Bahasa Indonesia</TableHead>
              <TableHead>Bahasa Inggris</TableHead>
              <TableHead>PJOK</TableHead>
              <TableHead>IPS</TableHead>
              <TableHead>Pendidikan Agama</TableHead>
              <TableHead>TIK</TableHead>
              <TableHead>Rata-rata</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell className="font-medium">{grade.siswa?.nis}</TableCell>
                <TableCell>{grade.siswa?.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline">{grade.siswa?.kelas}</Badge>
                </TableCell>
                <TableCell>{grade.semester}</TableCell>
                <TableCell>{grade.tahun_ajaran}</TableCell>
                <TableCell>{grade.Matematika}</TableCell>
                <TableCell>{grade.PKN}</TableCell>
                <TableCell>{grade.Seni_Budaya}</TableCell>
                <TableCell>{grade.ipa}</TableCell>
                <TableCell>{grade.Bahasa_Indonesia}</TableCell>
                <TableCell>{grade.Bahasa_Inggris}</TableCell>
                <TableCell>{grade.PJOK}</TableCell>
                <TableCell>{grade.IPS}</TableCell>
                <TableCell>{grade.Pend_Agama}</TableCell>
                <TableCell>{grade.TIK}</TableCell>
                <TableCell>
                  <Badge variant={grade.rata_rata >= 80 ? "default" : grade.rata_rata >= 60 ? "secondary" : "destructive"}>
                    {grade.rata_rata}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(grade)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(grade.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
)
}

