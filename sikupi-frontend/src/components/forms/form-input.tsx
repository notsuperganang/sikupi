"use client";

import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, description, error, required, showPasswordToggle, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [fieldType, setFieldType] = useState(type);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
      setFieldType(showPassword ? "password" : "text");
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            type={showPasswordToggle ? fieldType : type}
            className={cn(
              "w-full",
              error && "border-destructive focus-visible:ring-destructive",
              showPasswordToggle && "pr-10",
              className
            )}
            {...props}
          />
          {showPasswordToggle && type === "password" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
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

FormInput.displayName = "FormInput";