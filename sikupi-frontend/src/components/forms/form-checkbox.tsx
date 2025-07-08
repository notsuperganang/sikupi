import { forwardRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

const FormCheckbox = forwardRef<HTMLButtonElement, FormCheckboxProps>(
  ({ 
    label, 
    error, 
    description, 
    required, 
    checked,
    onCheckedChange,
    disabled,
    className,
    id,
    children,
    ...props 
  }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            ref={ref}
            id={inputId}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={cn(
              "mt-0.5",
              error && "border-destructive data-[state=checked]:bg-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : 
              description ? `${inputId}-description` : 
              undefined
            }
            {...props}
          />
          
          <div className="flex-1 space-y-1">
            {(label || children) && (
              <Label 
                htmlFor={inputId} 
                className={cn(
                  "text-sm font-medium text-foreground cursor-pointer leading-relaxed",
                  required && "after:content-['*'] after:text-destructive after:ml-1",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {children || label}
              </Label>
            )}

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
        </div>
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

export { FormCheckbox };