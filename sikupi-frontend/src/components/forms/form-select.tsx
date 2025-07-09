"use client";

import { forwardRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormSelectProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ 
    label, 
    description, 
    error, 
    required, 
    placeholder = "Pilih...",
    options,
    value,
    onValueChange,
    className,
    disabled
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Select 
          value={value} 
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger 
            ref={ref}
            className={cn(
              "w-full",
              error && "border-destructive focus:ring-destructive",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";