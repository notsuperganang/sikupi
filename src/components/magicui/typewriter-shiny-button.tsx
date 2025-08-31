"use client";

import { useState, useEffect } from "react";
import { AnimatedShinyText } from "./animated-shiny-text";
import { cn } from "@/lib/utils";
import { Coffee, Brain, Zap, TrendingUp } from "lucide-react";

interface TypewriterShinyButtonProps {
  texts: string[];
  className?: string;
  buttonClassName?: string;
  onClick?: () => void;
  href?: string;
  children?: React.ReactNode;
}

export function TypewriterShinyButton({ 
  texts, 
  className, 
  buttonClassName,
  onClick,
  href,
  children 
}: TypewriterShinyButtonProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Icons for each text
  const icons = [Coffee, Brain, TrendingUp, Zap];
  const CurrentIcon = icons[currentTextIndex];

  useEffect(() => {
    const text = texts[currentTextIndex];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (currentText.length < text.length) {
        timeoutId = setTimeout(() => {
          setCurrentText(text.slice(0, currentText.length + 1));
        }, 100); // Typing speed
      } else {
        // Wait before starting to delete
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause at end
      }
    } else {
      if (currentText.length > 0) {
        timeoutId = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50); // Deleting speed
      } else {
        // Move to next text
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [currentText, currentTextIndex, isTyping, texts]);

  const ButtonWrapper = href ? "a" : "button";

  return (
    <ButtonWrapper
      href={href}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl border-2 border-amber-600/60 bg-white/20 backdrop-blur-lg px-8 py-4 transition-all duration-500",
        "hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-500",
        "hover:bg-white/30 backdrop-saturate-150",
        "focus:outline-none focus:ring-4 focus:ring-amber-300/50",
        "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-amber-400/10 before:via-orange-400/10 before:to-amber-400/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        buttonClassName
      )}
    >
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-200/20 via-transparent to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Text content with icon */}
      <span className={cn("relative z-10 flex items-center gap-3 font-bold text-lg", className)}>
        <CurrentIcon className="h-5 w-5 text-amber-700 group-hover:text-amber-600 transition-colors duration-300" />
        <AnimatedShinyText 
          className="text-amber-800 group-hover:text-amber-700 transition-colors duration-300 font-bold text-lg"
          shimmerWidth={140}
        >
          {currentText}
          <span className="animate-pulse text-amber-600">|</span>
        </AnimatedShinyText>
      </span>
      
      {children}
    </ButtonWrapper>
  );
}
