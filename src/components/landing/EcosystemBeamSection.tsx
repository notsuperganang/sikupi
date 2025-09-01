"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

type NodeIcon =
  | { type: "img"; src: string; alt?: string }
  | { type: "react"; element: React.ReactNode };

type EcosystemBeamSectionProps = {
  title?: string;
  subtitle?: string;
  supplier: { icon: NodeIcon; label?: string };
  center: { icon: NodeIcon; label?: string };
  markets: Array<{ id: string; icon: NodeIcon; label?: string }>;
  className?: string;
  beamDurationSec?: number;
};

const Circle = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    label?: string;
    className?: string;
    size?: "sm" | "lg";
  }
>(({ children, label, className, size = "sm" }, ref) => {
  const sizeClasses = {
    sm: "size-12",
    lg: "size-16",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={cn(
          "z-10 flex items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
      {label && (
        <span className="text-xs text-center text-gray-600 max-w-20">
          {label}
        </span>
      )}
    </div>
  );
});
Circle.displayName = "Circle";

const NodeIcon: React.FC<{ icon: NodeIcon; size?: number }> = ({ 
  icon, 
  size = 24 
}) => {
  if (icon.type === "img") {
    return (
      <Image
        src={icon.src}
        alt={icon.alt || ""}
        width={size}
        height={size}
        className="object-contain"
      />
    );
  }
  return <>{icon.element}</>;
};

export default function EcosystemBeamSection({
  title = "Ekonomi Sirkular, Digerakkan oleh Sikupi",
  subtitle = "Kami menjemput ampas kopi dari warung & mitra, mengolahnya di gudang, lalu menyalurkan produk turunannya ke individu, sekolah, peneliti, dan komunitas.",
  supplier,
  center,
  markets,
  className,
  beamDurationSec = 3,
}: EcosystemBeamSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const market1Ref = useRef<HTMLDivElement>(null);
  const market2Ref = useRef<HTMLDivElement>(null);
  const market3Ref = useRef<HTMLDivElement>(null);
  const market4Ref = useRef<HTMLDivElement>(null);
  const market5Ref = useRef<HTMLDivElement>(null);

  const marketRefs = [market1Ref, market2Ref, market3Ref, market4Ref, market5Ref];

  return (
    <motion.section
      role="region"
      aria-labelledby="ecosystem-title"
      className={cn(
        "relative h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Pattern for Glassmorphism */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-amber-200 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-32 right-32 w-96 h-96 bg-orange-200 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -15, 0],
            y: [0, 10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        ></motion.div>
      </motion.div>
      
      {/* 2-Column Grid Layout */}
      <div className="relative h-full grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Enhanced 3D Card */}
        <motion.div 
          className="flex items-center justify-center p-6 lg:p-12"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <CardContainer className="inter-var">
            <CardBody className="bg-white/20 backdrop-blur-lg backdrop-saturate-150 relative group/card border-10 border-amber-900/60 w-auto sm:w-[35rem] h-auto rounded-[2rem] p-8 shadow-2xl before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-br before:from-white/10 before:to-transparent before:backdrop-blur-sm">
              <CardItem
                translateZ="60"
                as="h2"
                id="ecosystem-title"
                className="mb-6"
              >
                <SparklesText
                  colors={{
                    first: "#8B4513", // Coffee brown
                    second: "#A0522D"  // Sienna brown
                  }}
                  sparklesCount={8}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif leading-tight text-amber-800"
                >
                  {title}
                </SparklesText>
              </CardItem>
              <CardItem
                as="p"
                translateZ="70"
                className="text-gray-700 text-base max-w-md mt-4 leading-relaxed font-medium"
              >
                {subtitle}
              </CardItem>
              <CardItem translateZ="100" className="w-full mt-6">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src="/landing-asset/coffee-many-beans.jpg"
                    height="1000"
                    width="1000"
                    className="h-64 w-full object-cover rounded-xl group-hover/card:shadow-2xl group-hover/card:scale-105 transition-all duration-300"
                    alt="Coffee beans representing circular economy"
                  />
                  {/* Subtle overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl" />
                </div>
              </CardItem>
              <div className="flex justify-between items-center mt-12">
                <CardItem
                  translateZ={30}
                  as="a"
                  href="/magazine"
                  className="px-6 py-3 rounded-xl text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                >
                  Pelajari Lebih →
                </CardItem>
                <CardItem
                  translateZ={30}
                  as="a"
                  href="/login"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Bergabung
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </motion.div>

        {/* Right Column: Text and AnimatedBeam Visualization */}
        <motion.div 
          className="flex flex-col items-center justify-center p-6 space-y-8"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Text Generate Effect */}
          <motion.div 
            className="w-full max-w-5xl px-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <TextGenerateEffect
              words="Dari ampas ke manfaat — Sikupi mendorong sirkularitas untuk masyarakat dan industri."
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-amber-800 text-left"
              duration={0.8}
            />
          </motion.div>

          {/* AnimatedBeam Visualization - keeping as regular div to avoid breaking the beams */}
          <div
            className={cn(
              "relative flex h-[400px] w-full items-center justify-center overflow-hidden p-8"
            )}
            ref={containerRef}
          >
            <div className="flex size-full max-w-4xl flex-row items-stretch justify-between gap-10">
              {/* Supplier (Left) */}
              <div className="flex flex-col justify-center">
                <Circle ref={supplierRef} label={supplier.label}>
                  <NodeIcon icon={supplier.icon} />
                </Circle>
              </div>

              {/* Center (Sikupi Hub) */}
              <div className="flex flex-col justify-center">
                <Circle ref={centerRef} size="lg" label={center.label} className="border-orange-300">
                  <NodeIcon icon={center.icon} size={48} />
                </Circle>
              </div>

              {/* Markets (Right) */}
              <div className="flex flex-col justify-center gap-2">
                {markets.slice(0, 5).map((market, index) => (
                  <Circle 
                    key={market.id} 
                    ref={marketRefs[index]} 
                    label={market.label}
                  >
                    <NodeIcon icon={market.icon} />
                  </Circle>
                ))}
              </div>
            </div>

            {/* Animated Beams */}
            {/* Supplier to Center (Bidirectional) - Using curved beams like the example */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={supplierRef}
              toRef={centerRef}
              duration={beamDurationSec}
              startYOffset={10}
              endYOffset={10}
              curvature={-20}
              gradientStartColor="#f97316"
              gradientStopColor="#ea580c"
              delay={0}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={supplierRef}
              toRef={centerRef}
              duration={beamDurationSec}
              startYOffset={-10}
              endYOffset={-10}
              curvature={20}
              reverse={true}
              gradientStartColor="#22c55e"
              gradientStopColor="#16a34a"
              delay={0.5}
            />

            {/* Center to Markets (Outbound only) */}
            {markets.slice(0, 5).map((market, index) => (
              <AnimatedBeam
                key={`market-beam-${market.id}`}
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={marketRefs[index]}
                duration={beamDurationSec}
                delay={1 + index * 0.2}
                gradientStartColor="#3b82f6"
                gradientStopColor="#1d4ed8"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
