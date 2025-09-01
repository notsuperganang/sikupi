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
  // Color schemes for different form sections
  const getColorScheme = (name: string) => {
    switch (name) {
      case 'coffee-type':
        return {
          selected: 'border-amber-600 bg-gradient-to-br from-amber-50 to-orange-100 shadow-lg ring-2 ring-amber-600/30',
          unselected: 'border-amber-200/60 hover:border-amber-300 bg-gradient-to-br from-white to-amber-50/50 hover:shadow-md',
          iconSelected: 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800',
          iconUnselected: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700',
          textSelected: 'text-amber-900',
          textUnselected: 'text-amber-800',
          ring: 'ring-amber-600/20'
        };
      case 'grind-level':
        return {
          selected: 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg ring-2 ring-blue-600/30',
          unselected: 'border-blue-200/60 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/50 hover:shadow-md',
          iconSelected: 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-800',
          iconUnselected: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700',
          textSelected: 'text-blue-900',
          textUnselected: 'text-blue-800',
          ring: 'ring-blue-600/20'
        };
      case 'condition':
        return {
          selected: 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg ring-2 ring-green-600/30',
          unselected: 'border-green-200/60 hover:border-green-300 bg-gradient-to-br from-white to-green-50/50 hover:shadow-md',
          iconSelected: 'bg-gradient-to-br from-green-200 to-green-300 text-green-800',
          iconUnselected: 'bg-gradient-to-br from-green-100 to-green-200 text-green-700',
          textSelected: 'text-green-900',
          textUnselected: 'text-green-800',
          ring: 'ring-green-600/20'
        };
      default:
        return {
          selected: 'border-stone-600 bg-gradient-to-br from-stone-50 to-stone-100 shadow-lg ring-2 ring-stone-600/30',
          unselected: 'border-stone-200/60 hover:border-stone-300 bg-gradient-to-br from-white to-stone-50/50 hover:shadow-md',
          iconSelected: 'bg-gradient-to-br from-stone-200 to-stone-300 text-stone-800',
          iconUnselected: 'bg-gradient-to-br from-stone-100 to-stone-200 text-stone-700',
          textSelected: 'text-stone-900',
          textUnselected: 'text-stone-800',
          ring: 'ring-stone-600/20'
        };
    }
  };

  const colors = getColorScheme(name);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border border-amber-300">
          <Coffee className="h-6 w-6 text-amber-700" />
        </div>
        <div>
          <Label className="text-lg font-bold text-stone-900">{label}</Label>
          <p className="text-sm text-stone-600">Pilih yang sesuai dengan ampas kopi Anda</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.filter(option => option !== 'unknown').map((option, index) => {
          const Icon = icons[option];
          const isSelected = value === option;
          
          return (
            <motion.div
              key={option}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`
                  relative transition-all duration-300 cursor-pointer hover:shadow-lg
                  ${isSelected ? colors.selected : colors.unselected}
                `}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onChange(option)}
                  className="w-full h-full p-6 flex flex-col items-center space-y-4 hover:bg-transparent group"
                >
                  <motion.div 
                    className={`
                      p-4 rounded-xl transition-all duration-300
                      ${isSelected ? colors.iconSelected : colors.iconUnselected}
                    `}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -2, 2, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    {React.createElement(Icon, { className: "h-7 w-7" })}
                  </motion.div>
                  
                  <span className={`
                    text-base font-semibold text-center transition-colors duration-200
                    ${isSelected ? colors.textSelected : colors.textUnselected}
                  `}>
                    {translations[option]}
                  </span>
                </Button>

                {isSelected && (
                  <motion.div
                    layoutId={`selection-${name}`}
                    className={`absolute inset-0 rounded-lg ${colors.ring}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
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
      className="space-y-12"
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
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full blur-xl opacity-30"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-amber-300 shadow-lg">
            <Coffee className="h-12 w-12 text-amber-800" />
          </div>
        </motion.div>
        
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent">
            Karakteristik Ampas Kopi
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Pilih karakteristik ampas kopi Anda untuk analisis yang lebih akurat dan mendapatkan estimasi harga terbaik
          </p>
          
          {/* Status indicators - fixed centering */}
          <motion.div 
            className="flex justify-center items-center gap-2 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex flex-wrap justify-center items-center gap-2">
              {[
                { label: 'Jenis', value: coffeeType, activeClass: 'bg-amber-100 text-amber-800 border-amber-300', dotClass: 'bg-amber-500' },
                { label: 'Gilingan', value: grindLevel, activeClass: 'bg-blue-100 text-blue-800 border-blue-300', dotClass: 'bg-blue-500' },
                { label: 'Kondisi', value: condition, activeClass: 'bg-green-100 text-green-800 border-green-300', dotClass: 'bg-green-500' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border
                    ${item.value 
                      ? item.activeClass
                      : 'bg-stone-100 text-stone-500 border-stone-200'
                    }
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${item.value 
                      ? item.dotClass
                      : 'bg-stone-300'
                    }
                  `} />
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Form Fields with better spacing */}
      <div className="space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <RadioGroup
            label="Jenis Kopi"
            value={coffeeType}
            onChange={onCoffeeTypeChange}
            options={coffeeTypes}
            translations={coffeeTypeTranslations}
            icons={coffeeTypeIcons}
            name="coffee-type"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <RadioGroup
            label="Tingkat Kehalusan"
            value={grindLevel}
            onChange={onGrindLevelChange}
            options={grindLevels}
            translations={grindLevelTranslations}
            icons={grindLevelIcons}
            name="grind-level"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <RadioGroup
            label="Kondisi Ampas"
            value={condition}
            onChange={onConditionChange}
            options={conditions}
            translations={conditionTranslations}
            icons={conditionIcons}
            name="condition"
          />
        </motion.div>
      </div>

      {/* Enhanced Progress Indicator */}
      <motion.div 
        className="flex flex-col items-center space-y-4 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <div className="flex items-center space-x-3">
          {[coffeeType, grindLevel, condition].map((value, index) => (
            <motion.div
              key={index}
              className={`
                w-4 h-4 rounded-full transition-all duration-500 flex items-center justify-center
                ${value 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg scale-125' 
                  : 'bg-stone-200 border-2 border-stone-300'
                }
              `}
              initial={{ scale: 0 }}
              animate={{ scale: value ? 1.25 : 1 }}
              transition={{ 
                type: "spring", 
                bounce: 0.5,
                delay: 1.5 + index * 0.1 
              }}
            >
              {value && (
                <motion.div 
                  className="w-1.5 h-1.5 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                />
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700">
            {[coffeeType, grindLevel, condition].filter(Boolean).length} dari 3 karakteristik dipilih
          </p>
          <div className="w-full max-w-xs mx-auto mt-2 bg-stone-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${([coffeeType, grindLevel, condition].filter(Boolean).length / 3) * 100}%` 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}