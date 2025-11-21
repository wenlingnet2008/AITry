import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-6 px-8">
      <div className="flex items-center gap-2">
        <div className="bg-purple-600 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          AI 换装工坊
        </h1>
      </div>
      <div className="text-sm text-gray-500 font-medium">
        Powered by Gemini Nano Banana
      </div>
    </header>
  );
};