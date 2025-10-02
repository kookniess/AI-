import React, { useRef, useCallback } from 'react';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImage: UploadedImage | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleContainerClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">1. 上傳您的照片</h2>
        <div
            className="relative flex flex-col items-center justify-center h-64 bg-gray-700/50 rounded-lg cursor-pointer"
            onClick={handleContainerClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            />
            {uploadedImage ? (
                <img src={uploadedImage.base64} alt="Uploaded preview" className="object-cover h-full w-full rounded-lg" />
            ) : (
                <div className="text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2">拖放或點擊此處上傳</p>
                    <p className="text-xs">支援 PNG, JPG, WEBP 格式</p>
                </div>
            )}
        </div>
    </div>
  );
};