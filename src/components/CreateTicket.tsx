
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, X } from 'lucide-react';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';
import FileUploader from './FileUploader';
import { Badge } from '@/components/ui/badge';

const CreateTicket: React.FC = () => {
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    subject: '',
    description: '',
    awbNumbers: [''],
    additionalEmails: [''],
    files: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAWBField = () => {
    setFormData(prev => ({
      ...prev,
      awbNumbers: [...prev.awbNumbers, '']
    }));
  };

  const removeAWBField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      awbNumbers: prev.awbNumbers.filter((_, i) => i !== index)
    }));
  };

  const updateAWBNumber = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      awbNumbers: prev.awbNumbers.map((awb, i) => i === index ? value : awb)
    }));
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: [...prev.additionalEmails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.filter((_, i) => i !== index)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.map((email, i) => i === index ? value : email)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.category || !formData.subCategory || !formData.subject || !formData.description) {
      alert('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Filter out empty AWB numbers
    const validAWBs = formData.awbNumbers.filter(awb => awb.trim() !== '');
    const validEmails = formData.additionalEmails.filter(email => email.trim() !== '');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ticketNumber = `TKT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      alert(`Ticket created successfully! Ticket ID: ${ticketNumber}`);
      
      // Reset form
      setFormData({
        category: '',
        subCategory: '',
        priority: 'medium',
        subject: '',
        description: '',
        awbNumbers: [''],
        additionalEmails: [''],
        files: []
      });
    } catch (error) {
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Support Ticket
          </h1>
          <p className="text-muted-foreground">Get help with your shipment or account issues</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Support Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <CategorySelector
              category={formData.category}
              subCategory={formData.subCategory}
              onCategoryChange={(category) => setFormData(prev => ({ ...prev, category }))}
              onSubCategoryChange={(subCategory) => setFormData(prev => ({ ...prev, subCategory }))}
              disabled={isSubmitting}
            />

            <Separator />

            {/* Subject */}
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                Subject *
              </Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Detailed Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about your issue..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[120px] border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* AWB Numbers */}
            <div>
              <Label className="text-sm font-medium text-foreground">
                AWB Numbers (optional)
              </Label>
              <div className="mt-1 space-y-2">
                {formData.awbNumbers.map((awb, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter AWB number"
                      value={awb}
                      onChange={(e) => updateAWBNumber(index, e.target.value)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                      disabled={isSubmitting}
                    />
                    {formData.awbNumbers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAWBField(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAWBField}
                  className="border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add AWB Number
                </Button>
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-sm font-medium text-foreground">
                Priority
              </Label>
              <div className="mt-1">
                <PrioritySelector
                  value={formData.priority}
                  onValueChange={(priority) => setFormData(prev => ({ ...prev, priority }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Additional Email Addresses */}
            <div>
              <Label className="text-sm font-medium text-foreground">
                Additional Email Recipients (optional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add email addresses to receive updates about this ticket
              </p>
              <div className="space-y-2">
                {formData.additionalEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                      disabled={isSubmitting}
                    />
                    {formData.additionalEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmailField(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmailField}
                  className="border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email Address
                </Button>
              </div>
            </div>

            <Separator />

            {/* File Upload */}
            <div>
              <Label className="text-sm font-medium text-foreground">
                Attachments (optional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload screenshots, documents, or other files that might help us resolve your issue
              </p>
              <FileUploader
                files={formData.files}
                onFilesChange={(files) => setFormData(prev => ({ ...prev, files }))}
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTicket;
