import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Eye, 
  Share2, 
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from "lucide-react";

// This would come from your API/database
const getArticleBySlug = (slug: string) => {
  // Mock articles data (same as in the main page)
  const ARTICLES = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Panduan Lengkap Mengolah Ampas Kopi Menjadi Pupuk Organik",
      slug: "panduan-lengkap-mengolah-ampas-kopi-menjadi-pupuk-organik",
      content: `
        <p>Ampas kopi adalah limbah organik yang sangat berharga untuk pertanian. Dengan kandungan nitrogen yang tinggi, ampas kopi dapat diolah menjadi pupuk organik berkualitas tinggi yang dapat meningkatkan kesuburan tanah secara alami.</p>
        
        <h2>Manfaat Ampas Kopi untuk Tanaman</h2>
        <p>Ampas kopi memiliki berbagai manfaat yang luar biasa untuk tanaman dan tanah:</p>
        <ul>
          <li><strong>Meningkatkan kesuburan tanah</strong> - Kandungan nitrogen yang tinggi membantu pertumbuhan daun</li>
          <li><strong>Memperbaiki struktur tanah</strong> - Meningkatkan aerasi dan drainase tanah</li>
          <li><strong>Menambah kandungan nitrogen</strong> - Nutrisi penting untuk fotosintesis</li>
          <li><strong>Mengusir hama alami</strong> - Aroma kopi dapat menjauhkan serangga tertentu</li>
          <li><strong>Meningkatkan pH tanah</strong> - Membantu menetralkan tanah asam</li>
        </ul>
        
        <h2>Cara Pengolahan Ampas Kopi Menjadi Pupuk</h2>
        <p>Berikut adalah langkah-langkah detail untuk mengolah ampas kopi menjadi pupuk organik:</p>
        
        <h3>1. Persiapan Bahan</h3>
        <ol>
          <li><strong>Keringkan ampas kopi</strong> - Jemur di bawah sinar matahari hingga benar-benar kering</li>
          <li><strong>Siapkan bahan kompos</strong> - Daun kering, sisa sayuran, atau bahan organik lainnya</li>
          <li><strong>Siapkan wadah</strong> - Gunakan ember atau tong plastik dengan lubang aerasi</li>
        </ol>
        
        <h3>2. Proses Komposting</h3>
        <ol>
          <li><strong>Campurkan bahan</strong> - Campur ampas kopi dengan kompos dalam rasio 1:3</li>
          <li><strong>Tambahkan air</strong> - Kelembaban sekitar 60-70%</li>
          <li><strong>Aduk secara berkala</strong> - Setiap 3-4 hari untuk aerasi</li>
          <li><strong>Tunggu proses fermentasi</strong> - Proses memakan waktu 2-3 minggu</li>
        </ol>
        
        <h3>3. Pematangan dan Panen</h3>
        <p>Pupuk siap digunakan ketika:</p>
        <ul>
          <li>Warna berubah menjadi coklat kehitaman</li>
          <li>Tidak berbau busuk</li>
          <li>Tekstur gembur dan mudah dihancurkan</li>
          <li>Suhu sudah normal (tidak panas)</li>
        </ul>
        
        <h2>Tips Penggunaan Pupuk Ampas Kopi</h2>
        <ul>
          <li><strong>Untuk tanaman hias</strong> - Campurkan dengan tanah dalam rasio 1:4</li>
          <li><strong>Untuk sayuran</strong> - Tabur merata di sekitar tanaman</li>
          <li><strong>Untuk bunga</strong> - Aplikasikan 2-3 minggu sekali</li>
          <li><strong>Untuk rumput</strong> - Sebar tipis di atas permukaan tanah</li>
        </ul>
        
        <h2>Kesimpulan</h2>
        <p>Mengolah ampas kopi menjadi pupuk organik adalah cara yang sangat efektif untuk mengurangi limbah dan meningkatkan kesuburan tanah. Dengan mengikuti langkah-langkah di atas, Anda dapat membuat pupuk berkualitas tinggi yang ramah lingkungan dan ekonomis.</p>
      `,
      description: "Pelajari cara mengubah ampas kopi menjadi pupuk organik berkualitas tinggi untuk meningkatkan kesuburan tanah dan hasil panen.",
      image_url: "/articles/pupuk-organik.jpg",
      author_id: "author-001",
      author_name: "Dr. Sari Pertiwi",
      author_bio: "Ahli pertanian organik dengan pengalaman 15 tahun dalam penelitian pupuk organik",
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
    // Add other articles here...
  ];

  return ARTICLES.find(article => article.slug === slug);
};

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  
  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - Sikupi",
    };
  }

  return {
    title: `${article.title} - Edukasi Sikupi`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [article.image_url],
    },
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
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

function ShareButtons({ article }: { article: any }) {
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/edukasi/${article.slug}`;
  const shareText = `Baca artikel menarik: ${article.title}`;

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "text-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "text-sky-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "text-blue-700",
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // You can add a toast notification here
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium">Bagikan:</span>
      <div className="flex space-x-2">
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            variant="outline"
            size="sm"
            onClick={() => window.open(link.url, '_blank')}
            className={link.color}
          >
            <link.icon className="h-4 w-4" />
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Container>
        <div className="py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/edukasi">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Edukasi
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Article Header */}
              <div className="mb-8">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-4">
                    {article.category}
                  </Badge>
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                    {article.title}
                  </h1>
                  <p className="text-muted-foreground text-lg mb-6">
                    {article.description}
                  </p>
                </div>

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{article.author_name}</p>
                      <p className="text-xs">{article.author_bio}</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.read_time} min baca</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatViewCount(article.view_count)} views</span>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>

              {/* Tags */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="border-t pt-8 mb-8">
                <ShareButtons article={article} />
              </div>

              {/* Author Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{article.author_name}</h3>
                      <p className="text-muted-foreground mb-4">{article.author_bio}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          Lihat Profil
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Kirim Pesan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button className="w-full">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Simpan Artikel
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Suka (125)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Bagikan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Artikel Terkait</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">
                            Artikel terkait {i}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            5 min baca
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Table of Contents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daftar Isi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <a href="#manfaat" className="block hover:text-primary">
                      Manfaat Ampas Kopi
                    </a>
                    <a href="#cara-pengolahan" className="block hover:text-primary">
                      Cara Pengolahan
                    </a>
                    <a href="#tips-penggunaan" className="block hover:text-primary">
                      Tips Penggunaan
                    </a>
                    <a href="#kesimpulan" className="block hover:text-primary">
                      Kesimpulan
                    </a>
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