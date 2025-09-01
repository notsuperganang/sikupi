import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react'

export default function SupportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Bantuan & Dukungan
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-stone-600">
          Butuh bantuan dengan pesanan Anda? Tim kami siap membantu!
        </p>

        {/* Contact Options */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat WhatsApp
            </a>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="tel:+6281234567890">
              <Phone className="h-4 w-4 mr-2" />
              Telepon: +62 812-3456-7890
            </a>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="mailto:support@sikupi.com">
              <Mail className="h-4 w-4 mr-2" />
              Email: support@sikupi.com
            </a>
          </Button>
        </div>

        {/* Support Hours */}
        <div className="pt-4 border-t border-stone-200">
          <h4 className="text-sm font-medium text-stone-900 mb-2">Jam Operasional</h4>
          <div className="space-y-1 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Senin - Jumat</span>
              <span>09:00 - 18:00</span>
            </div>
            <div className="flex justify-between">
              <span>Sabtu</span>
              <span>09:00 - 15:00</span>
            </div>
            <div className="flex justify-between">
              <span>Minggu</span>
              <span>Libur</span>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="pt-4 border-t border-stone-200">
          <Button variant="link" className="w-full p-0 h-auto justify-start" asChild>
            <a href="/faq" className="text-sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Lihat Pertanyaan yang Sering Diajukan
            </a>
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="pt-4 border-t border-stone-200 bg-stone-50 -mx-6 px-6 py-3">
          <h4 className="text-sm font-medium text-stone-900 mb-2">Tips Cepat</h4>
          <ul className="space-y-1 text-xs text-stone-600">
            <li>• Siapkan nomor pesanan saat menghubungi kami</li>
            <li>• Screenshot halaman ini untuk referensi</li>
            <li>• Periksa folder spam untuk email konfirmasi</li>
            <li>• Hubungi kami segera jika ada masalah pembayaran</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}