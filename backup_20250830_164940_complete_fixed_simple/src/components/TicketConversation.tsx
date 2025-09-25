
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Paperclip, User, MessageSquare } from 'lucide-react';
import { SupportTicket, TicketMessage } from '@/types/support';
import FileUploader from './FileUploader';

interface TicketConversationProps {
  ticket: SupportTicket;
}

const TicketConversation: React.FC<TicketConversationProps> = ({ ticket }) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock conversation data
  const mockMessages: TicketMessage[] = [
    {
      id: '1',
      ticketId: ticket.id,
      sender: 'customer',
      senderName: 'John Doe',
      message: ticket.description,
      timestamp: ticket.createdAt,
      isRead: true
    },
    {
      id: '2',
      ticketId: ticket.id,
      sender: 'agent',
      senderName: 'Support Agent',
      message: 'Thank you for contacting us. We have received your request and are looking into the pickup delay issue. We will update you within 24 hours with the status.',
      timestamp: new Date('2024-01-15T10:30:00'),
      isRead: true
    },
    {
      id: '3',
      ticketId: ticket.id,
      sender: 'customer',
      senderName: 'John Doe',
      message: 'Hi, any update on this? It has been 2 days now and still no pickup.',
      timestamp: new Date('2024-01-16T14:15:00'),
      isRead: true
    }
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add message to conversation (in real app, this would be handled by state management)
      console.log('Sending message:', {
        message: newMessage,
        attachments: attachments.map(f => f.name),
        ticketId: ticket.id
      });
      
      // Reset form
      setNewMessage('');
      setAttachments([]);
      
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Conversation Thread */}
      <div className="max-h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        {mockMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          mockMessages.map((message, index) => (
            <div key={message.id}>
              <div className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[70%] ${message.sender === 'customer' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={
                      message.sender === 'customer' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }>
                      {message.sender === 'customer' ? 'C' : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`space-y-1 ${message.sender === 'customer' ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{message.senderName}</span>
                      <Badge variant={message.sender === 'customer' ? 'default' : 'secondary'} className="text-xs">
                        {message.sender === 'customer' ? 'Customer' : 'Support'}
                      </Badge>
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'customer' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white dark:bg-gray-800 border'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleDateString()} at {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {index < mockMessages.length - 1 && <Separator className="my-4" />}
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-4">
        <div>
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px] border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
            disabled={isSubmitting}
          />
        </div>

        {/* File Upload */}
        <div>
          <FileUploader
            files={attachments}
            onFilesChange={setAttachments}
            disabled={isSubmitting}
            maxFiles={3}
            maxSizePerFile={5}
          />
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSendMessage}
            disabled={isSubmitting || (!newMessage.trim() && attachments.length === 0)}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white"
          >
            {isSubmitting ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketConversation;
