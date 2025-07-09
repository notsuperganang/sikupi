"use client";

import { forwardRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const FormCheckbox = forwardRef<HTMLButtonElement, FormCheckboxProps>(
  ({ 
    label, 
    description, 
    error, 
    required, 
    checked,
    onCheckedChange,
    className,
    disabled,
    id
  }, ref) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={id}
            ref={ref}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={cn(
              error && "border-destructive focus:ring-destructive",
              className
            )}
          />
          {label && (
            <Label 
              htmlFor={id}
              className={cn(
                "text-sm font-medium cursor-pointer",
                disabled && "cursor-not-allowed opacity-70"
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground pl-6">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive pl-6">{error}</p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";