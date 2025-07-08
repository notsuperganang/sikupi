import { forwardRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    description, 
    required, 
    showCharacterCount,
    maxLength,
    id,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = useState(
      typeof value === "string" ? value.length : 0
    );
    
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={inputId} 
            className={cn(
              "text-sm font-medium text-foreground",
              required && "after:content-['*'] after:text-destructive after:ml-1"
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          <Textarea
            ref={ref}
            id={inputId}
            className={cn(
              "w-full resize-vertical",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : 
              description ? `${inputId}-description` : 
              undefined
            }
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            {description && !error && (
              <p 
                id={`${inputId}-description`}
                className="text-sm text-muted-foreground"
              >
                {description}
              </p>
            )}

            {error && (
              <p 
                id={`${inputId}-error`}
                className="text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {showCharacterCount && maxLength && (
            <div className="text-sm text-muted-foreground ml-2">
              <span className={cn(
                charCount > maxLength && "text-destructive"
              )}>
                {charCount}
              </span>
              /{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };