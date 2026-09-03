import { useState, useRef, useEffect } from 'react';
import { GeminiModelId, ModelOption } from '../types';
import { Sparkles, ChevronDown, Check, Zap, Cpu, Gauge } from 'lucide-react';

interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel: GeminiModelId;
  onSelectModel: (model: GeminiModelId) => void;
}

export const ModelSelector = ({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel = models.find((m) => m.id === selectedModel) || models[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (id: GeminiModelId) => {
    switch (id) {
      case 'gemini-3.1-pro-preview':
        return <Cpu className="h-4 w-4 text-purple-600" />;
      case 'gemini-3.1-flash-lite':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'gemini-3.8-flash':
        return <Gauge className="h-4 w-4 text-blue-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="model-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
        title="Model tabdeel karein"
      >
        {getModelIcon(selectedModel)}
        <span className="font-semibold">{activeModel.name}</span>
        <span className="hidden md:inline-block text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
          {activeModel.badge}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-72 sm:w-80 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 mb-1 border-b border-zinc-100">
            <p className="text-xs font-bold text-zinc-800">Gemini Models</p>
            <p className="text-[11px] text-zinc-500">Apne task ki noiyat ke mutabiq model muntakhib karein</p>
          </div>

          <div className="space-y-1">
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  id={`select-model-${model.id}`}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-zinc-100/90 text-zinc-900 font-medium'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getModelIcon(model.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900">{model.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-zinc-200/70 text-zinc-700">
                        {model.speed}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {model.description}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200/60 px-1.5 rounded">
                      {model.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
