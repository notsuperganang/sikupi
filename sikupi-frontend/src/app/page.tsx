'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, ArrowRight, Users, Leaf, Recycle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import FloatingAnimations from '@/components/ui/FloatingAnimations';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-secondary-50 to-primary-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30"></div>
      
      {/* Floating Animations */}
      <FloatingAnimations count={5} icons={['☕', '🌱', '♻️']} />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            {/* Logo */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-coffee rounded-full mb-8 shadow-large"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Coffee className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl font-bold text-gradient mb-6">
              Sikupi
            </h1>
            <h2 className="text-2xl font-semibold text-neutral-700 mb-4">
              Smart Coffee Waste Marketplace
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              Transform coffee waste into valuable resources. Join our sustainable marketplace 
              connecting coffee waste producers with buyers who can give it new life.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="primary" size="lg" icon={<ArrowRight />} iconPosition="right">
                  Get Started
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Join as Seller
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <Card hover className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Recycle className="w-6 h-6 text-accent-600" />
                </div>
                <CardTitle className="text-lg mb-2">Waste to Value</CardTitle>
                <CardDescription>
                  Turn coffee waste into profitable resources through our AI-powered marketplace
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card hover className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-warm-600" />
                </div>
                <CardTitle className="text-lg mb-2">Community Driven</CardTitle>
                <CardDescription>
                  Connect with cafes, farmers, and artisans in a sustainable ecosystem
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card hover className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-primary-600" />
                </div>
                <CardTitle className="text-lg mb-2">Environmental Impact</CardTitle>
                <CardDescription>
                  Track your positive environmental impact with real-time metrics
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <p className="text-neutral-600 mb-4">
              🌱 Join thousands making coffee waste valuable
            </p>
            <div className="flex justify-center gap-4 text-sm text-neutral-500">
              <span>✓ AI Quality Assessment</span>
              <span>✓ Secure Transactions</span>
              <span>✓ Environmental Tracking</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}