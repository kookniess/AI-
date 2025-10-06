import React, { useState, KeyboardEvent } from 'react';
import { Spinner } from './Spinner';

interface ExpressionSelectorProps {
  defaultExpressions: string[];
  selectedExpressions: string[];
  setSelectedExpressions: (expressions: string[]) => void;
  isDisabled: boolean;
  isRestoring: boolean;
  onRestore: () => void;
}

export const ExpressionSelector: React.FC<ExpressionSelectorProps> = ({
  defaultExpressions,
  selectedExpressions,
  setSelectedExpressions,
  isDisabled,
  isRestoring,
  onRestore,
}) => {
  const [customExpressions, setCustomExpressions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const allExpressions = [...defaultExpressions, ...customExpressions];

  const handleToggleExpression = (expression: string) => {
    const currentIndex = selectedExpressions.indexOf(expression);
    const newSelected = [...selectedExpressions];

    if (currentIndex === -1) {
      newSelected.push(expression);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedExpressions(newSelected);
  };

  const handleAddCustom = () => {
    if (inputValue && !allExpressions.includes(inputValue)) {
      setCustomExpressions([...customExpressions, inputValue]);
      handleToggleExpression(inputValue); // Also select it
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700 transition-opacity duration-300 ${isDisabled && !isRestoring ? 'opacity-50' : 'opacity-100'}`}>
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">2. 選擇表情</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        {allExpressions.map(expression => {
          const isSelected = selectedExpressions.includes(expression);
          return (
            <button
              key={expression}
              onClick={() => !isDisabled && handleToggleExpression(expression)}
              disabled={isDisabled}
              className={`px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition-all duration-200 border
                ${isSelected 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500'}
                ${isDisabled ? 'cursor-not-allowed' : ''}
              `}
            >
              {expression}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新增自訂表情..."
          disabled={isDisabled}
          className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:cursor-not-allowed"
        />
        <button 
          onClick={handleAddCustom}
          disabled={isDisabled || !inputValue}
          className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          新增
        </button>
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-3 text-center text-gray-400">或者...</h3>
        <button
          onClick={onRestore}
          disabled={isDisabled || isRestoring}
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg transform hover:scale-105"
        >
          {isRestoring ? (
            <>
              <Spinner />
              <span className="ml-2">修復中...</span>
            </>
          ) : (
            '一鍵修復老照片'
          )}
        </button>
      </div>
    </div>
  );
};