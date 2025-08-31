"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconUpload, IconX, IconCamera, IconPhoto } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

interface EnhancedFileUploadProps {
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  capture?: boolean; // Enable camera capture on mobile
  className?: string;
}

export const EnhancedFileUpload = ({
  onChange,
  maxFiles = 3,
  accept = "image/*",
  capture = false,
  className,
}: EnhancedFileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((newFiles: File[]) => {
    setFiles((prevFiles) => {
      const combinedFiles = [...prevFiles, ...newFiles].slice(0, maxFiles);
      onChange?.(combinedFiles);
      return combinedFiles;
    });
  }, [maxFiles, onChange]);

  const handleFileRemove = useCallback((index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      onChange?.(updatedFiles);
      return updatedFiles;
    });
  }, [onChange]);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const { getRootProps, isDragActive, isDragReject } = useDropzone({
    multiple: true,
    maxFiles: maxFiles - files.length,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (rejectedFiles) => {
      console.log('Files rejected:', rejectedFiles);
    },
  });

  const canAddMore = files.length < maxFiles;

  return (
    <div className={cn("w-full", className)} {...getRootProps()}>
      <motion.div
        whileHover={canAddMore ? "animate" : undefined}
        className="group/file block rounded-lg w-full relative overflow-hidden"
      >
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        
        {capture && (
          <input
            ref={cameraInputRef}
            type="file"
            accept={accept}
            capture="environment"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
          />
        )}

        {/* Upload Area */}
        {canAddMore && (
          <div className="p-6 border-2 border-dashed border-amber-300 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-200">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={cn(
                "flex flex-col items-center space-y-2",
                isDragActive && !isDragReject && "text-amber-700",
                isDragReject && "text-red-600"
              )}>
                <div className="p-3 rounded-full bg-white shadow-md">
                  {isDragActive && !isDragReject ? (
                    <IconUpload className="h-6 w-6 text-amber-700" />
                  ) : (
                    <IconPhoto className="h-6 w-6 text-amber-700" />
                  )}
                </div>
                
                <p className="font-medium text-amber-900">
                  {isDragActive && !isDragReject
                    ? "Lepaskan gambar di sini..."
                    : "Upload Gambar Ampas Kopi"
                  }
                </p>
                
                <p className="text-sm text-amber-700 text-center">
                  {isDragReject
                    ? "File tidak didukung"
                    : `Drag & drop atau pilih file (${files.length}/${maxFiles})`
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleGalleryClick}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <IconPhoto className="h-4 w-4" />
                  Galeri
                </button>
                
                {capture && (
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium md:hidden"
                  >
                    <IconCamera className="h-4 w-4" />
                    Kamera
                  </button>
                )}
              </div>

              <p className="text-xs text-amber-600 text-center">
                Format: JPG, PNG • Maksimal: 10MB per file
              </p>
            </div>
          </div>
        )}

        {/* File Preview Grid */}
        {files.length > 0 && (
          <div className={cn(
            "grid gap-4 mt-4",
            files.length === 1 && "grid-cols-1",
            files.length === 2 && "grid-cols-2",
            files.length >= 3 && "grid-cols-2 md:grid-cols-3"
          )}>
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group bg-white rounded-lg border border-amber-200 overflow-hidden shadow-sm"
                >
                  {/* Image Preview */}
                  <div className="aspect-square relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        // Clean up object URL to prevent memory leaks
                        URL.revokeObjectURL((e.target as HTMLImageElement).src);
                      }}
                    />
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleFileRemove(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium text-amber-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-amber-600">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add More Button */}
        {files.length > 0 && canAddMore && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleGalleryClick}
              className="flex items-center gap-2 px-4 py-2 border border-amber-300 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors text-sm"
            >
              <IconPhoto className="h-4 w-4" />
              Tambah Gambar ({files.length}/{maxFiles})
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};