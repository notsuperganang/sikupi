"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Factory,
  Sparkles,
  Package2,
  Cat,
  Droplets,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AmpasAnalysis } from '@/lib/schemas/analyzer';

interface AnalysisResultsProps {
  analysis: AmpasAnalysis;
  onAnalyzeAnother: () => void;
}

const suitabilityIcons = {
  briket: Package2,
  pulp: Package2,
  scrub: Sparkles,
  pupuk: Leaf,
  pakan_ternak: Cat,
};

const suitabilityTranslations = {
  briket: 'Briket',
  pulp: 'Pulp',
  scrub: 'Scrub',
  pupuk: 'Pupuk',
  pakan_ternak: 'Pakan Ternak',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-orange-700 bg-orange-50 border-orange-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  if (score >= 40) return 'outline';
  return 'destructive';
}

export function AnalysisResults({ analysis, onAnalyzeAnother }: AnalysisResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200 mb-4"
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {analysis.ui_copy.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {analysis.ui_copy.tagline}
          </p>
        </div>
      </div>

      {/* Price Estimate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <TrendingUp className="h-6 w-6 text-gray-700" />
              Estimasi Harga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(analysis.price_estimate_idr.min)}
              </span>
              <span className="text-gray-600">-</span>
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(analysis.price_estimate_idr.max)}
              </span>
              <span className="text-gray-600">per kg</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Tingkat kepercayaan:</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(analysis.price_estimate_idr.confidence * 100)}%
              </span>
            </div>

            {analysis.price_estimate_idr.factors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800">Faktor penentu:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.price_estimate_idr.factors.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Suitability Scores */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <Factory className="h-6 w-6 text-gray-700" />
              Kesesuaian Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.suitability).map(([key, value]) => {
                const Icon = suitabilityIcons[key as keyof typeof suitabilityIcons];
                const label = suitabilityTranslations[key as keyof typeof suitabilityTranslations];
                
                return (
                  <div key={key} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">{label}</span>
                      </div>
                      <Badge variant={getScoreBadgeVariant(value.score)} className="text-sm">
                        {value.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{value.why}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Eco Impact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-900">
              <Leaf className="h-6 w-6 text-green-700" />
              Dampak Lingkungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-green-700 mb-1">Sikupi Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-900">
                    {analysis.eco.sikupi_score}
                  </span>
                  <span className="text-green-700">/100</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-green-700 mb-1">CO₂ Tersimpan</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-900">
                    {analysis.eco.co2_saved_kg.toFixed(1)}
                  </span>
                  <span className="text-green-700">kg</span>
                </div>
              </div>
            </div>

            {analysis.eco.badges.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {analysis.eco.badges.map((badge, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Processing Plan */}
      {analysis.process_plan.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Rekomendasi Proses</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {analysis.process_plan.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-800">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Red Flags */}
      {analysis.red_flags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-900">
                <AlertTriangle className="h-6 w-6 text-red-700" />
                Peringatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.red_flags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-700">•</span>
                    <span className="text-red-800">{flag}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Vision Findings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Analisis Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kelembaban</p>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900 capitalize">
                    {analysis.vision_findings.moisture_visual}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ukuran Partikel</p>
                <span className="font-medium text-gray-900 capitalize">
                  {analysis.vision_findings.particle_size}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Jamur</p>
                <span className={`font-medium ${analysis.vision_findings.mold_suspect ? 'text-red-600' : 'text-green-600'}`}>
                  {analysis.vision_findings.mold_suspect ? 'Terdeteksi' : 'Tidak terdeteksi'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Kontaminan</p>
                <span className="font-medium text-gray-900">
                  {analysis.vision_findings.contaminants.length > 0 
                    ? analysis.vision_findings.contaminants.join(', ')
                    : 'Tidak ada'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 pt-6"
      >
        <Button
          onClick={onAnalyzeAnother}
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Analisis Lagi
        </Button>
        
        <Button
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Simpan Hasil
        </Button>
      </motion.div>

      {/* Analysis Meta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pt-4"
      >
        <p className="text-xs text-gray-500">
          Dianalisis menggunakan {analysis.meta.model} • 
          Waktu proses: {analysis.meta.latency_ms}ms
        </p>
        {analysis.meta.image_quality_note && (
          <p className="text-xs text-blue-600 mt-1">
            {analysis.meta.image_quality_note}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}