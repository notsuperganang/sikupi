"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Image, X } from "lucide-react";
import { Button } from "./button";
import { FileUpload } from "./file-upload";

interface CameraFileUploadProps {
  onChange?: (files: File[]) => void;
}

export const CameraFileUpload = ({ onChange }: CameraFileUploadProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer rear camera for better quality
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Tidak dapat mengakses kamera. Pastikan browser memiliki izin kamera.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert to File object
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            onChange?.([file]);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  }, [onChange, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="w-full space-y-6">
      <AnimatePresence mode="wait">
        {showCamera ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative bg-black rounded-2xl overflow-hidden"
          >
            {/* Camera Preview */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-80 object-cover rounded-2xl"
              />
              
              {/* Camera Controls Overlay */}
              <div className="absolute inset-0 flex items-end justify-center pb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="lg"
                      className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-full w-14 h-14 p-0"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Button
                      onClick={capturePhoto}
                      size="lg"
                      className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16 p-0 shadow-lg"
                    >
                      <Camera className="h-8 w-8" />
                    </Button>
                  </motion.div>
                  
                  <div className="w-14 h-14" /> {/* Spacer for balance */}
                </div>
              </div>
              
              {/* Camera guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white/50 border-dashed rounded-lg w-64 h-48 flex items-center justify-center">
                  <p className="text-white/70 text-sm font-medium">Posisikan ampas kopi di sini</p>
                </div>
              </div>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Upload Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl font-semibold"
                >
                  <Camera className="h-5 w-5" />
                  Ambil Foto Langsung
                </Button>
              </motion.div>
              
              <div className="flex items-center gap-3 text-stone-500">
                <div className="w-12 h-px bg-stone-300" />
                <span className="text-sm font-medium bg-stone-100 px-3 py-1 rounded-full">atau</span>
                <div className="w-12 h-px bg-stone-300" />
              </div>
              
              <motion.div className="text-center">
                <p className="text-stone-600 text-sm mb-2 font-medium">Upload dari galeri</p>
                <div className="flex items-center gap-1 justify-center text-xs text-stone-500">
                  <Image className="h-3 w-3" />
                  <span>JPG, PNG maksimal 10MB</span>
                </div>
              </motion.div>
            </div>

            {/* Camera Error */}
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center font-medium"
              >
                {cameraError}
              </motion.div>
            )}

            {/* Original FileUpload Component */}
            <FileUpload onChange={onChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};