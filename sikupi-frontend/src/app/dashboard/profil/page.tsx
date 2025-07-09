// FILE: src/app/dashboard/profil/page.tsx
"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Shield,
  Star,
  Edit,
  Camera,
  Save
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateProfile } from "@/lib/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    province: user?.province || "",
    postalCode: user?.postalCode || "",
    businessName: user?.businessName || "",
    businessType: user?.businessType || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      province: user?.province || "",
      postalCode: user?.postalCode || "",
      businessName: user?.businessName || "",
      businessType: user?.businessType || "",
    });
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profil</h1>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Batal
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profil
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="business">Bisnis</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="text-lg">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user?.isVerified ? "default" : "secondary"}>
                        {user?.isVerified ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Terverifikasi
                          </>
                        ) : (
                          "Belum Terverifikasi"
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {user?.userType === "seller" ? "Penjual" : "Pembeli"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Kota</Label>
                        <Input
                          id="city"
                          name="city"
                          value={profileData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Provinsi</Label>
                        <Input
                          id="province"
                          name="province"
                          value={profileData.province}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="postalCode">Kode Pos</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={profileData.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Simpan
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Batal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Bisnis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Nama Bisnis</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={profileData.businessName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Jenis Bisnis</Label>
                    <Input
                      id="businessType"
                      name="businessType"
                      value={profileData.businessType}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {user?.userType === "seller" && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{user.rating || 0}</span>
                        <span className="text-gray-500">({user.totalReviews || 0} ulasan)</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Ubah Password</h4>
                    <p className="text-sm text-gray-600">Perbarui password untuk keamanan akun</p>
                  </div>
                  <Button variant="outline">
                    Ubah Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Verifikasi Email</h4>
                    <p className="text-sm text-gray-600">
                      {user?.emailVerified ? "Email sudah terverifikasi" : "Verifikasi email Anda"}
                    </p>
                  </div>
                  <Button variant="outline" disabled={user?.emailVerified}>
                    {user?.emailVerified ? "Terverifikasi" : "Verifikasi"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Verifikasi Nomor Telepon</h4>
                    <p className="text-sm text-gray-600">
                      {user?.phoneVerified ? "Nomor telepon sudah terverifikasi" : "Verifikasi nomor telepon Anda"}
                    </p>
                  </div>
                  <Button variant="outline" disabled={user?.phoneVerified}>
                    {user?.phoneVerified ? "Terverifikasi" : "Verifikasi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
