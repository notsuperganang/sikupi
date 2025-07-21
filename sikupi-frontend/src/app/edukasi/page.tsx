import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/common/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header"; // Adjust path as needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Clock, 
  User, 
  BookOpen,
  TrendingUp,
  Filter,
  ArrowRight,
  Play,
  Download,
  Share2,
  Eye
} from "lucide-react";

export const metadata: Metadata = {
  title: "Edukasi - Sikupi",
  description: "Pelajari cara mengolah ampas kopi menjadi produk bernilai. Artikel, tutorial, dan tips dari para ahli.",
};

// Mock data following backend schema
const ARTICLES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Panduan Lengkap Mengolah Ampas Kopi Menjadi Pupuk Organik",
    slug: "panduan-lengkap-mengolah-ampas-kopi-menjadi-pupuk-organik",
    content: `
      <p>Ampas kopi adalah limbah organik yang sangat berharga untuk pertanian. Dengan kandungan nitrogen yang tinggi, ampas kopi dapat diolah menjadi pupuk organik berkualitas tinggi.</p>
      
      <h2>Manfaat Ampas Kopi untuk Tanaman</h2>
      <ul>
        <li>Meningkatkan kesuburan tanah</li>
        <li>Memperbaiki struktur tanah</li>
        <li>Menambah kandungan nitrogen</li>
        <li>Mengusir hama alami</li>
      </ul>
      
      <h2>Cara Pengolahan</h2>
      <ol>
        <li>Keringkan ampas kopi hingga benar-benar kering</li>
        <li>Campurkan dengan kompos atau bahan organik lainnya</li>
        <li>Proses fermentasi selama 2-3 minggu</li>
        <li>Aduk secara berkala untuk aerasi</li>
      </ol>
    `,
    description: "Pelajari cara mengubah ampas kopi menjadi pupuk organik berkualitas tinggi untuk meningkatkan kesuburan tanah dan hasil panen.",
    image_url: "/articles/pupuk-organik.jpg",
    author_id: "author-001",
    author_name: "Dr. Sari Pertiwi",
    author_avatar: "/avatars/author-01.jpg",
    category: "Tutorial",
    tags: ["pupuk", "organik", "pertanian", "sustainability"],
    is_published: true,
    view_count: 1250,
    read_time: 8,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    featured: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Budidaya Jamur Tiram Menggunakan Ampas Kopi",
    slug: "budidaya-jamur-tiram-menggunakan-ampas-kopi",
    content: `
      <p>Jamur tiram dapat dibudidayakan dengan mudah menggunakan ampas kopi sebagai media tanam. Ini adalah cara yang sangat ekonomis dan ramah lingkungan.</p>
      
      <h2>Keuntungan Budidaya Jamur dengan Ampas Kopi</h2>
      <ul>
        <li>Media tanam gratis dan mudah didapat</li>
        <li>Nutrisi yang kaya untuk pertumbuhan jamur</li>
        <li>Hasil panen yang melimpah</li>
        <li>Ramah lingkungan</li>
      </ul>
    `,
    description: "Panduan step-by-step budidaya jamur tiram menggunakan ampas kopi sebagai media tanam yang ekonomis dan berkelanjutan.",
    image_url: "/articles/jamur-tiram.jpg",
    author_id: "author-002",
    author_name: "Budi Santoso",
    author_avatar: "/avatars/author-02.jpg",
    category: "Tutorial",
    tags: ["jamur", "budidaya", "ampas-kopi", "mushroom"],
    is_published: true,
    view_count: 892,
    read_time: 6,
    created_at: "2024-01-14T14:20:00Z",
    updated_at: "2024-01-14T14:20:00Z",
    featured: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Kreativitas Kerajinan dari Ampas Kopi",
    slug: "kreativitas-kerajinan-dari-ampas-kopi",
    content: `
      <p>Ampas kopi tidak hanya bisa diolah menjadi pupuk atau media tanam, tetapi juga bisa diubah menjadi berbagai kerajinan menarik.</p>
      
      <h2>Ide Kerajinan Ampas Kopi</h2>
      <ul>
        <li>Lilin aromaterapi</li>
        <li>Scrub wajah alami</li>
        <li>Pot tanaman biodegradable</li>
        <li>Pewarna alami untuk kain</li>
      </ul>
    `,
    description: "Eksplorasi berbagai kreativitas kerajinan yang bisa dibuat dari ampas kopi untuk meningkatkan nilai ekonomis limbah.",
    image_url: "/articles/kerajinan-ampas.jpg",
    author_id: "author-003",
    author_name: "Maya Craft",
    author_avatar: "/avatars/author-03.jpg",
    category: "Kreatif",
    tags: ["kerajinan", "craft", "diy", "creative"],
    is_published: true,
    view_count: 645,
    read_time: 5,
    created_at: "2024-01-13T09:15:00Z",
    updated_at: "2024-01-13T09:15:00Z",
    featured: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Ekonomi Sirkular dalam Industri Kopi",
    slug: "ekonomi-sirkular-dalam-industri-kopi",
    content: `
      <p>Industri kopi menghasilkan limbah yang sangat besar. Dengan konsep ekonomi sirkular, limbah ini dapat diubah menjadi sumber daya baru.</p>
      
      <h2>Prinsip Ekonomi Sirkular</h2>
      <ul>
        <li>Reduce - Mengurangi limbah</li>
        <li>Reuse - Menggunakan kembali</li>
        <li>Recycle - Mendaur ulang</li>
        <li>Recover - Memulihkan nilai</li>
      </ul>
    `,
    description: "Memahami konsep ekonomi sirkular dalam industri kopi dan bagaimana ampas kopi dapat menjadi bagian dari solusi berkelanjutan.",
    image_url: "/articles/ekonomi-sirkular.jpg",
    author_id: "author-004",
    author_name: "Prof. Ahmad Wijaya",
    author_avatar: "/avatars/author-04.jpg",
    category: "Analisis",
    tags: ["ekonomi", "sustainability", "circular-economy", "industry"],
    is_published: true,
    view_count: 1100,
    read_time: 12,
    created_at: "2024-01-12T16:45:00Z",
    updated_at: "2024-01-12T16:45:00Z",
    featured: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Teknologi AI untuk Penilaian Kualitas Ampas Kopi",
    slug: "teknologi-ai-untuk-penilaian-kualitas-ampas-kopi",
    content: `
      <p>Teknologi AI memungkinkan penilaian kualitas ampas kopi secara otomatis dan akurat, membantu petani dan pedagang menentukan nilai jual yang tepat.</p>
      
      <h2>Keunggulan AI dalam Penilaian Kualitas</h2>
      <ul>
        <li>Konsisten dan objektif</li>
        <li>Proses yang cepat</li>
        <li>Akurasi tinggi</li>
        <li>Standardisasi kualitas</li>
      </ul>
    `,
    description: "Eksplorasi teknologi AI dalam menilai kualitas ampas kopi dan dampaknya terhadap industry coffee waste.",
    image_url: "/articles/ai-technology.jpg",
    author_id: "author-005",
    author_name: "Dr. Tech Innovator",
    author_avatar: "/avatars/author-05.jpg",
    category: "Teknologi",
    tags: ["ai", "technology", "quality", "assessment"],
    is_published: true,
    view_count: 756,
    read_time: 7,
    created_at: "2024-01-11T11:30:00Z",
    updated_at: "2024-01-11T11:30:00Z",
    featured: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Manfaat Kesehatan Produk Berbahan Ampas Kopi",
    slug: "manfaat-kesehatan-produk-berbahan-ampas-kopi",
    content: `
      <p>Produk berbahan ampas kopi tidak hanya ramah lingkungan, tetapi juga memiliki berbagai manfaat kesehatan yang menakjubkan.</p>
      
      <h2>Manfaat untuk Kesehatan</h2>
      <ul>
        <li>Antioksidan tinggi</li>
        <li>Eksfoliasi alami untuk kulit</li>
        <li>Mengurangi selulit</li>
        <li>Aromaterapi alami</li>
      </ul>
    `,
    description: "Pelajari berbagai manfaat kesehatan dari produk yang terbuat dari ampas kopi untuk kecantikan dan kesehatan.",
    image_url: "/articles/health-benefits.jpg",
    author_id: "author-006",
    author_name: "Dr. Sehat Alami",
    author_avatar: "/avatars/author-06.jpg",
    category: "Kesehatan",
    tags: ["health", "beauty", "natural", "wellness"],
    is_published: true,
    view_count: 923,
    read_time: 6,
    created_at: "2024-01-10T13:20:00Z",
    updated_at: "2024-01-10T13:20:00Z",
    featured: false,
  },
];

