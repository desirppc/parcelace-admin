import { ChatMessage } from './chatGPTService';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  totalTokens: number;
  estimatedCost: number;
}

class ConversationService {
  private storageKey = 'parcelace_ai_conversations';
  private maxConversations = 50;
  private maxMessagesPerConversation = 100;

  // Get all conversations
  getConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const conversations = JSON.parse(stored);
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  // Get a specific conversation
  getConversation(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  // Create a new conversation
  createConversation(title: string, model: string): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model,
      totalTokens: 0,
      estimatedCost: 0
    };

    this.saveConversation(conversation);
    return conversation;
  }

  // Add a message to a conversation
  addMessage(conversationId: string, message: ChatMessage): void {
    const conversations = this.getConversations();
    const conversation = conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add the message
    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    // Limit messages per conversation
    if (conversation.messages.length > this.maxMessagesPerConversation) {
      conversation.messages = conversation.messages.slice(-this.maxMessagesPerConversation);
    }

    // Update title if it's the first user message
    if (message.role === 'user' && conversation.messages.filter(m => m.role === 'user').length === 1) {
      conversation.title = this.generateTitle(message.content);
    }

    this.saveConversation(conversation);
  }

  // Update conversation with usage stats
  updateConversationStats(conversationId: string, usage: any, model: string): void {
    const conversations = this.getConversations();
    const conversation = conversations.find(conv => conv.id === conversationId);
    
    if (conversation) {
      conversation.totalTokens += usage.total_tokens || 0;
      conversation.model = model;
      conversation.updatedAt = new Date();
      
      // Estimate cost (this is a rough calculation)
      const costPer1kTokens = model.includes('gpt-4') ? 0.03 : 0.002;
      conversation.estimatedCost += (usage.total_tokens / 1000) * costPer1kTokens;
      
      this.saveConversation(conversation);
    }
  }

  // Delete a conversation
  deleteConversation(id: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter(conv => conv.id !== id);
    this.saveConversations(filtered);
  }

  // Clear all conversations
  clearAllConversations(): void {
    this.saveConversations([]);
  }

  // Get recent conversations (for sidebar)
  getRecentConversations(limit: number = 10): Conversation[] {
    const conversations = this.getConversations();
    return conversations
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  // Get conversation context (last N messages)
  getConversationContext(conversationId: string, maxMessages: number = 10): ChatMessage[] {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return [];
    
    return conversation.messages.slice(-maxMessages);
  }

  // Generate a title from the first user message
  private generateTitle(content: string): string {
    const words = content.split(' ').slice(0, 6);
    return words.join(' ') + (content.split(' ').length > 6 ? '...' : '');
  }

  // Generate a unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Save a single conversation
  private saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.unshift(conversation);
    }

    // Limit total conversations
    if (conversations.length > this.maxConversations) {
      conversations.splice(this.maxConversations);
    }

    this.saveConversations(conversations);
  }

  // Save all conversations
  private saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  // Export conversations
  exportConversations(): string {
    const conversations = this.getConversations();
    return JSON.stringify(conversations, null, 2);
  }

  // Import conversations
  importConversations(data: string): boolean {
    try {
      const conversations = JSON.parse(data);
      this.saveConversations(conversations);
      return true;
    } catch (error) {
      console.error('Error importing conversations:', error);
      return false;
    }
  }
}

export const conversationService = new ConversationService(); 