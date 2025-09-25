import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageCircle, Plus, ThumbsUp, ThumbsDown, RotateCcw, Copy, Loader2, Settings, Download, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { chatGPTService, ChatMessage, ChatResponse } from '@/services/chatGPTService';
import { conversationService, Conversation } from '@/services/conversationService';
import { analyticsService } from '@/services/analyticsService';
import { debugService } from '@/services/debugService';
import ModelSelector from './ModelSelector';
import { getBrandMessage, QUICK_RESPONSES } from '@/config/brandConfig';

interface DisplayMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  model?: string;
  usage?: any;
}

const ParcelAceAI = () => {
  const [message, setMessage] = useState('');
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const suggestions = [
    { title: "What is my RTO rate?", category: "Analytics", color: "text-blue-500" },
    { title: "Show me delivery success rate", category: "Analytics", color: "text-green-500" },
    { title: "What's my average order value?", category: "Analytics", color: "text-purple-500" },
    { title: "Check my wallet expense for today", category: "Wallet", color: "text-orange-500" },
    { title: "RTO rate this month vs last month", category: "Analytics", color: "text-red-500" },
    { title: "How can I reduce RTO rates?", category: "Optimization", color: "text-indigo-500" }
  ];

  useEffect(() => {
    // Check if ChatGPT is configured
    const configured = chatGPTService.isConfigured();
    setIsConfigured(configured);
    
    // Test analytics service parsing
    analyticsService.testMetricParsing();
    
    // Load recent conversations
    const recentConversations = conversationService.getRecentConversations();
    setConversations(recentConversations);
    
    // Create a new conversation if none exists
    if (recentConversations.length === 0) {
      const newConversation = conversationService.createConversation('New Chat', selectedModel);
      setCurrentConversation(newConversation);
      
      // Add welcome message if AI is not configured
      if (!configured) {
        const welcomeMessage: DisplayMessage = {
          id: 'welcome',
          type: 'ai',
          content: getBrandMessage('greeting'),
          timestamp: new Date()
        };
        setDisplayMessages([welcomeMessage]);
      }
    } else {
      setCurrentConversation(recentConversations[0]);
      setDisplayMessages(recentConversations[0].messages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: msg.timestamp,
        model: msg.model
      })));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const createNewChat = () => {
    const newConversation = conversationService.createConversation('New Chat', selectedModel);
    setCurrentConversation(newConversation);
    setDisplayMessages([]);
    setConversations(conversationService.getRecentConversations());
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setDisplayMessages(conversation.messages.map(msg => ({
      id: msg.id,
      type: msg.role === 'user' ? 'user' : 'ai',
      content: msg.content,
      timestamp: msg.timestamp,
      model: msg.model
    })));
  };

  const deleteConversation = (conversationId: string) => {
    conversationService.deleteConversation(conversationId);
    setConversations(conversationService.getRecentConversations());
    
    if (currentConversation?.id === conversationId) {
      createNewChat();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !currentConversation) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // Add user message to conversation
    conversationService.addMessage(currentConversation.id, userMessage);

    // Add user message to display
    const displayUserMessage: DisplayMessage = {
      id: userMessage.id,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setDisplayMessages(prev => [...prev, displayUserMessage]);

    // Add generating message
    const generatingMessage: DisplayMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };

    setDisplayMessages(prev => [...prev, generatingMessage]);
    setIsLoading(true);

    try {
      // First, check if this is an analytics query
      console.log('Checking analytics query:', message);
      const analyticsResult = await analyticsService.processQuery(message);
      console.log('Analytics result:', analyticsResult);
      
      if (analyticsResult) {
        // Format analytics response
        let analyticsResponse = formatAnalyticsResponse(analyticsResult);
        console.log('Formatted analytics response:', analyticsResponse);
        
        // Add debug information if debug mode is enabled
        if (debugMode) {
          const debugSession = debugService.getCurrentSession();
          if (debugSession) {
            const debugInfo = debugService.formatSessionForDisplay(debugSession);
            analyticsResponse += '\n\n---\n\n🔍 **DEBUG INFORMATION**\n\n' + debugInfo;
          }
        }
        
        const aiMessage: DisplayMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: analyticsResponse,
          timestamp: new Date(),
          model: 'analytics'
        };

        // Add AI message to conversation
        if (currentConversation) {
          conversationService.addMessage(currentConversation.id, {
            ...aiMessage,
            role: 'assistant'
          });
        }

        setDisplayMessages(prev => 
          prev.map(msg => 
            msg.isGenerating ? aiMessage : msg
          )
        );

        // Update conversations list
        setConversations(conversationService.getRecentConversations());
        
        // End debug session after response is displayed
        if (debugMode) {
          debugService.endSession();
        }
        return;
      }

      // Check if AI is configured for ChatGPT responses
      if (!isConfigured) {
        // Use fallback response
        let fallbackResponse = getBrandMessage('help');
        
        // Add debug information if debug mode is enabled and no analytics result was found
        if (debugMode) {
          const debugSession = debugService.getCurrentSession();
          if (debugSession) {
            const debugInfo = debugService.formatSessionForDisplay(debugSession);
            fallbackResponse += '\n\n---\n\n🔍 **DEBUG INFORMATION**\n\n' + debugInfo;
          }
        }
        
        const aiMessage: DisplayMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: fallbackResponse,
          timestamp: new Date()
        };

        setDisplayMessages(prev => 
          prev.map(msg => 
            msg.isGenerating ? aiMessage : msg
          )
        );
        
        // End debug session after response is displayed
        if (debugMode) {
          debugService.endSession();
        }
        return;
      }

      // Get conversation context
      const context = conversationService.getConversationContext(currentConversation.id);

      // Start debug session for ChatGPT responses if debug mode is enabled
      if (debugMode) {
        debugService.startSession(message);
      }

      // Generate streaming response
      let fullResponse = '';
      let responseMessage: DisplayMessage | null = null;

      await chatGPTService.generateStreamingResponse(
        context,
        selectedModel,
        (chunk: string) => {
          fullResponse += chunk;
          
          // Update the generating message with new content
          setDisplayMessages(prev => 
            prev.map(msg => 
              msg.isGenerating 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (response: ChatResponse) => {
          // Create the final AI message
          let finalContent = response.content;
          
          // Add debug information if debug mode is enabled
          if (debugMode) {
            const debugSession = debugService.getCurrentSession();
            if (debugSession) {
              const debugInfo = debugService.formatSessionForDisplay(debugSession);
              finalContent += '\n\n---\n\n🔍 **DEBUG INFORMATION**\n\n' + debugInfo;
            }
          }
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: finalContent,
            timestamp: new Date(),
            model: selectedModel
          };

          // Add AI message to conversation
          conversationService.addMessage(currentConversation.id, aiMessage);
          conversationService.updateConversationStats(currentConversation.id, response.usage, selectedModel);

          // Replace generating message with final response
          const finalDisplayMessage: DisplayMessage = {
            id: aiMessage.id,
            type: 'ai',
            content: finalContent,
            timestamp: new Date(),
            model: selectedModel,
            usage: response.usage
          };

          setDisplayMessages(prev => 
            prev.map(msg => 
              msg.isGenerating ? finalDisplayMessage : msg
            )
          );

          // Update conversations list
          setConversations(conversationService.getRecentConversations());
          
          // End debug session if debug mode is enabled
          if (debugMode) {
            debugService.endSession();
          }
        },
        (error: Error) => {
          console.error('ChatGPT error:', error);
          
          // End debug session if debug mode is enabled
          if (debugMode) {
            debugService.endSession();
          }
          
          const errorMessage: DisplayMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: chatGPTService.getFallbackResponse('error'),
            timestamp: new Date()
          };

          setDisplayMessages(prev => 
            prev.map(msg => 
              msg.isGenerating ? errorMessage : msg
            )
          );

          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      );

      toast({
        title: "Response Generated",
        description: "AI response completed successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Message processing error:', error);
      
      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: chatGPTService.getFallbackResponse('error'),
        timestamp: new Date()
      };

      setDisplayMessages(prev => 
        prev.map(msg => 
          msg.isGenerating ? errorMessage : msg
        )
      );

      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      // End debug session if debug mode is enabled and session is still active
      if (debugMode && debugService.getCurrentSession()) {
        debugService.endSession();
      }
      
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Response copied to clipboard",
      variant: "default",
    });
  };

  const formatAnalyticsResponse = (result: any): string => {
    // Use the friendly response if available, otherwise fall back to technical format
    if (result.friendly_response) {
      return result.friendly_response;
    }
    
    // Fallback to technical format
    const { metric, value, unit, description, calculation, data_points } = result;
    
    let response = `📊 **${metric}**\n\n`;
    response += `**Value:** ${value.toFixed(2)} ${unit}\n\n`;
    response += `**Description:** ${description}\n\n`;
    response += `**Calculation:** ${calculation}\n\n`;
    
    if (Object.keys(data_points).length > 0) {
      response += `**Data Points:**\n`;
      Object.entries(data_points).forEach(([key, value]) => {
        response += `• ${key}: ${value}\n`;
      });
    }
    
    return response;
  };

  const isInitialState = displayMessages.length === 0;

  if (!isConfigured) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-bold">OpenAI API Key Required</h2>
            <p className="text-muted-foreground">
              To use ParcelAce AI, you need to configure your OpenAI API key.
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Add to your <code className="bg-muted px-2 py-1 rounded">.env</code> file:</p>
              <code className="block bg-muted p-3 rounded text-xs">
                VITE_OPENAI_API_KEY=your_openai_api_key_here
              </code>
            </div>
            <Button onClick={() => window.location.reload()}>
              Reload After Configuration
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground flex dark:from-background dark:via-muted/10 dark:to-background overflow-hidden">
      {/* Left Sidebar - Fixed Position */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} min-w-[280px] max-w-[320px] bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-300 ease-in-out lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border bg-sidebar flex-shrink-0">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">ParcelAce AI</span>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full"
              variant="outline"
              onClick={createNewChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant={debugMode ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => setDebugMode(!debugMode)}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {debugMode ? "Debug ON" : "Debug OFF"}
            </Button>
          </div>
          
          {showSettings && (
            <div className="mt-4">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          )}
        </div>

        {/* Chat History - Scrollable */}
        <div className="flex-1 p-4 bg-sidebar overflow-y-auto">
          <div className="text-xs text-sidebar-foreground/60 mb-3 uppercase tracking-wide font-medium">Recent Chats</div>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`flex items-center justify-between p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground transition-all duration-200 hover:shadow-sm ${
                  currentConversation?.id === conversation.id ? 'bg-sidebar-accent' : ''
                }`}
                onClick={() => loadConversation(conversation)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <MessageCircle className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="lg:hidden p-4 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">ParcelAce AI</span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pb-4">
            {isInitialState ? (
              // Initial state with greeting and suggestions
              <div className="flex flex-col items-center justify-center h-full px-8">
                <div className="w-full max-w-4xl mx-auto space-y-6">
                  {/* Greeting */}
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-muted-foreground">
                      Hi there,
                    </h1>
                    <h2 className="text-4xl font-bold">
                      How can I help you with your shipping analytics?
                    </h2>
                  </div>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map((suggestion, index) => (
                      <Card
                        key={index}
                        className="bg-card hover:bg-muted/50 border-border hover:border-border/80 transition-all duration-200 cursor-pointer p-4"
                        onClick={() => handleSuggestionClick(suggestion.title)}
                      >
                        <div className="space-y-2">
                          <div className={`text-xs font-medium ${suggestion.color} uppercase tracking-wide`}>
                            {suggestion.category}
                          </div>
                          <div className="text-foreground text-sm font-medium">
                            {suggestion.title}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Help Link */}
                  <div className="text-center">
                    <button className="text-blue-500 hover:text-blue-600 text-sm flex items-center justify-center space-x-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Ask me anything about your shipping data</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Chat conversation view
              <div className="p-6 space-y-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {displayMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-3 max-w-2xl ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.type === 'user' 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}>
                          {msg.type === 'user' ? (
                            <span className="text-white text-sm font-medium">U</span>
                          ) : (
                            <Sparkles className="w-4 h-4 text-white" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex flex-col space-y-1 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{msg.type === 'user' ? 'You' : 'ParcelAce AI'}</span>
                            <span>{formatTime(msg.timestamp)}</span>
                            {msg.model && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {msg.model}
                              </span>
                            )}
                          </div>
                          
                          <div className={`p-3 rounded-lg ${
                            msg.type === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-foreground'
                          }`}>
                            {msg.isGenerating ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <p className="text-sm">{msg.content || 'Generating...'}</p>
                              </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            )}
                          </div>

                          {/* AI message actions */}
                          {msg.type === 'ai' && !msg.isGenerating && (
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(msg.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-6 border-t border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <Input
                  placeholder="Ask about your shipping analytics..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-1 text-base"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="h-10 w-10 p-0 rounded-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center mt-2">
                AI-powered analytics. Ask me about your shipping data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelAceAI; 