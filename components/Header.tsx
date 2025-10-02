import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          AI 表情包生成器
        </h1>
      </div>
    </header>
  );
};