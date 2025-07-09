// FILE: src/app/chatbot/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout"; // Pastikan untuk membungkus dengan MainLayout
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
  Star,
  AlertCircle,
  Settings,
  BookOpen,
  HelpCircle,
  Zap,
  Brain,
  User,
  History
} from "lucide-react";

// --- INTERFACES ---
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  messageCount: number;
}

// --- MAIN COMPONENT ---
export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Halo! Saya SikupiBot, asisten AI untuk membantu Anda dengan segala hal tentang ampas kopi dan marketplace Sikupi. Ada yang bisa saya bantu?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- MOCK DATA ---
  const mockBotResponses = [
    "Ampas kopi memiliki banyak manfaat! Bisa dijadikan pupuk organik, scrub alami, pengusir hama, hingga media tanam. Mau tahu lebih detail tentang penggunaan tertentu?",
    "Untuk menjual ampas kopi di Sikupi, Anda perlu membuat akun seller terlebih dahulu. Kemudian upload foto produk, tentukan harga, dan deskripsikan kualitas ampas kopi Anda.",
    "Grade ampas kopi ditentukan berdasarkan tekstur, warna, kadar air, dan kontaminasi. Grade A adalah kualitas terbaik dengan tekstur halus dan konsisten.",
    "Anda bisa menggunakan fitur AI Assessment untuk mendapatkan analisis otomatis kualitas ampas kopi. Cukup upload foto dan sistem akan memberikan grade dan rekomendasi.",
    "Untuk memulai di Sikupi, daftarkan akun terlebih dahulu. Pilih sebagai buyer untuk membeli atau seller untuk menjual. Lengkapi profil dan mulai bertransaksi!",
    "Harga ampas kopi bervariasi tergantung kualitas dan kuantitas. Grade A biasanya Rp 2.000-3.000/kg, sedangkan grade B sekitar Rp 1.000-2.000/kg."
  ];

  const quickQuestions = [
    "Apa itu ampas kopi?",
    "Bagaimana cara menjual?",
    "Berapa harga ampas kopi?",
    "Cara menggunakan AI Assessment?",
    "Grade ampas kopi apa saja?",
    "Manfaat ampas kopi untuk tanaman?"
  ];
  
  const chatHistory: ChatHistoryItem[] = [
    { id: 'h1', title: 'Manfaat pupuk organik', date: 'Kemarin', messageCount: 12 },
    { id: 'h2', title: 'Cara registrasi seller', date: '2 hari lalu', messageCount: 8 },
    { id: 'h3', title: 'Perbedaan grade ampas', date: '5 hari lalu', messageCount: 21 },
    { id: 'h4', title: 'Detail AI Assessment', date: '1 minggu lalu', messageCount: 15 },
  ];

  const chatStats = [
    { label: "Total Percakapan", value: "2,847", icon: <MessageSquare className="h-5 w-5" /> },
    { label: "Rata-rata Respons", value: "0.8s", icon: <Clock className="h-5 w-5" /> },
    { label: "Tingkat Kepuasan", value: "94%", icon: <Star className="h-5 w-5" /> },
    { label: "Pengguna Aktif", value: "1,245", icon: <Users className="h-5 w-5" /> }
  ];

  // --- FUNCTIONS ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    if(content === inputValue) {
        setInputValue('');
    }

    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: mockBotResponses[Math.floor(Math.random() * mockBotResponses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };
  
  // --- RENDER ---
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Container className="py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-4 p-2 bg-primary/10 rounded-full">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">SikupiBot</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
              Asisten AI cerdas untuk membantu Anda memahami ampas kopi dan menggunakan platform Sikupi.
            </p>
          </div>

          <Alert className="mb-8 border-amber-200 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4 !text-amber-600" />
            <div>
                <div className="font-bold">Fitur Dalam Pengembangan</div>
                <AlertDescription>
                    Chatbot AI ini masih dalam tahap pengembangan. Halaman ini adalah preview tampilan dan fitur yang akan tersedia.
                </AlertDescription>
            </div>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="chat"><Zap className="w-4 h-4 mr-2"/>Chat</TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4 mr-2"/>Riwayat</TabsTrigger>
              <TabsTrigger value="analytics"><TrendingUp className="w-4 h-4 mr-2"/>Analitik</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2"/>Pengaturan</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 hidden lg:block">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary"/>Pertanyaan Cepat</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {quickQuestions.map((q, i) => (
                        <Button key={i} variant="ghost" className="w-full justify-start text-left h-auto p-3" onClick={() => handleSendMessage(q)}>
                          <span className="text-sm font-normal">{q}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-primary/50"><AvatarImage src="/sikupi-logo-removebg.png" /><AvatarFallback>SB</AvatarFallback></Avatar>
                        <div>
                          <CardTitle>SikupiBot</CardTitle>
                          <CardDescription className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500"></span>Online</CardDescription>
                        </div>
                      </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[50vh] overflow-y-auto space-y-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {message.type === 'bot' && <Avatar className="h-8 w-8"><AvatarImage src="/sikupi-logo-removebg.png" /><AvatarFallback>SB</AvatarFallback></Avatar>}
                          <div className={`max-w-md p-3 rounded-lg shadow-sm ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2 text-right">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {message.type === 'user' && <Avatar className="h-8 w-8"><AvatarFallback><User/></AvatarFallback></Avatar>}
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3 items-center">
                           <Avatar className="h-8 w-8"><AvatarImage src="/sikupi-logo-removebg.png" /><AvatarFallback>SB</AvatarFallback></Avatar>
                           <div className="p-3 bg-background rounded-lg shadow-sm text-sm text-muted-foreground">
                              SikupiBot sedang mengetik...
                           </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <div className="relative">
                      <Input
                        placeholder="Ketik pertanyaan Anda di sini..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-24"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled><Mic className="h-4 w-4"/></Button>
                        <Button onClick={() => handleSendMessage(inputValue)}><Send className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Riwayat Percakapan</CardTitle><CardDescription>Lihat kembali percakapan Anda sebelumnya. Fitur ini akan tersedia saat peluncuran penuh.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {chatHistory.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-gray-50 dark:hover:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground"/>
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.date} • {item.messageCount} pesan</p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>Lihat</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
               <Card>
                <CardHeader><CardTitle>Analitik Performa Chatbot</CardTitle><CardDescription>Data berikut adalah contoh untuk tujuan demonstrasi.</CardDescription></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {chatStats.map(stat => (
                      <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                          <span className="text-muted-foreground">{stat.icon}</span>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
               </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Pengaturan Chatbot</CardTitle><CardDescription>Atur preferensi chatbot Anda. Opsi ini akan dapat diubah pada versi final.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="voice-response">Respons Suara</Label>
                      <p className="text-sm text-muted-foreground">Aktifkan untuk mendengar respons dari bot.</p>
                    </div>
                    <Switch id="voice-response" disabled />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="language">Bahasa</Label>
                      <p className="text-sm text-muted-foreground">Pilih bahasa yang digunakan oleh bot.</p>
                    </div>
                    <Select defaultValue="id" disabled>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="id">Bahasa Indonesia</SelectItem></SelectContent>
                    </Select>
                  </div>
                   <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="api-key">Koneksi API</Label>
                      <p className="text-sm text-muted-foreground">Gunakan API key Anda untuk fitur lanjutan.</p>
                    </div>
                    <Input id="api-key" placeholder="Belum tersedia" className="w-[180px]" disabled />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </div>
    </MainLayout>
  );
}
