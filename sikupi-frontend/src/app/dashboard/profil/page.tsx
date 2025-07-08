import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormSelect } from "@/components/forms/form-select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Store,
  Shield,
  Camera,
  Save
} from "lucide-react";

export const metadata: Metadata = {
  title: "Profil - Dashboard Sikupi",
  description: "Kelola informasi profil dan pengaturan akun Anda.",
};

// Mock data - replace with actual API calls
const USER_DATA = {
  id: "usr-001",
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+62 812-3456-7890",
  avatar: null,
  bio: "Penjual ampas kopi berkualitas dari Jakarta. Sudah berpengalaman 3 tahun dalam industri coffee waste.",
  address: {
    street: "Jl. Merdeka No. 123",
    city: "Jakarta",
    province: "DKI Jakarta",
    postalCode: "10110",
  },
  business: {
    name: "Kopi Nusantara",
    type: "Cafe & Restaurant",
    description: "Cafe dengan konsep eco-friendly yang mengolah ampas kopi menjadi produk bernilai.",
    established: "2021",
  },
  verification: {
    email: true,
    phone: true,
    identity: false,
    business: true,
  },
  stats: {
    totalSales: "Rp 12.450.000",
    totalOrders: 156,
    rating: 4.8,
    reviewCount: 89,
  },
  joinDate: "2023-05-15",
};

const BUSINESS_TYPES = [
  { value: "cafe", label: "Cafe & Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "factory", label: "Coffee Factory" },
  { value: "individual", label: "Individual" },
  { value: "other", label: "Lainnya" },
];

const PROVINCES = [
  { value: "jakarta", label: "DKI Jakarta" },
  { value: "jabar", label: "Jawa Barat" },
  { value: "jateng", label: "Jawa Tengah" },
  { value: "jatim", label: "Jawa Timur" },
  { value: "bali", label: "Bali" },
];

function VerificationBadge({ verified, label }: { verified: boolean; label: string }) {
  return (
    <Badge variant={verified ? "default" : "secondary"} className="text-xs">
      {verified ? "✓" : "○"} {label}
    </Badge>
  );
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader
          title="Profil"
          description="Kelola informasi profil dan pengaturan akun Anda."
          breadcrumbs={[{ label: "Profil" }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle>{USER_DATA.name}</CardTitle>
                <CardDescription>{USER_DATA.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Member sejak</p>
                  <p className="font-medium">{USER_DATA.joinDate}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status Verifikasi</p>
                  <div className="flex flex-wrap gap-2">
                    <VerificationBadge verified={USER_DATA.verification.email} label="Email" />
                    <VerificationBadge verified={USER_DATA.verification.phone} label="Phone" />
                    <VerificationBadge verified={USER_DATA.verification.identity} label="KTP" />
                    <VerificationBadge verified={USER_DATA.verification.business} label="Bisnis" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Statistik</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Penjualan</p>
                      <p className="font-medium">{USER_DATA.stats.totalSales}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pesanan</p>
                      <p className="font-medium">{USER_DATA.stats.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium">{USER_DATA.stats.rating}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Review</p>
                      <p className="font-medium">{USER_DATA.stats.reviewCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pribadi
                </CardTitle>
                <CardDescription>
                  Update informasi pribadi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nama Lengkap"
                    defaultValue={USER_DATA.name}
                    required
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    defaultValue={USER_DATA.email}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nomor Telepon"
                    type="tel"
                    defaultValue={USER_DATA.phone}
                    required
                  />
                  <FormSelect
                    label="Provinsi"
                    options={PROVINCES}
                    value="jakarta"
                    required
                  />
                </div>
                <FormTextarea
                  label="Bio"
                  placeholder="Ceritakan tentang diri Anda..."
                  defaultValue={USER_DATA.bio}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informasi Alamat
                </CardTitle>
                <CardDescription>
                  Update alamat untuk pengiriman dan identitas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormTextarea
                  label="Alamat Lengkap"
                  placeholder="Masukkan alamat lengkap..."
                  defaultValue={USER_DATA.address.street}
                  required
                  rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Kota"
                    defaultValue={USER_DATA.address.city}
                    required
                  />
                  <FormSelect
                    label="Provinsi"
                    options={PROVINCES}
                    value="jakarta"
                    required
                  />
                  <FormInput
                    label="Kode Pos"
                    defaultValue={USER_DATA.address.postalCode}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Informasi Bisnis
                </CardTitle>
                <CardDescription>
                  Informasi tentang bisnis atau usaha Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nama Bisnis"
                    defaultValue={USER_DATA.business.name}
                    required
                  />
                  <FormSelect
                    label="Jenis Bisnis"
                    options={BUSINESS_TYPES}
                    value="cafe"
                    required
                  />
                </div>
                <FormTextarea
                  label="Deskripsi Bisnis"
                  placeholder="Ceritakan tentang bisnis Anda..."
                  defaultValue={USER_DATA.business.description}
                  rows={3}
                />
                <FormInput
                  label="Tahun Didirikan"
                  type="number"
                  defaultValue={USER_DATA.business.established}
                  min="1900"
                  max="2024"
                />
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Keamanan
                </CardTitle>
                <CardDescription>
                  Kelola password dan keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  label="Password Saat Ini"
                  type="password"
                  placeholder="Masukkan password saat ini"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Password Baru"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                  <FormInput
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button size="lg">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}