const CATEGORIES = [
  { id: "all", label: "Semua Artikel", count: ARTICLES.length },
  { id: "Tutorial", label: "Tutorial", count: ARTICLES.filter(a => a.category === "Tutorial").length },
  { id: "Kreatif", label: "Kreatif", count: ARTICLES.filter(a => a.category === "Kreatif").length },
  { id: "Analisis", label: "Analisis", count: ARTICLES.filter(a => a.category === "Analisis").length },
  { id: "Teknologi", label: "Teknologi", count: ARTICLES.filter(a => a.category === "Teknologi").length },
  { id: "Kesehatan", label: "Kesehatan", count: ARTICLES.filter(a => a.category === "Kesehatan").length },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatViewCount = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

function FeaturedArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="secondary" className="mb-2">
            {article.category}
          </Badge>
          <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-white/90 text-sm line-clamp-2">
            {article.description}
          </p>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{article.author_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{article.read_time} min</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{formatViewCount(article.view_count)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <Link href={`/edukasi/${article.slug}`}>
      <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-4 left-4" variant="secondary">
            {article.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{article.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{article.read_time} min</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{formatViewCount(article.view_count)}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              {formatDate(article.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PopularTags() {
  const allTags = ARTICLES.flatMap(article => article.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tag Populer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(([tag, count]) => (
            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              {tag} ({count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EducationPage() {
  const featuredArticles = ARTICLES.filter(article => article.featured);
  const regularArticles = ARTICLES.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Container>
        <div className="py-12">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold">Pusat Edukasi Sikupi - Sikupi Magazine</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Pelajari cara mengolah ampas kopi menjadi produk bernilai. Temukan artikel, tutorial, dan tips dari para ahli.
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Cari artikel, tutorial, atau topik..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Articles */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Artikel Pilihan</h2>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Terpopuler
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Link key={article.id} href={`/edukasi/${article.slug}`}>
                  <FeaturedArticleCard article={article} />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  {CATEGORIES.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                      {category.label} ({category.count})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {CATEGORIES.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(category.id === "all" 
                        ? regularArticles 
                        : regularArticles.filter(a => a.category === category.id)
                      ).map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Muat Lebih Banyak
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Tags */}
              <PopularTags />

              {/* Newsletter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Newsletter</CardTitle>
                  <CardDescription>
                    Dapatkan artikel terbaru langsung di email Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input placeholder="Email Anda" type="email" />
                    <Button className="w-full">
                      Berlangganan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tautan Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/produk" className="flex items-center space-x-2 text-sm hover:text-primary">
                      <BookOpen className="h-4 w-4" />
                      <span>Panduan Produk</span>
                    </Link>
                    <Link href="/dampak" className="flex items-center space-x-2 text-sm hover:text-primary">
                      <Play className="h-4 w-4" />
                      <span>Video Tutorial</span>
                    </Link>
                    <Link href="/tentang" className="flex items-center space-x-2 text-sm hover:text-primary">
                      <Download className="h-4 w-4" />
                      <span>Download Materi</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}