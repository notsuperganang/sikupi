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
  RotateCcw,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CometCard } from '@/components/ui/comet-card';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
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
    <NeonGradientCard
      className="w-full max-w-7xl mx-auto"
      borderSize={5}
      borderRadius={20}
      neonColors={{
        firstColor: "#D2691E", // Chocolate brown
        secondColor: "#CD853F", // Sandy brown
      }}
    >
      <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/10 p-6 md:p-8 rounded-[18px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12" // Increased from space-y-8 to space-y-12 for better shadow clearance
        >
      {/* Enhanced Header with Coffee Theme */}
      <div className="text-center space-y-6 relative overflow-hidden">
        {/* Floating coffee beans background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-amber-800 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative inline-block mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full blur-xl opacity-40"></div>
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-green-300 shadow-lg">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent">
            {analysis.ui_copy.title}
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {analysis.ui_copy.tagline}
          </p>
          
          {/* Unclickable Hero-style Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="group relative overflow-hidden rounded-3xl border-2 border-amber-600/60 bg-white/20 backdrop-blur-lg px-8 py-4 cursor-not-allowed opacity-80">
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-200/20 via-transparent to-orange-200/20" />
              
              {/* Text content with icon */}
              <span className="relative z-10 flex items-center gap-3 font-bold text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-bold text-lg">
                  Analisis Selesai
                </span>
              </span>
            </div>
          </motion.div>
          
        </motion.div>
      </div>

      {/* Enhanced Price Estimate with CometCard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex justify-center mb-16" // Added larger bottom margin to account for shadow
      >
        <CometCard className="w-full max-w-2xl relative z-10"> {/* Added z-index */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8 rounded-[20px] space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-200 to-orange-300 rounded-xl shadow-lg">
                <TrendingUp className="h-8 w-8 text-amber-800" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                  Estimasi Harga Premium
                </h3>
                <p className="text-amber-700 font-medium">Berdasarkan Analisis AI</p>
              </div>
            </div>
            
            {/* Price Display */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-amber-900">
                    {formatCurrency(analysis.price_estimate_idr.price)}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full border border-amber-300">
                  <Coffee className="h-4 w-4 text-amber-700" />
                  <span className="text-amber-800 font-semibold">per kilogram</span>
                </div>
              </div>
            </div>
            
            {/* Confidence & Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-xl p-4 border border-amber-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-amber-800">Tingkat Kepercayaan</span>
                </div>
                <div className="text-2xl font-bold text-amber-900">
                  {Math.round(analysis.price_estimate_idr.confidence * 100)}%
                </div>
              </div>
              
              {analysis.price_estimate_idr.factors.length > 0 && (
                <div className="bg-white/50 rounded-xl p-4 border border-amber-200/30">
                  <p className="text-sm font-medium text-amber-800 mb-3">Faktor Penentu:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.price_estimate_idr.factors.slice(0, 3).map((factor, index) => (
                      <Badge 
                        key={index} 
                        className="bg-amber-200 text-amber-800 hover:bg-amber-300 text-xs border-amber-300"
                      >
                        {factor}
                      </Badge>
                    ))}
                    {analysis.price_estimate_idr.factors.length > 3 && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        +{analysis.price_estimate_idr.factors.length - 3} lagi
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* CTA Message */}
            <motion.div 
              className="text-center p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-200"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <p className="text-sm text-amber-800 font-medium">
                💎 Harga premium untuk kualitas ampas kopi Anda
              </p>
            </motion.div>
          </div>
        </CometCard>
      </motion.div>

      {/* Enhanced Suitability Scores */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-20 mt-8" // Added z-index and top margin
      >
        <Card className="border-amber-200/60 bg-gradient-to-br from-white to-amber-50/30 shadow-xl">
          <CardHeader className="pb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-md">
                  <Factory className="h-7 w-7 text-blue-800" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent font-bold">
                    Kesesuaian Produk
                  </span>
                  <p className="text-sm text-blue-700 font-normal mt-1">Potensi pengolahan ampas kopi</p>
                </div>
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(analysis.suitability).map(([key, value], index) => {
                const Icon = suitabilityIcons[key as keyof typeof suitabilityIcons];
                const label = suitabilityTranslations[key as keyof typeof suitabilityTranslations];
                
                return (
                  <motion.div 
                    key={key} 
                    className="group p-5 rounded-xl border-2 border-stone-200/60 bg-gradient-to-br from-white to-stone-50/50 hover:shadow-lg hover:border-stone-300/80 transition-all duration-300 hover:-translate-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg group-hover:from-amber-100 group-hover:to-amber-200 transition-all duration-300">
                          <Icon className="h-5 w-5 text-stone-700 group-hover:text-amber-800 transition-colors duration-300" />
                        </div>
                        <span className="font-semibold text-stone-900 group-hover:text-amber-900 transition-colors duration-300">
                          {label}
                        </span>
                      </div>
                      <Badge 
                        variant={getScoreBadgeVariant(value.score)} 
                        className={`text-sm font-bold px-3 py-1 ${getScoreColor(value.score)} transition-all duration-300 group-hover:scale-110`}
                      >
                        {value.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed group-hover:text-stone-700 transition-colors duration-300">
                      {value.why}
                    </p>
                    
                    {/* Progress bar */}
                    <div className="mt-3 w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className={`h-2 rounded-full ${
                          value.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          value.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          value.score >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value.score}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Eco Impact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <Card className="border-2 border-green-300/60 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/40 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/40 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardHeader className="pb-6 relative z-10">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 bg-gradient-to-br from-green-200 to-emerald-300 rounded-xl shadow-md">
                  <Leaf className="h-7 w-7 text-green-800" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-green-900 to-emerald-800 bg-clip-text text-transparent font-bold">
                    Dampak Lingkungan
                  </span>
                  <p className="text-sm text-green-700 font-normal mt-1">Kontribusi positif untuk bumi</p>
                </div>
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <p className="text-sm text-green-700 font-medium mb-2">Sikupi Score</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <motion.span 
                    className="text-5xl font-bold bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", bounce: 0.4 }}
                  >
                    {analysis.eco.sikupi_score}
                  </motion.span>
                  <span className="text-green-700 text-xl font-semibold">/100</span>
                </div>
                
                {/* Score visualization */}
                <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.eco.sikupi_score}%` }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-green-800 bg-green-100 px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  <span className="font-medium">
                    {analysis.eco.sikupi_score >= 80 ? 'Excellent' :
                     analysis.eco.sikupi_score >= 60 ? 'Very Good' :
                     analysis.eco.sikupi_score >= 40 ? 'Good' : 'Fair'}
                  </span>
                </div>
              </motion.div>
              
              <motion.div
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <p className="text-sm text-green-700 font-medium mb-2">CO₂ Tersimpan</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <motion.span 
                    className="text-5xl font-bold bg-gradient-to-r from-emerald-800 to-green-800 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", bounce: 0.4 }}
                  >
                    {analysis.eco.co2_saved_kg.toFixed(1)}
                  </motion.span>
                  <span className="text-green-700 text-xl font-semibold">kg</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-green-800">
                  <span className="text-2xl">🌱</span>
                  <span className="bg-green-100 px-3 py-1 rounded-full font-medium">
                    Setara {Math.round(analysis.eco.co2_saved_kg * 0.5)} pohon
                  </span>
                </div>
              </motion.div>
            </div>

            {analysis.eco.badges.length > 0 && (
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-sm text-green-800 font-medium mb-3">🏆 Pencapaian Lingkungan</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {analysis.eco.badges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 + index * 0.1, type: "spring", bounce: 0.4 }}
                    >
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 hover:from-green-200 hover:to-emerald-200 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                        {badge}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Processing Plan */}
      {analysis.process_plan.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Card className="border-purple-200/60 bg-gradient-to-br from-white to-purple-50/30 shadow-xl">
            <CardHeader className="pb-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl shadow-md">
                    <Package2 className="h-7 w-7 text-purple-800" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-900 to-violet-800 bg-clip-text text-transparent font-bold">
                      Rekomendasi Proses
                    </span>
                    <p className="text-sm text-purple-700 font-normal mt-1">Langkah-langkah pengolahan optimal</p>
                  </div>
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.process_plan.map((step, index) => (
                  <motion.div
                    key={index}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/50 border border-purple-100/50 hover:shadow-lg hover:border-purple-200/80 transition-all duration-300 hover:-translate-y-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-200 to-violet-300 text-purple-800 rounded-full flex items-center justify-center text-lg font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, type: "spring", bounce: 0.4 }}
                    >
                      {index + 1}
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-stone-800 leading-relaxed group-hover:text-purple-900 transition-colors duration-300 font-medium">
                        {step}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Progress indicator */}
              <motion.div 
                className="mt-6 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + analysis.process_plan.length * 0.1 }}
              >
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-800 px-4 py-2 rounded-full border border-purple-200 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>{analysis.process_plan.length} langkah untuk hasil optimal</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Red Flags */}
      {analysis.red_flags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Card className="border-2 border-red-300/60 bg-gradient-to-br from-red-50 via-orange-50 to-red-100 shadow-xl relative overflow-hidden">
            {/* Warning background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 text-4xl text-red-600">⚠️</div>
              <div className="absolute bottom-4 left-4 text-3xl text-orange-600">🚨</div>
            </div>
            
            <CardHeader className="pb-6 relative z-10">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <motion.div 
                    className="p-3 bg-gradient-to-br from-red-200 to-orange-300 rounded-xl shadow-md"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <AlertTriangle className="h-7 w-7 text-red-800" />
                  </motion.div>
                  <div>
                    <span className="bg-gradient-to-r from-red-900 to-orange-800 bg-clip-text text-transparent font-bold">
                      Peringatan Penting
                    </span>
                    <p className="text-sm text-red-700 font-normal mt-1">Hal-hal yang perlu diperhatikan</p>
                  </div>
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {analysis.red_flags.map((flag, index) => (
                  <motion.div
                    key={index}
                    className="group flex items-start gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-red-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="flex-shrink-0 w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-sm font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1, type: "spring", bounce: 0.4 }}
                    >
                      !
                    </motion.div>
                    <p className="text-red-800 leading-relaxed font-medium flex-1">
                      {flag}
                    </p>
                  </motion.div>
                ))}
              </div>
              
              {/* Advisory note */}
              <motion.div 
                className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + analysis.red_flags.length * 0.1 }}
              >
                <p className="text-sm text-orange-800 font-medium">
                  💡 Peringatan ini membantu Anda memahami kondisi ampas kopi untuk pengolahan yang lebih baik
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Vision Findings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <Card className="border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30 shadow-xl">
          <CardHeader className="pb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-md">
                  <Sparkles className="h-7 w-7 text-blue-800" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent font-bold">
                    Analisis Visual AI
                  </span>
                  <p className="text-sm text-blue-700 font-normal mt-1">Deteksi karakteristik visual ampas</p>
                </div>
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Kelembaban */}
              <motion.div
                className="group text-center p-5 bg-gradient-to-br from-white to-blue-50/50 rounded-xl border border-blue-100/50 hover:shadow-lg hover:border-blue-200/80 transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-blue-700 font-medium mb-2">Kelembaban</p>
                <span className="font-bold text-lg text-blue-900 capitalize block">
                  {analysis.vision_findings.moisture_visual}
                </span>
              </motion.div>

              {/* Ukuran Partikel */}
              <motion.div
                className="group text-center p-5 bg-gradient-to-br from-white to-amber-50/50 rounded-xl border border-amber-100/50 hover:shadow-lg hover:border-amber-200/80 transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-amber-100 rounded-full group-hover:bg-amber-200 transition-colors duration-300">
                    <Package2 className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-amber-700 font-medium mb-2">Ukuran Partikel</p>
                <span className="font-bold text-lg text-amber-900 capitalize block">
                  {analysis.vision_findings.particle_size}
                </span>
              </motion.div>

              {/* Status Jamur */}
              <motion.div
                className={`group text-center p-5 rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  analysis.vision_findings.mold_suspect 
                    ? 'bg-gradient-to-br from-white to-red-50/50 border-red-100/50 hover:border-red-200/80' 
                    : 'bg-gradient-to-br from-white to-green-50/50 border-green-100/50 hover:border-green-200/80'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className={`p-3 rounded-full transition-colors duration-300 ${
                    analysis.vision_findings.mold_suspect 
                      ? 'bg-red-100 group-hover:bg-red-200' 
                      : 'bg-green-100 group-hover:bg-green-200'
                  }`}>
                    {analysis.vision_findings.mold_suspect ? (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </div>
                <p className={`text-sm font-medium mb-2 ${
                  analysis.vision_findings.mold_suspect ? 'text-red-700' : 'text-green-700'
                }`}>Deteksi Jamur</p>
                <span className={`font-bold text-lg block ${
                  analysis.vision_findings.mold_suspect ? 'text-red-900' : 'text-green-900'
                }`}>
                  {analysis.vision_findings.mold_suspect ? 'Terdeteksi' : 'Bersih'}
                </span>
              </motion.div>

              {/* Kontaminan */}
              <motion.div
                className="group text-center p-5 bg-gradient-to-br from-white to-stone-50/50 rounded-xl border border-stone-100/50 hover:shadow-lg hover:border-stone-200/80 transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-stone-100 rounded-full group-hover:bg-stone-200 transition-colors duration-300">
                    <Sparkles className="h-6 w-6 text-stone-600" />
                  </div>
                </div>
                <p className="text-sm text-stone-700 font-medium mb-2">Kontaminan</p>
                <span className="font-bold text-lg text-stone-900 block">
                  {analysis.vision_findings.contaminants.length > 0 
                    ? `${analysis.vision_findings.contaminants.length} jenis`
                    : 'Tidak ada'
                  }
                </span>
                {analysis.vision_findings.contaminants.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {analysis.vision_findings.contaminants.slice(0, 2).map((contaminant, i) => (
                      <Badge key={i} className="text-xs bg-stone-200 text-stone-700">
                        {contaminant}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex flex-col sm:flex-row gap-6 pt-8"
      >
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onAnalyzeAnother}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg"
          >
            <RotateCcw className="h-5 w-5 mr-3" />
            Analisis Ampas Lain
          </Button>
        </motion.div>
        
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg bg-white/80 backdrop-blur-sm"
          >
            <CheckCircle className="h-5 w-5 mr-3" />
            Screenshot & Kirim
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Call-to-action message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pt-4"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-3 rounded-xl shadow-sm">
          <span className="text-lg">📱</span>
          <p className="text-sm font-medium">
            Screenshot hasil ini dan kirim ke admin Sikupi untuk jaminan pembelian!
          </p>
        </div>
      </motion.div>

      {/* Enhanced Analysis Meta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center pt-6 space-y-3"
      >
        <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-stone-600 font-medium">
              {analysis.meta.model.toUpperCase()}
            </span>
          </div>
          <div className="w-px h-4 bg-stone-300"></div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-stone-600 font-medium">
              {analysis.meta.latency_ms}ms
            </span>
          </div>
          <div className="w-px h-4 bg-stone-300"></div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-xs text-stone-600 font-medium">Verified</span>
          </div>
        </div>
        
        {analysis.meta.image_quality_note && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 text-xs font-medium"
          >
            <span className="text-sm">📸</span>
            {analysis.meta.image_quality_note}
          </motion.div>
        )}
        
        <motion.p 
          className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Analisis ini menggunakan teknologi AI terdepan untuk memberikan estimasi akurat berdasarkan karakteristik visual ampas kopi Anda.
        </motion.p>
      </motion.div>
        </motion.div>
      </div>
    </NeonGradientCard>
  );
}