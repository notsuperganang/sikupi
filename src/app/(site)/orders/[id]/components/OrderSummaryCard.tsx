import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Coffee, Settings } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { OrderData } from '../OrderDetailClient'

interface OrderSummaryCardProps {
  order: OrderData
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const { items, totals } = order

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-stone-900 text-sm">
                  {item.title}
                </h4>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                  <span className="bg-stone-100 px-2 py-1 rounded">
                    {item.qty} {item.unit}
                  </span>
                  
                  {item.attributes.coffeeType && (
                    <span className="flex items-center gap-1">
                      <Coffee className="h-3 w-3" />
                      {item.attributes.coffeeType}
                    </span>
                  )}
                  
                  {item.attributes.grindLevel && (
                    <span className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      {item.attributes.grindLevel}
                    </span>
                  )}
                </div>

                {item.attributes.condition && (
                  <div className="text-xs text-stone-500 mt-1">
                    Kondisi: {item.attributes.condition}
                  </div>
                )}

                <div className="text-xs text-stone-500 mt-1">
                  {formatRupiah(item.price)} × {item.qty}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatRupiah(item.subtotal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Subtotal ({items.length} item)</span>
            <span>{formatRupiah(totals.itemsTotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Ongkos Kirim</span>
            <span>{formatRupiah(totals.shippingCost)}</span>
          </div>
          
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Diskon</span>
              <span className="text-green-600">-{formatRupiah(totals.discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatRupiah(totals.grandTotal)}</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between pt-3 border-t bg-stone-50 -mx-6 px-6 py-3">
          <div className="text-center">
            <div className="font-semibold text-sm">{items.length}</div>
            <div className="text-xs text-stone-600">Item</div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-sm">
              {items.reduce((total, item) => total + item.qty, 0)} kg
            </div>
            <div className="text-xs text-stone-600">Total Berat</div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-sm text-green-600">
              {formatRupiah(totals.grandTotal)}
            </div>
            <div className="text-xs text-stone-600">Total Harga</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}