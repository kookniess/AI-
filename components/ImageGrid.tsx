import React from 'react';
import type { GeneratedImage } from '../types';
import { Spinner } from './Spinner';

interface ImageGridProps {
  images: GeneratedImage[];
  selectedForDownload: string[];
  setSelectedForDownload: (ids: string[]) => void;
}

const ImageCard: React.FC<{
    image: GeneratedImage;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}> = ({ image, isSelected, onToggleSelect }) => {
    return (
        <div className="relative group aspect-square bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all duration-300 shadow-lg">
            {image.base64 ? (
                <>
                    <img src={image.base64} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                         <div className="flex justify-end">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(image.id)}
                                className="form-checkbox h-6 w-6 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                        </div>
                        <p className="text-white text-sm font-semibold capitalize bg-black bg-opacity-60 px-2 py-1 rounded-md self-start">{image.prompt}</p>
                    </div>
                </>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-red-400 p-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold capitalize">失敗：{image.prompt}</p>
                    <p className="text-xs text-gray-400 mt-1">{image.error}</p>
                 </div>
            )}
        </div>
    );
}


export const ImageGrid: React.FC<ImageGridProps> = ({ images, selectedForDownload, setSelectedForDownload }) => {
  const handleToggleSelect = (id: string) => {
    const currentIndex = selectedForDownload.indexOf(id);
    const newSelected = [...selectedForDownload];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedForDownload(newSelected);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map(image => (
        <ImageCard 
            key={image.id}
            image={image}
            isSelected={selectedForDownload.includes(image.id)}
            onToggleSelect={handleToggleSelect}
        />
      ))}
    </div>
  );
};