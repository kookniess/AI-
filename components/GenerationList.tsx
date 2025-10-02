import React from 'react';
import type { GeneratedImage } from '../types';
import { Spinner } from './Spinner';

interface GenerationListProps {
  expressions: string[];
  generatedImages: Record<string, GeneratedImage>;
  generatingPrompt: string | null;
  onGenerate: (prompt: string) => void;
}

const GenerateButton: React.FC<{
    status: 'idle' | 'error' | 'generating' | 'done';
    prompt: string;
    isProcessing: boolean;
    onGenerate: (prompt: string) => void;
}> = ({ status, prompt, isProcessing, onGenerate }) => {
    
    if (status === 'generating') {
        return (
            <div className="flex justify-end items-center text-sm text-gray-400 w-28 h-9">
                <span className="mr-2">生成中</span>
                <Spinner />
            </div>
        );
    }

    if (status === 'done') {
        return (
             <div className="flex items-center justify-center text-green-400 font-medium w-28 h-9">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>完成</span>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <button 
                onClick={() => onGenerate(prompt)} 
                disabled={isProcessing} 
                className="flex items-center justify-center w-28 h-9 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
                </svg>
                <span>重試</span>
            </button>
        )
    }

    // Idle
    return (
        <button 
            onClick={() => onGenerate(prompt)} 
            disabled={isProcessing}
            className="w-28 h-9 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
            生成
        </button>
    )

}


export const GenerationList: React.FC<GenerationListProps> = ({ expressions, generatedImages, generatingPrompt, onGenerate }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 shadow-2xl">
      <h3 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-3">3. 逐一生成表情</h3>
      <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {expressions.map(prompt => {
          const image = generatedImages[prompt];
          const isGenerating = generatingPrompt === prompt;
          const isDone = image && image.base64;
          const isError = image && !image.base64;
          const isProcessing = generatingPrompt !== null;

          let status: 'idle' | 'error' | 'generating' | 'done' = 'idle';
          if (isGenerating) status = 'generating';
          else if (isDone) status = 'done';
          else if (isError) status = 'error';

          return (
            <li key={prompt} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
              <span className="text-gray-200 capitalize">{prompt}</span>
              <GenerateButton 
                status={status}
                prompt={prompt}
                isProcessing={isProcessing}
                onGenerate={onGenerate}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};