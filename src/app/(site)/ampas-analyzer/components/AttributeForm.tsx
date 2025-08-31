"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Layers, Droplets, Sun, Sparkles, Package2, MoreHorizontal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { coffeeTypeTranslations, grindLevelTranslations, conditionTranslations } from '@/lib/schemas/ampas-analyzer';
import type { CoffeeType, GrindLevel, Condition } from '@/types/database';

interface AttributeFormProps {
  coffeeType: CoffeeType | undefined;
  grindLevel: GrindLevel | undefined;
  condition: Condition | undefined;
  onCoffeeTypeChange: (value: CoffeeType) => void;
  onGrindLevelChange: (value: GrindLevel) => void;
  onConditionChange: (value: Condition) => void;
}

// Icon mappings
const coffeeTypeIcons = {
  arabika: Coffee,
  robusta: Coffee, 
  mix: Layers,
  unknown: MoreHorizontal,
};

const grindLevelIcons = {
  halus: Sparkles,
  sedang: Package2,
  kasar: MoreHorizontal,
  unknown: MoreHorizontal,
};

const conditionIcons = {
  basah: Droplets,
  kering: Sun,
  unknown: MoreHorizontal,
};

interface RadioGroupProps<T extends string> {
  label: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: readonly T[];
  translations: Record<T, string>;
  icons: Record<T, React.ComponentType<{ className?: string }>>;
  name: string;
}

function RadioGroup<T extends string>({ 
  label, 
  value, 
  onChange, 
  options, 
  translations, 
  icons, 
  name 
}: RadioGroupProps<T>) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold text-gray-900">{label}</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.filter(option => option !== 'unknown').map((option) => {
          const Icon = icons[option];
          const isSelected = value === option;
          
          return (
            <Card 
              key={option}
              className={`
                relative transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'border-gray-800 bg-gray-50 shadow-md ring-2 ring-gray-800 ring-opacity-20' 
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }
              `}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange(option)}
                className="w-full h-full p-4 flex flex-col items-center space-y-3 hover:bg-transparent"
              >
                <div className={`
                  p-3 rounded-lg transition-colors duration-200
                  ${isSelected 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-gray-50 text-gray-600'
                  }
                `}>
                  {React.createElement(Icon, { className: "h-5 w-5" })}
                </div>
                
                <span className={`
                  text-sm font-medium text-center
                  ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                `}>
                  {translations[option]}
                </span>
              </Button>

              {isSelected && (
                <motion.div
                  layoutId={`selection-${name}`}
                  className="absolute inset-0 rounded-lg border-2 border-gray-800 bg-gray-800/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function AttributeForm({ 
  coffeeType, 
  grindLevel, 
  condition,
  onCoffeeTypeChange,
  onGrindLevelChange,
  onConditionChange
}: AttributeFormProps) {
  const coffeeTypes = ['arabika', 'robusta', 'mix'] as const;
  const grindLevels = ['halus', 'sedang', 'kasar'] as const;
  const conditions = ['basah', 'kering'] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4"
        >
          <Coffee className="h-8 w-8 text-gray-700" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900">Karakteristik Ampas Kopi</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Pilih karakteristik ampas kopi Anda untuk analisis yang lebih akurat
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        <RadioGroup
          label="Jenis Kopi"
          value={coffeeType}
          onChange={onCoffeeTypeChange}
          options={coffeeTypes}
          translations={coffeeTypeTranslations}
          icons={coffeeTypeIcons}
          name="coffee-type"
        />

        <RadioGroup
          label="Tingkat Kehalusan"
          value={grindLevel}
          onChange={onGrindLevelChange}
          options={grindLevels}
          translations={grindLevelTranslations}
          icons={grindLevelIcons}
          name="grind-level"
        />

        <RadioGroup
          label="Kondisi Ampas"
          value={condition}
          onChange={onConditionChange}
          options={conditions}
          translations={conditionTranslations}
          icons={conditionIcons}
          name="condition"
        />
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center pt-4">
        <div className="flex items-center space-x-2">
          {[coffeeType, grindLevel, condition].map((value, index) => (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${value 
                  ? 'bg-gray-800 scale-110' 
                  : 'bg-gray-200'
                }
              `}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}