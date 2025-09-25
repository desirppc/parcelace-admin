import React, { useState } from 'react';
import { ChevronDown, Sparkles, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AVAILABLE_MODELS, ModelConfig } from '@/services/chatGPTService';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = AVAILABLE_MODELS.find(model => model.id === selectedModel);

  const getModelIcon = (capabilities: string[]) => {
    if (capabilities.includes('complex_reasoning')) return <Brain className="w-4 h-4" />;
    if (capabilities.includes('analytics')) return <Sparkles className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getModelColor = (capabilities: string[]) => {
    if (capabilities.includes('complex_reasoning')) return 'text-purple-500';
    if (capabilities.includes('analytics')) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          {currentModel && getModelIcon(currentModel.capabilities)}
          <span className="font-medium">{currentModel?.name || 'Select Model'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            {AVAILABLE_MODELS.map((model) => (
              <Card
                key={model.id}
                className={`p-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                  selectedModel === model.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${getModelColor(model.capabilities)}`}>
                      {getModelIcon(model.capabilities)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      ${model.costPer1kTokens.toFixed(3)}/1K tokens
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {model.maxTokens.toLocaleString()} tokens max
                    </div>
                  </div>
                </div>
                
                {model.capabilities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {model.capabilities.map((capability, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                      >
                        {capability.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 