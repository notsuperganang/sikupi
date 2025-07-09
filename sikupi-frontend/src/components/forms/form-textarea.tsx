"use client";

import { forwardRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ 
    label, 
    description, 
    error, 
    required, 
    showCharacterCount, 
    maxLength, 
    className, 
    value,
    defaultValue,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = useState(
      (value || defaultValue || "").toString().length
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          className={cn(
            "w-full",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {showCharacterCount && maxLength && (
          <div className="flex justify-end">
            <span className={cn(
              "text-sm",
              charCount > maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"
            )}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}
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

FormTextarea.displayName = "FormTextarea";