// FILE: src/app/ai-assessment/page.tsx

"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout"; // 1. Tambahkan import ini
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Upload, 
  Brain, 
  Zap, 
  Target, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  TrendingUp,
  Shield,
  FileText,
  Settings
} from "lucide-react";

export default function AIAssessmentPage() {
  const [activeTab, setActiveTab] = useState("upload");

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-500" />,
      title: "AI Quality Assessment",
      description: "Analisis kualitas ampas kopi menggunakan teknologi AI terdepan",
      status: "Dalam Pengembangan"
    },
    {
      icon: <Camera className="h-8 w-8 text-green-500" />,
      title: "Image Recognition",
      description: "Deteksi otomatis karakteristik ampas kopi dari foto",
      status: "Dalam Pengembangan"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      title: "Grading System",
      description: "Penilaian grade A, B, C, D berdasarkan standar kualitas",
      status: "Dalam Pengembangan"
    },
    {
      icon: <Target className="h-8 w-8 text-orange-500" />,
      title: "Recommendation Engine",
      description: "Saran pengolahan dan pemanfaatan optimal",
      status: "Dalam Pengembangan"
    }
  ];

  const mockAssessmentData = [
    {
      id: 1,
      image: "/api/placeholder/150/150",
      grade: "A",
      score: 92,
      date: "2024-01-15",
      characteristics: ["Tekstur Halus", "Warna Konsisten", "Kadar Air Optimal"]
    },
    {
      id: 2,
      image: "/api/placeholder/150/150",
      grade: "B",
      score: 78,
      date: "2024-01-14",
      characteristics: ["Tekstur Sedang", "Warna Baik", "Sedikit Kontaminasi"]
    },
    {
      id: 3,
      image: "/api/placeholder/150/150",
      grade: "B",
      score: 85,
      date: "2024-01-13",
      characteristics: ["Tekstur Baik", "Warna Seragam", "Kadar Air Baik"]
    }
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-500 text-white";
      case "B": return "bg-blue-500 text-white";
      case "C": return "bg-yellow-500 text-white";
      case "D": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    // 2. Bungkus semua konten dengan <MainLayout>
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Container className="py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Ampas Analyzer
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teknologi AI canggih untuk menganalisis kualitas ampas kopi secara otomatis dan memberikan rekomendasi terbaik
            </p>
          </div>

          {/* Development Alert */}
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Fitur Dalam Pengembangan:</strong> AI Assessment sedang dalam tahap pengembangan. 
              Preview ini menampilkan tampilan dan fitur yang akan tersedia.
            </AlertDescription>
          </Alert>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Upload & Assess</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>

            {/* Upload & Assessment Tab */}
            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Foto Ampas Kopi
                    </CardTitle>
                    <CardDescription>
                      Upload foto ampas kopi untuk mendapatkan analisis AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        Drag & drop foto atau klik untuk upload
                      </p>
                      <Button disabled className="mb-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Pilih Foto
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Format: JPG, PNG, WebP (Max 5MB)
                      </p>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Foto jelas dan fokus
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Pencahayaan yang baik
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Tampilan penuh ampas kopi
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment Results Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Hasil Analisis AI
                    </CardTitle>
                    <CardDescription>
                      Contoh hasil analisis yang akan ditampilkan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Grade */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Grade Kualitas:</span>
                        <Badge className={getGradeColor("A")}>Grade A</Badge>
                      </div>
                      
                      {/* Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Skor Kualitas:</span>
                        <span className="text-2xl font-bold text-green-600">92/100</span>
                      </div>
                      
                      {/* Confidence */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tingkat Kepercayaan:</span>
                        <span className="text-sm text-green-600">95%</span>
                      </div>
                      
                      {/* Characteristics */}
                      <div>
                        <p className="text-sm font-medium mb-2">Karakteristik Terdeteksi:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Tekstur Halus</Badge>
                          <Badge variant="outline">Warna Konsisten</Badge>
                          <Badge variant="outline">Kadar Air Optimal</Badge>
                          <Badge variant="outline">Tidak Ada Kontaminasi</Badge>
                        </div>
                      </div>
                      
                      {/* Recommendations */}
                      <div>
                        <p className="text-sm font-medium mb-2">Rekomendasi:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Cocok untuk pupuk organik premium</li>
                          <li>• Dapat digunakan untuk media tanam</li>
                          <li>• Potensi harga jual tinggi</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Riwayat Assessment
                  </CardTitle>
                  <CardDescription>
                    Contoh riwayat analisis AI yang telah dilakukan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAssessmentData.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getGradeColor(item.grade)}>
                              Grade {item.grade}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Skor: {item.score}/100
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.characteristics.map((char, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {char}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          <FileText className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +12% dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Rata-rata Skor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78.5</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +5.2 dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Grade A</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23%</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +8% dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Pengaturan AI Assessment
                  </CardTitle>
                  <CardDescription>
                    Konfigurasi pengaturan analisis AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Assessment</p>
                        <p className="text-sm text-muted-foreground">
                          Otomatis analisis setelah upload
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Aktifkan
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifikasi Hasil</p>
                        <p className="text-sm text-muted-foreground">
                          Terima notifikasi setelah analisis selesai
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Aktifkan
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Simpan Histori</p>
                        <p className="text-sm text-muted-foreground">
                          Simpan riwayat analisis untuk referensi
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Aktifkan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Fitur AI Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </MainLayout> 
    // 3. Tutup tag MainLayout di sini
  );
}
