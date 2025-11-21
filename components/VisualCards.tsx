import React from 'react';
import { AppStep } from '../types';
import { User, Shirt, Wand2, CheckCircle2 } from 'lucide-react';

interface VisualCardsProps {
  currentStep: AppStep;
  personUrl?: string;
  clothUrl?: string;
  resultUrl?: string;
}

export const VisualCards: React.FC<VisualCardsProps> = ({ 
  currentStep, 
  personUrl, 
  clothUrl, 
  resultUrl 
}) => {
  
  const getCardStyle = (step: number) => {
    const isActive = currentStep === step;
    
    // Base styles
    let baseClass = "absolute top-4 md:top-8 aspect-[3/4] rounded-3xl shadow-xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-center justify-center border-4 overflow-hidden bg-white ";
    
    // Responsive width: constrained on mobile to prevent excessive overlap
    baseClass += "w-32 md:w-64 "; 

    // Z-Index & Visual State
    if (isActive) {
      // Active: Front, clear, scaled up, straight
      baseClass += "z-30 opacity-100 scale-110 shadow-2xl shadow-purple-500/20 rotate-0 ";
    } else {
      // Inactive: Back, dimmed, blurred, scaled down
      baseClass += "z-10 opacity-50 scale-90 blur-[0.5px] grayscale hover:grayscale-0 hover:opacity-90 hover:blur-0 cursor-pointer ";
    }

    // Positioning & Rotation Configuration
    if (step === 1) {
      baseClass += "left-1/2 -translate-x-[130%] md:left-[20%] md:translate-x-0 origin-bottom-right ";
      baseClass += isActive ? "border-purple-500" : "border-white -rotate-6 mt-6";
    } else if (step === 2) {
      baseClass += "left-1/2 -translate-x-1/2 origin-bottom ";
      baseClass += isActive ? "border-pink-500" : "border-white rotate-2 mt-6"; // Slight natural irregularity
    } else if (step === 3) {
      baseClass += "left-1/2 translate-x-[30%] md:left-auto md:right-[20%] md:translate-x-0 origin-bottom-left ";
      baseClass += isActive ? "border-indigo-500" : "border-white rotate-6 mt-6";
    }
    
    return baseClass;
  };

  const renderPlaceholder = (step: number, label: string) => {
     const Icon = step === 1 ? User : step === 2 ? Shirt : Wand2;
     const isActive = currentStep === step;
     return (
       <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>
         <div className={`p-3 md:p-4 rounded-full ${isActive ? 'bg-gray-100' : 'bg-gray-50'}`}>
            <Icon className={`w-6 h-6 md:w-10 md:h-10 ${isActive ? 'text-purple-600' : 'text-gray-300'}`} />
         </div>
         <span className={`font-bold text-xs md:text-sm whitespace-nowrap ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
       </div>
     );
  };

  const renderImage = (url: string) => (
    <div className="w-full h-full relative group">
      <img src={url} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[450px] flex justify-center overflow-visible perspective-[2000px]">
      
      {/* Card 1: Model */}
      <div 
        className={getCardStyle(1)}
        // Optional: Add click handler to jump to step if needed, passed from props or managed via parent
      >
        {personUrl ? renderImage(personUrl) : renderPlaceholder(1, "1. 选择模特")}
        {personUrl && <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg animate-scale-in"><CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /></div>}
        {currentStep === 1 && !personUrl && (
           <div className="absolute bottom-3 md:bottom-6 px-3 py-1 bg-purple-100 text-purple-700 text-[10px] md:text-xs font-bold rounded-full animate-pulse">
             当前步骤
           </div>
        )}
      </div>

      {/* Card 2: Clothing */}
      <div className={getCardStyle(2)}>
        {clothUrl ? renderImage(clothUrl) : renderPlaceholder(2, "2. 选择服装")}
        {clothUrl && <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg animate-scale-in"><CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /></div>}
        {currentStep === 2 && !clothUrl && (
           <div className="absolute bottom-3 md:bottom-6 px-3 py-1 bg-pink-100 text-pink-700 text-[10px] md:text-xs font-bold rounded-full animate-pulse">
             当前步骤
           </div>
        )}
      </div>

      {/* Card 3: Result */}
      <div className={getCardStyle(3)}>
        {resultUrl ? renderImage(resultUrl) : renderPlaceholder(3, "3. 智能生成")}
        {currentStep === 3 && !resultUrl && (
           <div className="absolute bottom-3 md:bottom-6 px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] md:text-xs font-bold rounded-full animate-pulse">
             AI 处理中...
           </div>
        )}
      </div>
    </div>
  );
};