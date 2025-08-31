"use client";
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { FileUpload } from '@/components/ui/file-upload';
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4"
              >
                <Upload className="h-8 w-8 text-gray-700" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900">Upload Gambar Ampas</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Upload foto ampas kopi Anda untuk dianalisis. Pastikan gambar jelas dan pencahayaan cukup.
              </p>
            </div>

            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <div className="max-w-2xl mx-auto">
                  <FileUpload
                    onChange={(files) => field.onChange(files)}
                  />
                </div>
              )}
            />

            {errors.images && (
              <p className="text-red-600 text-sm text-center">{errors.images.message}</p>
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center pt-8"
      >
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 'attributes'}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex space-x-2">
          {['attributes', 'images'].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentStep === step
                  ? 'bg-gray-800 scale-110'
                  : index < ['attributes', 'images'].indexOf(currentStep)
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNextStep}
          disabled={
            (currentStep === 'attributes' && !attributesComplete) ||
            (currentStep === 'images' && !imagesComplete)
          }
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          {currentStep === 'images' ? (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Analisis
            </>
          ) : (
            <>
              Lanjut
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
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
            <AmpasHeroSection />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="backdrop-blur-sm shadow-xl border-stone-200/50 bg-white/90">
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {renderStepNavigation()}
              </div>
            </Card>
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