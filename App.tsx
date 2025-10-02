import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ExpressionSelector } from './components/ExpressionSelector';
import { ImageGrid } from './components/ImageGrid';
import { GenerationList } from './components/GenerationList';
import { generateMemeImage } from './services/geminiService';
import type { UploadedImage, GeneratedImage } from './types';
import { DEFAULT_EXPRESSIONS } from './constants';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
  const [selectedForDownload, setSelectedForDownload] = useState<string[]>([]);
  const [generatingPrompt, setGeneratingPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage({ file, base64: reader.result as string });
      setGeneratedImages({});
      setSelectedExpressions([]);
      setSelectedForDownload([]);
      setError(null);
    };
    reader.onerror = () => {
      setError("讀取圖片檔案失敗。");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSingle = useCallback(async (prompt: string) => {
    if (!uploadedImage) {
      setError("請先上傳一張圖片。");
      return;
    }
    if (generatingPrompt) return; // Prevent multiple simultaneous generations

    setGeneratingPrompt(prompt);
    setError(null);

    const imageBase64 = uploadedImage.base64.split(',')[1];
    const mimeType = uploadedImage.file.type;

    try {
      const newImageBase64 = await generateMemeImage(imageBase64, mimeType, prompt);
      const newImage: GeneratedImage = {
        id: `${prompt}-${Date.now()}`,
        prompt,
        base64: `data:image/png;base64,${newImageBase64}`,
      };
      setGeneratedImages(prev => ({ ...prev, [prompt]: newImage }));
    } catch (err: any) {
      const errorImage: GeneratedImage = {
        id: `${prompt}-${Date.now()}`,
        prompt,
        base64: null,
        error: err.message || 'Generation failed',
      };
      setGeneratedImages(prev => ({ ...prev, [prompt]: errorImage }));
    } finally {
      setGeneratingPrompt(null);
    }
  }, [uploadedImage, generatingPrompt]);
  
  const handleDownloadSelected = useCallback(() => {
    selectedForDownload.forEach(id => {
      const image = Object.values(generatedImages).find(img => img.id === id);
      if (image && image.base64) {
        const link = document.createElement('a');
        link.href = image.base64;
        link.download = `meme-${image.prompt.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }, [selectedForDownload, generatedImages]);

  const imagesForGrid = useMemo(() => Object.values(generatedImages), [generatedImages]);
  const successfulImages = useMemo(() => imagesForGrid.filter(img => img.base64), [imagesForGrid]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-8">
            <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
            <ExpressionSelector
              defaultExpressions={DEFAULT_EXPRESSIONS}
              selectedExpressions={selectedExpressions}
              setSelectedExpressions={setSelectedExpressions}
              isDisabled={!uploadedImage}
            />
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
             {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">錯誤： </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
              )}

            {uploadedImage && selectedExpressions.length > 0 && (
              <GenerationList
                expressions={selectedExpressions}
                generatedImages={generatedImages}
                generatingPrompt={generatingPrompt}
                onGenerate={handleGenerateSingle}
              />
            )}
            
            <div className="bg-gray-800 rounded-lg p-6 min-h-[50vh] border border-gray-700 shadow-2xl flex flex-col">
              {successfulImages.length > 0 && (
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-300">生成結果</h3>
                  <button
                    onClick={handleDownloadSelected}
                    disabled={selectedForDownload.length === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 shadow-lg"
                  >
                    下載已選的 {selectedForDownload.length} 張
                  </button>
                </div>
              )}

              {imagesForGrid.length > 0 ? (
                <ImageGrid
                  images={imagesForGrid}
                  selectedForDownload={selectedForDownload}
                  setSelectedForDownload={setSelectedForDownload}
                />
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  <h3 className="text-xl font-semibold text-gray-400">您的創作成果</h3>
                  <p className="mt-2">生成的圖片將會顯示在這裡。</p>
                   {uploadedImage && selectedExpressions.length > 0 && (
                    <p className="mt-1 text-sm">從上方的列表中選擇一個表情並點擊「生成」來開始。</p>
                  )}
                   {!uploadedImage && (
                    <p className="mt-1 text-sm">請先上傳圖片並選擇您想要的表情。</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}