import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Sikupi',
  description: 'Sikupi Admin Dashboard',
}

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di dashboard admin Sikupi. Fitur admin sedang dalam pengembangan.
        </p>
        <div className="p-6 border rounded-lg bg-muted/10">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Dashboard admin dengan fitur lengkap akan tersedia segera.
          </p>
        </div>
      </div>
    </div>
  )
}