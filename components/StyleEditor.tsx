import React, { useRef } from 'react';
import type { UploadedImage } from '../types';

// A reusable sub-component for image input within the StyleEditor
const ImageInput: React.FC<{
  image: UploadedImage | null;
  onImageSelect: (image: UploadedImage) => void;
  onImageRemove: () => void;
  isDisabled: boolean;
}> = ({ image, onImageSelect, onImageRemove, isDisabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect({ file, base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (image) {
    return (
      <div className="relative w-full h-24 mt-2">
        <img src={image.base64} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-600" />
        <button
          onClick={onImageRemove}
          disabled={isDisabled}
          className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 leading-none hover:bg-opacity-80 disabled:cursor-not-allowed"
          aria-label="Remove image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={isDisabled}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled}
        className="w-full mt-2 text-sm text-center py-2 px-4 rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        或上傳圖片
      </button>
    </>
  );
};


interface StyleEditorProps {
  backgroundPrompt: string;
  setBackgroundPrompt: (prompt: string) => void;
  clothingPrompt: string;
  setClothingPrompt: (prompt: string) => void;
  backgroundImage: UploadedImage | null;
  setBackgroundImage: (image: UploadedImage | null) => void;
  clothingImage: UploadedImage | null;
  setClothingImage: (image: UploadedImage | null) => void;
  isDisabled: boolean;
  actionPrompt: string;
  setActionPrompt: (prompt: string) => void;
  enhanceConsistency: boolean;
  setEnhanceConsistency: (value: boolean) => void;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  backgroundPrompt,
  setBackgroundPrompt,
  clothingPrompt,
  setClothingPrompt,
  backgroundImage,
  setBackgroundImage,
  clothingImage,
  setClothingImage,
  isDisabled,
  actionPrompt,
  setActionPrompt,
  enhanceConsistency,
  setEnhanceConsistency,
}) => {

  const handleImageSelect = (setter: (image: UploadedImage) => void) => (image: UploadedImage) => {
    setter(image);
  };
  
  const handleImageRemove = (setter: (image: UploadedImage | null) => void) => () => {
    setter(null);
  };

  return (
    <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700 transition-opacity duration-300 ${isDisabled ? 'opacity-50' : 'opacity-100'}`}>
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">可選：自訂風格</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-center bg-gray-700/50 p-3 rounded-lg">
          <label htmlFor="consistency-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                id="consistency-toggle" 
                className="sr-only" 
                checked={enhanceConsistency}
                onChange={(e) => setEnhanceConsistency(e.target.checked)}
                disabled={isDisabled}
              />
              <div className="block bg-gray-600 w-12 h-6 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
            </div>
            <div className="ml-3 text-sm font-medium text-gray-300">
              增強人物一致性
            </div>
          </label>
          <style>{`
            input:checked ~ .dot {
              transform: translateX(1.5rem);
              background-color: #4f46e5; /* indigo-600 */
            }
            input:checked ~ .block {
              background-color: #312e81; /* indigo-800 */
            }
          `}</style>
        </div>

        <div>
          <label htmlFor="background-prompt" className="block mb-2 text-sm font-medium text-gray-300">更換背景</label>
          <input
            type="text"
            id="background-prompt"
            value={backgroundPrompt}
            onChange={(e) => setBackgroundPrompt(e.target.value)}
            placeholder="例如：在海灘上、科幻城市"
            disabled={isDisabled || !!backgroundImage} // Disable if image is uploaded
            className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:cursor-not-allowed disabled:bg-gray-600"
          />
          <ImageInput
            image={backgroundImage}
            onImageSelect={handleImageSelect(setBackgroundImage)}
            onImageRemove={handleImageRemove(setBackgroundImage)}
            isDisabled={isDisabled}
          />
        </div>
        <div>
          <label htmlFor="clothing-prompt" className="block mb-2 text-sm font-medium text-gray-300">更換服裝</label>
          <input
            type="text"
            id="clothing-prompt"
            value={clothingPrompt}
            onChange={(e) => setClothingPrompt(e.target.value)}
            placeholder="例如：穿著太空服、換成西裝"
            disabled={isDisabled || !!clothingImage} // Disable if image is uploaded
            className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:cursor-not-allowed disabled:bg-gray-600"
          />
          <ImageInput
            image={clothingImage}
            onImageSelect={handleImageSelect(setClothingImage)}
            onImageRemove={handleImageRemove(setClothingImage)}
            isDisabled={isDisabled}
          />
        </div>
        <div>
          <label htmlFor="action-prompt" className="block mb-2 text-sm font-medium text-gray-300">更換姿勢或動作</label>
          <input
            type="text"
            id="action-prompt"
            value={actionPrompt}
            onChange={(e) => setActionPrompt(e.target.value)}
            placeholder="例如：坐在沙發上、跳起來"
            disabled={isDisabled}
            className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:cursor-not-allowed disabled:bg-gray-600"
          />
        </div>
      </div>
    </div>
  );
};