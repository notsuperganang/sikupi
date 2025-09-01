"use client";
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { CameraFileUpload } from '@/components/ui/camera-file-upload';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { useToast } from '@/lib/toast-context';
import { AmpasHeroSection } from './components/AmpasHeroSection';
import { AttributeForm } from './components/AttributeForm';
import { AnalysisResults } from './components/AnalysisResults';
import { 
  AmpasAnalyzerFormSchema, 
  analysisLoadingStates,
  type AmpasAnalyzerFormData 
} from '@/lib/schemas/ampas-analyzer';
import type { AmpasAnalysis } from '@/lib/schemas/analyzer';
import type { CoffeeType, GrindLevel, Condition } from '@/types/database';

type Step = 'attributes' | 'images' | 'analysis' | 'results';

export default function AmpasAnalyzerPage() {
  const [currentStep, setCurrentStep] = useState<Step>('attributes');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AmpasAnalysis | null>(null);
  const { toast } = useToast();

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset
  } = useForm<AmpasAnalyzerFormData>({
    resolver: zodResolver(AmpasAnalyzerFormSchema),
    defaultValues: {
      jenis_kopi: undefined,
      grind_level: undefined,
      condition: undefined,
      images: []
    }
  });

  const watchedValues = watch();
  const attributesComplete = watchedValues.jenis_kopi && watchedValues.grind_level && watchedValues.condition;
  const imagesComplete = watchedValues.images && watchedValues.images.length > 0;

  const handleNextStep = async () => {
    if (currentStep === 'attributes') {
      const isValid = await trigger(['jenis_kopi', 'grind_level', 'condition']);
      if (isValid && attributesComplete) {
        setCurrentStep('images');
      } else {
        toast.error('Lengkapi Data', 'Silakan pilih semua karakteristik ampas kopi terlebih dahulu');
      }
    } else if (currentStep === 'images') {
      const isValid = await trigger(['images']);
      if (isValid && imagesComplete) {
        handleAnalyze();
      } else {
        toast.error('Upload Gambar', 'Silakan upload minimal 1 gambar ampas kopi');
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'images') {
      setCurrentStep('attributes');
    } else if (currentStep === 'results') {
      setCurrentStep('images');
    }
  };

  const handleAnalyze = async () => {
    try {
      setCurrentStep('analysis');
      setIsAnalyzing(true);

      // Create FormData for API submission
      const formData = new FormData();
      formData.append('jenis_kopi', watchedValues.jenis_kopi!);
      formData.append('grind_level', watchedValues.grind_level!);
      formData.append('condition', watchedValues.condition!);
      
      // Add first image (API currently supports single image)
      if (watchedValues.images && watchedValues.images[0]) {
        formData.append('image', watchedValues.images[0]);
      }

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analisis gagal');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setCurrentStep('results');
        toast.success('Analisis Selesai', 'Ampas kopi Anda berhasil dianalisis!');
      } else {
        throw new Error('Format respons tidak valid');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(
        'Analisis Gagal', 
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menganalisis ampas kopi'
      );
      setCurrentStep('images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setCurrentStep('attributes');
    setAnalysisResult(null);
    reset();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'attributes':
        return (
          <Controller
            control={control}
            name="jenis_kopi"
            render={({ field }) => (
              <AttributeForm
                coffeeType={field.value}
                grindLevel={watchedValues.grind_level}
                condition={watchedValues.condition}
                onCoffeeTypeChange={(value: CoffeeType) => {
                  field.onChange(value);
                  setValue('jenis_kopi', value);
                }}
                onGrindLevelChange={(value: GrindLevel) => setValue('grind_level', value)}
                onConditionChange={(value: Condition) => setValue('condition', value)}
              />
            )}
          />
        );

      case 'images':
        return (
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Header */}
            <div className="text-center space-y-6">
              <motion.div 
                className="relative inline-block mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full blur-xl opacity-30"></div>
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-300 shadow-lg">
                  <Upload className="h-12 w-12 text-blue-800" />
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 bg-clip-text text-transparent">
                  Upload Gambar Ampas Kopi
                </h2>
                <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  Upload foto ampas kopi Anda dengan pencahayaan yang baik untuk mendapatkan analisis yang akurat
                </p>
                
                {/* Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
                  {[
                    { icon: "📸", title: "Pencahayaan Baik", desc: "Pastikan foto terang dan jelas" },
                    { icon: "🎯", title: "Fokus Tajam", desc: "Ampas kopi terlihat detail" },
                    { icon: "📐", title: "Jarak Ideal", desc: "Foto dari jarak 20-30 cm" }
                  ].map((tip, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-blue-50/80 rounded-xl p-4 border border-blue-200/50 hover:bg-blue-100/80 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="text-2xl mb-2">{tip.icon}</div>
                      <h4 className="font-semibold text-blue-900 text-sm">{tip.title}</h4>
                      <p className="text-blue-700 text-xs">{tip.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <div className="max-w-3xl mx-auto">
                    <CameraFileUpload
                      onChange={(files) => field.onChange(files)}
                    />
                  </div>
                )}
              />
            </motion.div>

            {errors.images && (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 inline-block">
                  {errors.images.message}
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'results':
        return analysisResult ? (
          <AnalysisResults 
            analysis={analysisResult}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        ) : null;

      default:
        return null;
    }
  };

  const renderStepNavigation = () => {
    if (currentStep === 'analysis' || currentStep === 'results') {
      return null;
    }

    return (
      <motion.div 
        className="flex justify-between items-center pt-12 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 'attributes'}
            className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 px-6 py-3 rounded-xl shadow-sm disabled:opacity-50 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali
          </Button>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-stone-200/50 shadow-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {['attributes', 'images'].map((step, index) => {
            const stepIndex = ['attributes', 'images'].indexOf(currentStep);
            const isActive = currentStep === step;
            const isCompleted = index < stepIndex;
            
            return (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 scale-125 shadow-lg'
                      : isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 scale-110'
                        : 'bg-stone-200 border-2 border-stone-300'
                  }`}
                  animate={{ 
                    scale: isActive ? 1.25 : isCompleted ? 1.1 : 1 
                  }}
                  transition={{ type: "spring", bounce: 0.3 }}
                >
                  {isCompleted && (
                    <motion.div 
                      className="w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    />
                  )}
                  {isActive && (
                    <motion.div 
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={`ml-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-amber-800' : isCompleted ? 'text-green-800' : 'text-stone-500'
                }`}>
                  {step === 'attributes' ? 'Karakteristik' : 'Upload Gambar'}
                </span>
                {index < ['attributes', 'images'].length - 1 && (
                  <div className="w-8 h-px bg-stone-300 mx-3" />
                )}
              </div>
            );
          })}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleNextStep}
            disabled={
              (currentStep === 'attributes' && !attributesComplete) ||
              (currentStep === 'images' && !imagesComplete)
            }
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {currentStep === 'images' ? (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Analisis Sekarang
              </>
            ) : (
              <>
                Lanjut ke Upload
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-yellow-50/40">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Animated Background Ripple Effect */}
        <div className="absolute inset-0 z-0">
          <BackgroundRippleEffect 
            rows={8}
            cols={27}
            cellSize={56}
            borderColor="rgba(217, 119, 6, 0.4)"
            fillColor="rgba(245, 158, 11, 0.25)"
            shadowColor="rgba(154, 52, 18, 0.5)"
            activeColor="rgba(217, 119, 6, 0.6)"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-stone-50/30 to-stone-50/60 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <AmpasHeroSection disableCTA={currentStep === 'results'} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced card with decorative elements */}
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-2xl"></div>
                <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full blur-3xl"></div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="backdrop-blur-sm shadow-2xl border-amber-200/30 bg-gradient-to-br from-white/95 to-amber-50/20 relative overflow-hidden hover:shadow-3xl transition-shadow duration-500">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                  </div>
                  
                  <div className="relative p-8 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        {renderStepContent()}
                      </motion.div>
                    </AnimatePresence>

                    {renderStepNavigation()}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi Step Loader */}
      <MultiStepLoader
        loadingStates={analysisLoadingStates}
        loading={isAnalyzing}
        duration={1500}
        loop={false}
      />
    </main>
  );
}