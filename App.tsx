import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VisualCards } from './components/VisualCards';
import { SelectionGrid } from './components/SelectionGrid';
import { PRESET_PERSONS, PRESET_CLOTHES } from './constants';
import { ImageItem, AppStep, HistoryItem } from './types';
import { generateClothingImage, generateTryOn, generateMultiViewTryOn } from './services/geminiService';
import { Loader2, ArrowRight, RefreshCcw, Sparkles, Save, ChevronLeft, History, User, Layers } from 'lucide-react';

function App() {
  // State
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_PERSON);
  const [persons, setPersons] = useState<ImageItem[]>(PRESET_PERSONS);
  const [clothes, setClothes] = useState<ImageItem[]>(PRESET_CLOTHES);
  const [selectedPerson, setSelectedPerson] = useState<ImageItem | undefined>();
  const [selectedCloth, setSelectedCloth] = useState<ImageItem | undefined>();
  const [resultImage, setResultImage] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Tabs for Step 2
  const [clothTab, setClothTab] = useState<'select' | 'generate'>('select');

  // Handlers
  const handleUploadPerson = (file: File) => {
    const url = URL.createObjectURL(file);
    const newItem: ImageItem = { id: `u_p_${Date.now()}`, url, isUserUploaded: true };
    setPersons([newItem, ...persons]);
    setSelectedPerson(newItem);
  };

  const handleUploadCloth = (file: File) => {
    const url = URL.createObjectURL(file);
    const newItem: ImageItem = { id: `u_c_${Date.now()}`, url, isUserUploaded: true };
    setClothes([newItem, ...clothes]);
    setSelectedCloth(newItem);
  };

  const handleGenerateCloth = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const base64Image = await generateClothingImage(prompt);
      const newItem: ImageItem = { 
        id: `g_c_${Date.now()}`, 
        url: base64Image, 
        isGenerated: true 
      };
      setClothes([newItem, ...clothes]);
      setSelectedCloth(newItem);
      setClothTab('select'); // Switch back to grid view
    } catch (error) {
      alert('生成衣服失败，请稍后再试。');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryOn = async () => {
    if (!selectedPerson || !selectedCloth) return;
    setStep(AppStep.RESULT);
    setIsGenerating(true);
    setResultImage(undefined);

    try {
      const resultUrl = await generateTryOn(selectedPerson.url, selectedCloth.url);
      setResultImage(resultUrl);
      
      const historyItem: HistoryItem = {
        id: `h_${Date.now()}`,
        personUrl: selectedPerson.url,
        clothUrl: selectedCloth.url,
        resultUrl,
        timestamp: Date.now()
      };
      setHistory([historyItem, ...history]);

    } catch (error) {
      alert('换装生成失败，请检查网络配置或 API Key。');
      setStep(AppStep.SELECT_CLOTH);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMultiView = async () => {
    if (!selectedPerson || !selectedCloth) return;
    setIsGenerating(true);
    setResultImage(undefined);
    
    try {
      const resultUrl = await generateMultiViewTryOn(selectedPerson.url, selectedCloth.url);
      setResultImage(resultUrl);
      
      const historyItem: HistoryItem = {
        id: `h_mv_${Date.now()}`,
        personUrl: selectedPerson.url,
        clothUrl: selectedCloth.url,
        resultUrl,
        timestamp: Date.now()
      };
      setHistory([historyItem, ...history]);
    } catch (error) {
      alert('多视图生成失败，请稍后再试。');
      // Don't change step, just allow retry
    } finally {
      setIsGenerating(false);
    }
  };

  // Renders
  const renderStep1 = () => (
    <div className="animate-fade-in">
      <SelectionGrid
        title="请选择或上传模特"
        items={persons}
        selectedId={selectedPerson?.id}
        onSelect={setSelectedPerson}
        onUpload={handleUploadPerson}
      />
      <div className="fixed bottom-8 right-8 md:static md:mt-8 md:flex md:justify-end z-40">
        <button
          disabled={!selectedPerson}
          onClick={() => setStep(AppStep.SELECT_CLOTH)}
          className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all ${
            selectedPerson 
              ? 'bg-gray-900 text-white hover:bg-purple-600 hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          下一步 <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <img src={selectedPerson?.url} alt="Selected Person" className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase font-bold">当前模特</p>
          <p className="text-sm font-medium text-gray-700">已就绪</p>
        </div>
        <button onClick={() => setStep(AppStep.SELECT_PERSON)} className="text-xs text-purple-600 font-semibold hover:underline">更改</button>
      </div>

      <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setClothTab('select')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${clothTab === 'select' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          选择/上传衣服
        </button>
        <button
          onClick={() => setClothTab('generate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${clothTab === 'generate' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Sparkles className="w-4 h-4" />
          AI 生成衣服
        </button>
      </div>

      {clothTab === 'select' ? (
        <SelectionGrid
          title="选择你想试穿的衣服"
          items={clothes}
          selectedId={selectedCloth?.id}
          onSelect={setSelectedCloth}
          onUpload={handleUploadCloth}
        />
      ) : (
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">描述你想生成的衣服</h3>
          <p className="text-sm text-gray-500 mb-4">例如："一件红色的丝绸连衣裙，复古风格" 或 "蓝色牛仔夹克，赛博朋克风格"</p>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="在此输入衣服描述..."
              className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all"
            />
            <button
              onClick={handleGenerateCloth}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? '生成中...' : '立即生成'}
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 md:static md:mt-8 md:flex md:justify-between items-center z-40">
        <button
          onClick={() => setStep(AppStep.SELECT_PERSON)}
          className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full text-gray-600 hover:bg-gray-200 font-medium"
        >
           <ChevronLeft className="w-5 h-5" /> 上一步
        </button>
        <button
          disabled={!selectedCloth}
          onClick={handleTryOn}
          className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all ${
            selectedCloth 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/30 hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          开始换装 <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center w-full animate-fade-in py-8">
      {isGenerating ? (
        <div className="flex flex-col items-center gap-6 py-20">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700">AI 正在为您试穿...</h3>
          <p className="text-gray-500">正在处理光影与褶皱细节</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
          <div className="relative w-full aspect-[3/4] group">
            <img 
              src={resultImage} 
              alt="Result" 
              className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white"
            />
            <div className="absolute inset-0 ring-1 ring-black/5 rounded-3xl pointer-events-none"></div>
          </div>

          <div className="w-full space-y-3">
            <a 
              href={resultImage} 
              download={`ai-try-on-${Date.now()}.png`}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 transition-all cursor-pointer"
            >
              <Save className="w-5 h-5" /> 
              保存到相册
            </a>
            
            <div className="grid grid-cols-3 gap-3">
               <button 
                onClick={handleMultiView}
                className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 text-gray-700 py-3 rounded-xl font-medium transition-all text-xs md:text-sm"
              >
                <Layers className="w-4 h-4" /> 
                生成多视图
              </button>
               <button 
                onClick={() => setStep(AppStep.SELECT_CLOTH)}
                className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-purple-200 text-gray-700 py-3 rounded-xl font-medium transition-all text-xs md:text-sm"
              >
                <RefreshCcw className="w-4 h-4" /> 
                换件衣服
              </button>
              <button
                onClick={() => setStep(AppStep.SELECT_PERSON)}
                className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-purple-200 text-gray-700 py-3 rounded-xl font-medium transition-all text-xs md:text-sm"
              >
                <User className="w-4 h-4" /> 
                换个模特
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => {
    if (history.length === 0) return null;
    return (
      <div className="mt-20 pt-10 border-t border-gray-200 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6 px-4">
           <History className="w-5 h-5 text-gray-500" />
           <h3 className="text-lg font-bold text-gray-800">历史生成记录</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-hide">
          {history.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-48 bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <img src={item.resultUrl} className="w-full aspect-[3/4] object-cover rounded-lg mb-2" alt="History" />
              <div className="flex gap-1 justify-center opacity-50">
                <img src={item.personUrl} className="w-6 h-6 rounded-full object-cover" alt="src person" />
                <img src={item.clothUrl} className="w-6 h-6 rounded-full object-cover" alt="src cloth" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header />

      {/* Top Visual Area - Increased padding-bottom to prevent card clipping */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 pb-20 pt-8">
        <VisualCards
          currentStep={step}
          personUrl={selectedPerson?.url}
          clothUrl={selectedCloth?.url}
          resultUrl={resultImage}
        />
      </div>

      {/* Main Operational Area - Negative margin pulls it up over the padding */}
      <main className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-10 min-h-[400px]">
           {step === AppStep.SELECT_PERSON && renderStep1()}
           {step === AppStep.SELECT_CLOTH && renderStep2()}
           {step === AppStep.RESULT && renderResult()}
        </div>
      </main>

      {/* Gallery */}
      {renderHistory()}
    </div>
  );
}

export default App;