"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/magicui/sparkles-text";

export function FeaturesSection() {
  const features = [
    {
      title: "Marketplace Ampas Kopi",
      description:
        "Platform terdepan untuk jual-beli ampas kopi berkualitas dari warung dan cafe terpercaya di Banda Aceh.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-3 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Majalah Digital",
      description:
        "Baca artikel terbaru tentang ekonomi sirkular, tips pengolahan ampas kopi, dan inovasi berkelanjutan.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-3 dark:border-neutral-800",
    },
    {
      title: "Ampas Analyzer",
      description:
        "Teknologi AI untuk menganalisis kualitas ampas kopi dan memberikan rekomendasi penggunaan optimal.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800",
    },
    {
      title: "Chatbot Cerdas",
      description:
        "Asisten virtual 24/7 untuk membantu Anda dalam proses jual-beli dan konsultasi produk ampas kopi.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <motion.section
      className="relative w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Pattern for Glassmorphism - Same as EcosystemBeamSection */}
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

      <div className="relative z-10 py-6 lg:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title with Glassmorphism - Same style as landing-hero */}
        <div className="mb-6 flex justify-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
            <SparklesText
              colors={{
                first: "#8B4513", // Coffee brown
                second: "#A0522D"  // Sienna brown
              }}
              sparklesCount={12}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif leading-tight text-amber-800 text-center"
            >
              Fitur Lengkap untuk Ekonomi Sirkular
            </SparklesText>
          </div>
        </div>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-600 text-center font-normal dark:text-neutral-300 mb-12">
          Dari pengumpulan ampas kopi hingga distribusi produk berkelanjutan, Sikupi menyediakan ekosistem lengkap untuk ekonomi sirkular di Banda Aceh.
        </p>

        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-6 xl:border rounded-md dark:border-neutral-800 border-amber-200 max-w-7xl mx-auto">
            {features.map((feature) => (
              <FeatureCard key={feature.title} className={feature.className}>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
                <div className="h-full w-full">{feature.skeleton}</div>
              </FeatureCard>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-amber-800 dark:text-white text-xl md:text-2xl md:leading-snug font-semibold">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-600 font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-gradient-to-br from-amber-50 to-orange-50 dark:bg-neutral-900 shadow-2xl group h-full rounded-xl">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <img
            src="/landing-asset/marketplace.png"
            alt="Marketplace ampas kopi"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-lg"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonTwo = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-neutral-900 shadow-2xl group h-full rounded-xl">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <img
            src="/landing-asset/majalah.png"
            alt="Majalah digital Sikupi"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-lg"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-gradient-to-br from-green-50 to-teal-50 dark:bg-neutral-900 shadow-2xl group h-full rounded-xl">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <img
            src="/landing-asset/ampas-analyzher.png"
            alt="Ampas analyzer AI"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-lg"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-neutral-900 shadow-2xl group h-full rounded-xl">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <img
            src="/landing-asset/chatbot.png"
            alt="Chatbot cerdas Sikupi"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-lg"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};
