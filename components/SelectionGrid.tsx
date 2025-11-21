import React from 'react';
import { ImageItem } from '../types';
import { Upload, Check } from 'lucide-react';

interface SelectionGridProps {
  items: ImageItem[];
  selectedId?: string;
  onSelect: (item: ImageItem) => void;
  onUpload: (file: File) => void;
  title: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
  items,
  selectedId,
  onSelect,
  onUpload,
  title
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Upload Button */}
        <label className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors group">
          <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2" />
          <span className="text-xs text-gray-500 group-hover:text-purple-600 font-medium">上传照片</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>

        {/* Items */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${
              selectedId === item.id ? 'border-purple-600 ring-2 ring-purple-200 shadow-lg scale-95' : 'border-transparent hover:border-gray-200'
            }`}
          >
            <img src={item.url} alt="Selection" className="w-full h-full object-cover" />
            {selectedId === item.id && (
              <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
             {item.isGenerated && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1">
                AI 生成
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};