import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  MessageCircle, 
  Settings, 
  Download, 
  Eye, 
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/config/api';

interface Report {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
  recipients: string;
  previewContent?: string;
  // Additional fields from API settings
  frequency?: string;
  schedulerTime?: string;
  generateReportType?: string;
  emailSetting?: ReportSetting | null;
  whatsappSetting?: ReportSetting | null;
}

interface ApiReport {
  id: number;
  title: string;
  description: string;
}

interface PastReport {
  id: number;
  user_id: number;
  report_id: number;
  report_setting_id: number;
  report_generated_time: string;
  report_path: string;
  sent_reports: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PastReportWithDetails extends PastReport {
  report_title?: string;
  report_description?: string;
  delivery_method?: 'email' | 'whatsapp';
  file_size?: string;
  file_format?: string;
}

interface ReportSetting {
  id: number;
  report_id: number;
  report_title: string;
  type: 'mail' | 'whatsapp';
  email: string | null;
  phone_numbers: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  scheduler_time: string;
  generate_report_type: 'excel' | 'pdf' | 'csv';
  status: 'enabled' | 'disabled';
}

const AdminEmailReports: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('email');
  const [emailMode, setEmailMode] = useState('same');
  const [whatsappMode, setWhatsappMode] = useState('same');
  const [emailTimeMode, setEmailTimeMode] = useState('same');
  const [whatsappTimeMode, setWhatsappTimeMode] = useState('same');
  const [globalEmail, setGlobalEmail] = useState('admin@parcelace.com');
  const [globalWhatsapp, setGlobalWhatsapp] = useState('+91-9876543210');
  const [globalEmailTime, setGlobalEmailTime] = useState('09:00 AM');
  const [globalWhatsappTime, setGlobalWhatsappTime] = useState('09:00 AM');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pastReports, setPastReports] = useState<PastReportWithDetails[]>([]);
  const [pastReportsLoading, setPastReportsLoading] = useState(false);
  const [reportSettings, setReportSettings] = useState<ReportSetting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [emailReports, setEmailReports] = useState<Report[]>([]);
  const [whatsappReports, setWhatsappReports] = useState<Report[]>([]);

  // Fetch reports from API
  useEffect(() => {
    // Sequential API calls to ensure proper data flow
    const initializeData = async () => {
      try {
        console.log('🚀 Starting data initialization...');
        
        // Step 1: Fetch reports first
        console.log('📊 Step 1: Fetching reports...');
        const reportsResult = await fetchReports();
        
        // Check if reports were loaded successfully
        if (!reportsResult || emailReports.length === 0) {
          console.log('⚠️ Reports not loaded, setting fallback reports...');
          const fallbackReports: Report[] = [
            {
              id: 1,
              title: 'Pickup Report',
              description: 'This report provides the data for those AWBs where user can confirmed that they have received the shipment on what\'s app',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Pickup Report')
            },
            {
              id: 2,
              title: 'Financial Report',
              description: 'This report provides the COD data per AWB Basis. This report will include Remittance Code, Remittance Status, Date and other',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Financial Report')
            },
            {
              id: 3,
              title: 'Customer Report',
              description: 'This report provides a detailed list of all transactions (payments, refunds, and adjustments) against every settlement in selected time range',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Customer Report')
            },
            {
              id: 4,
              title: 'Performance Report',
              description: 'This report provides data of those AWBs along with the template name, for which template has not been delivered to users on their what\'s app number.',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Performance Report')
            }
          ];
          
          console.log('🔄 Setting fallback reports with empty recipients:', fallbackReports);
          setEmailReports(fallbackReports);
          setWhatsappReports(fallbackReports);
        }
        
        // Step 2: Fetch report settings after reports are loaded
        console.log('⚙️ Step 2: Fetching report settings...');
        await fetchReportSettings();
        
        // Step 3: Fetch past reports (independent)
        console.log('📋 Step 3: Fetching past reports...');
        fetchPastReports();
        
        console.log('✅ Data initialization completed');
      } catch (error) {
        console.error('❌ Error initializing data:', error);
        
        // Ensure we always have fallback reports
        if (emailReports.length === 0) {
          console.log('🔄 Setting fallback reports due to initialization error...');
          const fallbackReports: Report[] = [
            {
              id: 1,
              title: 'Pickup Report',
              description: 'This report provides the data for those AWBs where user can confirmed that they have received the shipment on what\'s app',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Pickup Report')
            },
            {
              id: 2,
              title: 'Financial Report',
              description: 'This report provides the COD data per AWB Basis. This report will include Remittance Code, Remittance Status, Date and other',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Financial Report')
            },
            {
              id: 3,
              title: 'Customer Report',
              description: 'This report provides a detailed list of all transactions (payments, refunds, and adjustments) against every settlement in selected time range',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Customer Report')
            },
            {
              id: 4,
              title: 'Performance Report',
              description: 'This report provides data of those AWBs along with the template name, for which template has not been delivered to users on their what\'s app number.',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Performance Report')
            }
          ];
          
          setEmailReports(fallbackReports);
          setWhatsappReports(fallbackReports);
        }
      } finally {
        // Always ensure loading is false and we have reports
        setLoading(false);
        if (emailReports.length === 0) {
          console.log('🔄 Final fallback: Ensuring reports are available...');
          const fallbackReports: Report[] = [
            {
              id: 1,
              title: 'Pickup Report',
              description: 'This report provides the data for those AWBs where user can confirmed that they have received the shipment on what\'s app',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Pickup Report')
            },
            {
              id: 2,
              title: 'Financial Report',
              description: 'This report provides the COD data per AWB Basis. This report will include Remittance Code, Remittance Status, Date and other',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Financial Report')
            },
            {
              id: 3,
              title: 'Customer Report',
              description: 'This report provides a detailed list of all transactions (payments, refunds, and adjustments) against every settlement in selected time range',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Customer Report')
            },
            {
              id: 4,
              title: 'Performance Report',
              description: 'This report provides data of those AWBs along with the template name, for which template has not been delivered to users on their what\'s app number.',
              enabled: false,
              recipients: '', // Empty recipients - will be populated from API
              previewContent: generatePreviewContent('Performance Report')
            }
          ];
          
          setEmailReports(fallbackReports);
          setWhatsappReports(fallbackReports);
        }
      }
    };
    
    initializeData();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reports from API...');
      const response = await apiRequest('api/report', 'GET');
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        const apiReports: ApiReport[] = response.data;
        console.log('📊 API Reports:', apiReports);
        
        // Transform API data to component format
        const transformedReports: Report[] = apiReports.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          enabled: false,
          recipients: '', // Empty recipients - will be populated from API settings
          previewContent: generatePreviewContent(report.title)
        }));
        
        console.log('🔄 Transformed Reports:', transformedReports);
        setEmailReports(transformedReports);
        setWhatsappReports(transformedReports);
        
        // Note: Settings will be applied after fetchReportSettings completes
        return true; // Success
      } else {
        console.warn('⚠️ API call failed or no data:', response);
        setError(response.message || 'Failed to fetch reports');
        
        // Fallback: Set default reports if API fails
        const fallbackReports: Report[] = [
          {
            id: 1,
            title: 'Pickup Report',
            description: 'This report provides the data for those AWBs where user can confirmed that they have received the shipment on what\'s app',
            enabled: false,
            recipients: '', // Empty recipients - will be populated from API
            previewContent: generatePreviewContent('Pickup Report')
          },
          {
            id: 2,
            title: 'Financial Report',
            description: 'This report provides the COD data per AWB Basis. This report will include Remittance Code, Remittance Status, Date and other',
            enabled: false,
            recipients: '', // Empty recipients - will be populated from API
            previewContent: generatePreviewContent('Financial Report')
          },
          {
            id: 3,
            title: 'Customer Report',
            description: 'This report provides a detailed list of all transactions (payments, refunds, and adjustments) against every settlement in selected time range',
            enabled: false,
            recipients: '', // Empty recipients - will be populated from API
            previewContent: generatePreviewContent('Customer Report')
          },
          {
            id: 4,
            title: 'Performance Report',
            description: 'This report provides data of those AWBs along with the template name, for which template has not been delivered to users on their what\'s app number.',
            enabled: false,
            recipients: '', // Empty recipients - will be populated from API
            previewContent: generatePreviewContent('Performance Report')
          }
        ];
        
        console.log('🔄 Setting fallback reports:', fallbackReports);
        setEmailReports(fallbackReports);
        setWhatsappReports(fallbackReports);
        
        toast({
          title: "Using Fallback Reports",
          description: "API call failed, showing default reports. Check console for details.",
          variant: "destructive"
        });
        
        return false; // API failed, but fallback set
      }
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError('Network error occurred while fetching reports');
      
      // Fallback: Set default reports on error
      const fallbackReports: Report[] = [
        {
          id: 1,
          title: 'Pickup Report',
          description: 'This report provides the data for those AWBs where user can confirmed that they have received the shipment on what\'s app',
          enabled: false,
          recipients: 'support@parcelace.com',
          previewContent: generatePreviewContent('Pickup Report')
        },
        {
          id: 2,
          title: 'Financial Report',
          description: 'This report provides the COD data per AWB Basis. This report will include Remittance Code, Remittance Status, Date and other',
          enabled: false,
              recipients: 'finance@parcelace.com',
              previewContent: generatePreviewContent('Financial Report')
            },
            {
              id: 3,
              title: 'Customer Report',
              description: 'This report provides a detailed list of all transactions (payments, refunds, and adjustments) against every settlement in selected time range',
              enabled: false,
              recipients: 'customer-success@parcelace.com',
              previewContent: generatePreviewContent('Customer Report')
            },
            {
              id: 4,
              title: 'Performance Report',
              description: 'This report provides data of those AWBs along with the template name, for which template has not been delivered to users on their what\'s app number.',
              enabled: false,
              recipients: 'management@parcelace.com',
              previewContent: generatePreviewContent('Performance Report')
            }
          ];
          
          console.log('🔄 Setting fallback reports on error:', fallbackReports);
          setEmailReports(fallbackReports);
          setWhatsappReports(fallbackReports);
          
          toast({
            title: "Using Fallback Reports",
            description: "Network error occurred, showing default reports. Check console for details.",
            variant: "destructive"
          });
          
          return false; // Error occurred, but fallback set
        } finally {
          setLoading(false);
        }
      };



  const generatePreviewContent = (reportTitle: string): string => {
    const currentDate = new Date().toLocaleDateString();
    
    if (reportTitle === 'Pickup Report') {
      return `🚚 *Parcelace Daily Pickup Report*
📅 Date: ${currentDate}

📦 Total Pickups: 145
✅ Completed: 132
⏳ Pending: 13
❌ Failed: 0

📍 Top Areas:
• Mumbai: 45 pickups
• Delhi: 38 pickups
• Bangalore: 32 pickups

🕐 Next Update: Tomorrow 9:00 AM`;
    } else if (reportTitle === 'Financial Report') {
      return `💰 *Parcelace Financial Summary*
📅 Date: ${currentDate}

💵 Today's Revenue: ₹1,24,500
📈 vs Yesterday: +12%
💳 COD Collections: ₹45,600
🏦 Online Payments: ₹78,900

📊 This Month: ₹15,67,800
🎯 Target: ₹18,00,000 (87%)

💡 Next report: Tomorrow 6:00 PM`;
    } else if (reportTitle === 'Customer Report') {
      return `👥 *Parcelace Customer Report*
📅 Date: ${currentDate}

📊 Total Customers: 2,847
🆕 New This Month: 156
📈 Active Users: 1,892
💳 Transactions: 4,567

📋 Top Categories:
• Electronics: 45%
• Fashion: 28%
• Home & Garden: 27%

🕐 Next Update: Tomorrow 9:00 AM`;
    } else if (reportTitle === 'Performance Report') {
      return `📊 *Parcelace Performance Report*
📅 Date: ${currentDate}

🎯 Template Delivery Status:
✅ Delivered: 1,234
⏳ Pending: 89
❌ Failed: 12

📱 WhatsApp Delivery Rate: 94.2%
📧 Email Delivery Rate: 98.7%
🔔 Push Notification Rate: 91.3%

🏆 Top Performing Templates:
• Order Confirmation: 99.1%
• Shipment Update: 97.8%
• Delivery Notification: 96.5%

🕐 Next Update: Tomorrow 9:00 AM`;
    }
    
    return `📋 *${reportTitle}*
📅 Date: ${currentDate}

📊 Report generated successfully
🕐 Next Update: Tomorrow 9:00 AM`;
  };

  const fetchReportSettings = async () => {
    try {
      setSettingsLoading(true);
      
      console.log('🔍 Fetching report settings from API...');
      const response = await apiRequest('api/report/setting', 'GET');
      console.log('📡 Report Settings API Response:', response);
      
      if (response.success && response.data) {
        const settings: ReportSetting[] = response.data;
        console.log('⚙️ Report Settings:', settings);
        
        setReportSettings(settings);
        
        // Apply settings to reports after they're loaded
        console.log('🔄 Applying settings to reports...');
        applySettingsToReports(settings);
        console.log('✅ Settings applied successfully');
      } else {
        console.warn('⚠️ No report settings found or API error:', response.message);
        setReportSettings([]);
        
        // If no settings, ensure reports are at least visible with defaults
        if (emailReports.length > 0) {
          console.log('🔄 No settings found, using default report states');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching report settings:', err);
      setReportSettings([]);
      
      // If settings fail, ensure reports are at least visible with defaults
      if (emailReports.length > 0) {
        console.log('🔄 Settings fetch failed, using default report states');
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  const applySettingsToReports = (settings: ReportSetting[]) => {
    console.log('🔄 Starting to apply settings to reports...');
    console.log('📊 Current email reports:', emailReports);
    console.log('⚙️ Settings to apply:', settings);
    
    // Expected behavior based on API response:
    // Report 1 (Pickup): Should be enabled for email (status: enabled)
    // Report 2 (Financial): Should be enabled for both email and WhatsApp (status: enabled)
    // Report 3 (Customer): Should be enabled for both email and WhatsApp (status: enabled)  
    // Report 4 (Performance): Should be enabled for email (status: enabled)
    console.log('🎯 Expected enabled states:', {
      'Pickup Report (1)': { email: true, whatsapp: false },
      'Financial Report (2)': { email: true, whatsapp: true },
      'Customer Report (3)': { email: true, whatsapp: true },
      'Performance Report (4)': { email: true, whatsapp: false }
    });
    
    // Apply settings to email reports
    const updatedEmailReports = emailReports.map(report => {
      const emailSetting = settings.find(s => s.report_id === report.id && s.type === 'mail');
      const whatsappSetting = settings.find(s => s.report_id === report.id && s.type === 'whatsapp');
      
      console.log(`📧 Processing email report ${report.id} (${report.title}):`, { emailSetting, whatsappSetting });
      
      // Create enhanced report with all settings
      const updatedReport = {
        ...report,
        // Email settings - enable if there's an enabled email setting
        enabled: emailSetting ? emailSetting.status === 'enabled' : false,
        recipients: emailSetting?.email || report.recipients,
        // Additional settings for UI display
        frequency: emailSetting?.frequency || 'daily',
        schedulerTime: emailSetting?.scheduler_time || '09:00 AM',
        generateReportType: emailSetting?.generate_report_type || 'excel',
        // Store full settings for UI rendering
        emailSetting: emailSetting || null,
        whatsappSetting: whatsappSetting || null
      };
      
      // Debug: Log the recipients update
      console.log(`📧 Report ${report.id} recipients processing:`, {
        reportTitle: report.title,
        originalRecipients: report.recipients,
        apiEmail: emailSetting?.email,
        finalRecipients: updatedReport.recipients,
        emailSetting: emailSetting
      });
      
      // Debug: Log the enabled state decision
      console.log(`📧 Report ${report.id} enabled state:`, {
        reportId: report.id,
        reportTitle: report.title,
        emailSetting: emailSetting?.status,
        finalEnabled: updatedReport.enabled
      });
      
      // Debug logging
      console.log(`📧 Report ${report.id} settings:`, {
        original: report,
        emailSetting,
        enabled: emailSetting ? emailSetting.status === 'enabled' : false,
        updatedReport
      });
      
      console.log(`✅ Updated email report ${report.id}:`, updatedReport);
      return updatedReport;
    });
    
    console.log('📧 Final updated email reports:', updatedEmailReports);
    setEmailReports(updatedEmailReports);

    // Apply settings to WhatsApp reports (same data, different view)
    const updatedWhatsAppReports = updatedEmailReports.map(report => {
      const emailSetting = settings.find(s => s.report_id === report.id && s.type === 'mail');
      const whatsappSetting = settings.find(s => s.report_id === report.id && s.type === 'whatsapp');
      
      console.log(`📱 Processing WhatsApp report ${report.id} (${report.title}):`, { emailSetting, whatsappSetting });
      
      // Create enhanced report with all settings
      const updatedReport = {
        ...report,
        // WhatsApp settings - enable if there's an enabled WhatsApp setting
        enabled: whatsappSetting ? whatsappSetting.status === 'enabled' : false,
        recipients: whatsappSetting?.phone_numbers || report.recipients,
        // Additional settings for UI display
        frequency: whatsappSetting?.frequency || 'daily',
        schedulerTime: whatsappSetting?.scheduler_time || '09:00 AM',
        generateReportType: whatsappSetting?.generate_report_type || 'excel',
        // Store full settings for UI rendering
        emailSetting: emailSetting || null,
        whatsappSetting: whatsappSetting || null
      };
      
      // Debug: Log the recipients update
      console.log(`📱 Report ${report.id} WhatsApp recipients processing:`, {
        reportTitle: report.title,
        originalRecipients: report.recipients,
        apiPhoneNumbers: whatsappSetting?.phone_numbers,
        finalRecipients: updatedReport.recipients,
        whatsappSetting: whatsappSetting
      });
      
      // Debug logging
      console.log(`📱 Report ${report.id} WhatsApp settings:`, {
        original: report,
        whatsappSetting,
        enabled: whatsappSetting ? whatsappSetting.status === 'enabled' : false,
        updatedReport
      });
      
      // Debug: Log the enabled state decision
      console.log(`📱 Report ${report.id} WhatsApp enabled state:`, {
        reportId: report.id,
        reportTitle: report.title,
        whatsappSetting: whatsappSetting?.status,
        finalEnabled: updatedReport.enabled
      });
      
      console.log(`✅ Updated WhatsApp report ${report.id}:`, updatedReport);
      return updatedReport;
    });
    
    console.log('📱 Final updated WhatsApp reports:', updatedWhatsAppReports);
    setWhatsappReports(updatedWhatsAppReports);

    // Update global settings based on most common values
    console.log('🌐 Updating global settings...');
    updateGlobalSettings(settings);
    console.log('✅ Settings application completed');
  };

  const updateGlobalSettings = (settings: ReportSetting[]) => {
    // Determine most common frequency
    const frequencies = settings.map(s => s.frequency);
    const mostCommonFrequency = frequencies.sort((a, b) => 
      frequencies.filter(v => v === a).length - frequencies.filter(v => v === b).length
    ).pop() || 'daily';

    // Determine most common time
    const times = settings.map(s => s.scheduler_time);
    const mostCommonTime = times.sort((a, b) => 
      times.filter(v => v === a).length - times.filter(v => v === b).length
    ).pop() || '09:00 AM';

    // Determine most common format
    const formats = settings.map(s => s.generate_report_type);
    const mostCommonFormat = formats.sort((a, b) => 
      formats.filter(v => v === a).length - formats.filter(v => v === b).length
    ).pop() || 'excel';

    // Update global settings (you can add state for these if needed)
    console.log('Global settings updated:', { mostCommonFrequency, mostCommonTime, mostCommonFormat });
    
    // Auto-detect if we have different emails/numbers and set mode accordingly
    autoDetectConfigurationMode(settings);
  };
  
  const autoDetectConfigurationMode = (settings: ReportSetting[]) => {
    // Check for different emails in email settings
    const emailSettings = settings.filter(s => s.type === 'mail' && s.status === 'enabled');
    const uniqueEmails = [...new Set(emailSettings.map(s => s.email))];
    
    if (uniqueEmails.length > 1) {
      console.log('🔍 Multiple different emails detected, setting email mode to "different"');
      setEmailMode('different');
    }
    
    // Check for different phone numbers in WhatsApp settings
    const whatsappSettings = settings.filter(s => s.type === 'whatsapp' && s.status === 'enabled');
    const uniquePhoneNumbers = [...new Set(whatsappSettings.map(s => s.phone_numbers))];
    
    if (uniquePhoneNumbers.length > 1) {
      console.log('🔍 Multiple different phone numbers detected, setting WhatsApp mode to "different"');
      setWhatsappMode('different');
    }
    
    // Check for different times in email settings
    const uniqueEmailTimes = [...new Set(emailSettings.map(s => s.scheduler_time))];
    if (uniqueEmailTimes.length > 1) {
      console.log('🔍 Multiple different email times detected, setting email time mode to "different"');
      setEmailTimeMode('different');
    }
    
    // Check for different times in WhatsApp settings
    const uniqueWhatsappTimes = [...new Set(whatsappSettings.map(s => s.scheduler_time))];
    if (uniqueWhatsappTimes.length > 1) {
      console.log('🔍 Multiple different WhatsApp times detected, setting WhatsApp time mode to "different"');
      setWhatsappTimeMode('different');
    }
    
    // Set global values based on most common
    if (uniqueEmails.length === 1) {
      setGlobalEmail(uniqueEmails[0] || 'admin@parcelace.com');
    }
    if (uniquePhoneNumbers.length === 1) {
      setGlobalWhatsapp(uniquePhoneNumbers[0] || '+91-9876543210');
    }
    if (uniqueEmailTimes.length === 1) {
      setGlobalEmailTime(uniqueEmailTimes[0] || '09:00 AM');
    }
    if (uniqueWhatsappTimes.length === 1) {
      setGlobalWhatsappTime(uniqueWhatsappTimes[0] || '09:00 AM');
    }
  };

  const fetchPastReports = async () => {
    try {
      setPastReportsLoading(true);
      
      const response = await apiRequest('api/report/user-log', 'GET');
      
      if (response.success && response.data) {
        // Transform the API response to include additional details
        const transformedPastReports: PastReportWithDetails[] = Array.isArray(response.data) 
          ? response.data.map((report: PastReport) => ({
              ...report,
              report_title: getReportTitleById(report.report_id),
              delivery_method: determineDeliveryMethod(report.sent_reports),
              file_size: getFileSizeFromPath(report.report_path),
              file_format: getFileFormatFromPath(report.report_path)
            }))
          : [{
              ...response.data,
              report_title: getReportTitleById(response.data.report_id),
              delivery_method: determineDeliveryMethod(response.data.sent_reports),
              file_size: getFileSizeFromPath(response.data.report_path),
              file_format: getFileFormatFromPath(response.data.report_path)
            }];
        
        setPastReports(transformedPastReports);
      } else {
        console.warn('No past reports found or API error:', response.message);
        setPastReports([]);
      }
    } catch (err) {
      console.error('Error fetching past reports:', err);
      setPastReports([]);
    } finally {
      setPastReportsLoading(false);
    }
  };

  const getReportTitleById = (reportId: number): string => {
    const report = emailReports.find(r => r.id === reportId);
    return report ? report.title : 'Unknown Report';
  };

  const determineDeliveryMethod = (sentReports: string): 'email' | 'whatsapp' => {
    // If it contains @ symbol, it's an email
    if (sentReports.includes('@')) {
      return 'email';
    }
    // If it contains + or numbers, it's likely WhatsApp
    if (sentReports.includes('+') || /^\d/.test(sentReports)) {
      return 'whatsapp';
    }
    // Default to email
    return 'email';
  };

  const getFileSizeFromPath = (filePath: string): string => {
    // Extract file extension and estimate size
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return '0.1 MB';
    if (extension === 'xlsx' || extension === 'xls') return '2.3 MB';
    if (extension === 'pdf') return '1.8 MB';
    return '1.0 MB';
  };

  const getFileFormatFromPath = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return 'CSV';
    if (extension === 'xlsx' || extension === 'xls') return 'Excel';
    if (extension === 'pdf') return 'PDF';
    return 'Unknown';
  };

  const handleDownloadReport = (report: PastReportWithDetails) => {
    // In a real implementation, this would trigger the actual download
    // For now, we'll show a toast notification
    toast({
      title: "Download Started",
      description: `Downloading ${report.report_title} (${report.file_format})`,
    });
    
    // You can implement actual download logic here:
    // - Create a download link with the report_path
    // - Use the browser's download API
    // - Or make an API call to get the file content
    
    console.log('Downloading report:', {
      id: report.id,
      path: report.report_path,
      format: report.file_format,
      title: report.report_title
    });
  };

  const toggleReport = (reportId: number, type: 'email' | 'whatsapp') => {
    console.log(`🔄 Toggling report ${reportId} for ${type}:`);
    
    if (type === 'email') {
      setEmailReports(prev => {
        const updated = prev.map(report => 
          report.id === reportId ? { ...report, enabled: !report.enabled } : report
        );
        const toggledReport = updated.find(r => r.id === reportId);
        console.log(`📧 Email report ${reportId} toggled:`, {
          from: prev.find(r => r.id === reportId)?.enabled,
          to: toggledReport?.enabled,
          report: toggledReport
        });
        return updated;
      });
    } else {
      setWhatsappReports(prev => {
        const updated = prev.map(report => 
          report.id === reportId ? { ...report, enabled: !report.enabled } : report
        );
        const toggledReport = updated.find(r => r.id === reportId);
        console.log(`📱 WhatsApp report ${reportId} toggled:`, {
          from: prev.find(r => r.id === reportId)?.enabled,
          to: toggledReport?.enabled,
          report: toggledReport
        });
        return updated;
      });
    }
    };
  
  const handleEmailModeChange = (mode: 'same' | 'different') => {
    setEmailMode(mode);
    if (mode === 'same') {
      // Auto-populate all enabled email reports with global email
      setEmailReports(prev => prev.map(report => 
        report.enabled ? { ...report, recipients: globalEmail } : report
      ));
      console.log(`📧 Email mode changed to "same", populated all reports with: ${globalEmail}`);
    }
  };
  
  const handleWhatsappModeChange = (mode: 'same' | 'different') => {
    setWhatsappMode(mode);
    if (mode === 'same') {
      // Auto-populate all enabled WhatsApp reports with global WhatsApp number
      setWhatsappReports(prev => prev.map(report => 
        report.enabled ? { ...report, recipients: globalWhatsapp } : report
      ));
      console.log(`📱 WhatsApp mode changed to "same", populated all reports with: ${globalWhatsapp}`);
    }
  };
  
  const handleEmailTimeModeChange = (mode: 'same' | 'different') => {
    setEmailTimeMode(mode);
    if (mode === 'same') {
      // Auto-populate all enabled email reports with global email time
      setEmailReports(prev => prev.map(report => 
        report.enabled ? { ...report, schedulerTime: globalEmailTime } : report
      ));
      console.log(`📧 Email time mode changed to "same", populated all reports with: ${globalEmailTime}`);
    }
  };
  
  const handleWhatsappTimeModeChange = (mode: 'same' | 'different') => {
    setWhatsappTimeMode(mode);
    if (mode === 'same') {
      // Auto-populate all enabled WhatsApp reports with global WhatsApp time
      setWhatsappReports(prev => prev.map(report => 
        report.enabled ? { ...report, schedulerTime: globalWhatsappTime } : report
      ));
      console.log(`📱 WhatsApp time mode changed to "same", populated all reports with: ${globalWhatsappTime}`);
    }
  };
  
  const openPreviewModal = (content: string) => {
    setPreviewContent(content);
    setPreviewModalOpen(true);
  };

  const saveConfiguration = async (type: 'email' | 'whatsapp') => {
    try {
      setLoading(true);
      
      // Collect all enabled reports for the type
      const reportsToSave = type === 'email' ? emailReports : whatsappReports;
      const enabledReports = reportsToSave.filter(r => r.enabled);
      
      if (enabledReports.length === 0) {
        toast({
          title: "No Reports Selected",
          description: `Please select at least one report to enable ${type === 'email' ? 'email' : 'WhatsApp'} automation.`,
          variant: "destructive"
        });
        return;
      }
      
      // Format data according to API requirements
      const settingsData = enabledReports.map(r => ({
        report_id: r.id,
        type: type === 'email' ? 'mail' : 'whatsapp',
        frequency: type === 'email' ? r.frequency : r.whatsappSetting?.frequency || r.frequency,
        scheduler_time: type === 'email' ? r.schedulerTime : r.whatsappSetting?.scheduler_time || r.schedulerTime,
        generate_report_type: type === 'email' ? r.generateReportType : r.whatsappSetting?.generate_report_type || r.generateReportType,
        status: 'enabled',
        ...(type === 'email' 
          ? { email: r.recipients }
          : { phone_numbers: r.whatsappSetting?.phone_numbers || r.recipients }
        )
      }));
      
      console.log(`Saving ${type} configuration:`, settingsData);
      
      // Make POST request to save settings
      const response = await apiRequest('api/report/setting', 'POST', settingsData);
      
      if (response.success) {
        toast({
          title: "Configuration Saved Successfully",
          description: `${type === 'email' ? 'Email' : 'WhatsApp'} settings have been saved and will take effect immediately.`,
        });
        
        // Refresh the settings to show updated data
        await fetchReportSettings();
        
        // After refreshing, ensure the UI reflects the saved state
        console.log(`🔄 Settings refreshed after ${type} save, current state:`, {
          emailReports: emailReports.map(r => ({ id: r.id, title: r.title, enabled: r.enabled })),
          whatsappReports: whatsappReports.map(r => ({ id: r.id, title: r.title, enabled: r.enabled }))
        });
        
        console.log(`✅ ${type} configuration saved successfully:`, response);
      } else {
        throw new Error(response.message || `Failed to save ${type} configuration`);
      }
      
    } catch (error) {
      console.error(`❌ Error saving ${type} configuration:`, error);
      
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : `Failed to save ${type} configuration. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (reportTitle: string) => {
    if (reportTitle.includes('Pickup')) return <Package className="h-4 w-4 text-blue-600" />;
    if (reportTitle.includes('Financial')) return <DollarSign className="h-4 w-4 text-green-600" />;
    if (reportTitle.includes('Customer')) return <Users className="h-4 w-4 text-purple-600" />;
    if (reportTitle.includes('Performance')) return <TrendingUp className="h-4 w-4 text-orange-600" />;
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automated Email Reports</h1>
          <p className="text-gray-600">Configure automated delivery of reports to your email address</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">Initializing Admin Email Reports...</span>
              </div>
              <div className="text-sm text-gray-500 text-center">
                <div>📊 Fetching available reports...</div>
                <div>⚙️ Loading report settings...</div>
                <div>📋 Preparing configuration interface...</div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error loading reports</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <Button 
              onClick={fetchReports} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-800 font-medium">🔍 Debug Info (Development Only)</span>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>Loading: {loading.toString()}</div>
              <div>Error: {error || 'None'}</div>
              <div>Email Reports Count: {emailReports.length}</div>
              <div>WhatsApp Reports Count: {whatsappReports.length}</div>
              <div>Settings Loading: {settingsLoading.toString()}</div>
              <div>Report Settings Count: {reportSettings.length}</div>
            </div>
          </div>
        )}

        {/* Content - Only show when not loading and no errors */}
        {!loading && !error && (

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Reports
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Configuration Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email Configuration
                    {settingsLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Setup your email preferences for automated reports</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Recipient Configuration</Label>
                    <RadioGroup value={emailMode} onValueChange={handleEmailModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same-email" />
                        <Label htmlFor="same-email" className="text-sm">Send all reports to same email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="different" id="different-email" />
                        <Label htmlFor="different-email" className="text-sm">Different email for each report</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {emailMode === 'same' && (
                    <div className="space-y-2">
                      <Label htmlFor="global-email">Global Email Address</Label>
                      <Input
                        id="global-email"
                        value={globalEmail}
                        onChange={(e) => setGlobalEmail(e.target.value)}
                        placeholder="Enter email addresses (comma separated)"
                      />
                      <p className="text-xs text-gray-500">Use comma to separate multiple emails</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Time Configuration</Label>
                    <RadioGroup value={emailTimeMode} onValueChange={handleEmailTimeModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same-time-email" />
                        <Label htmlFor="same-time-email" className="text-sm">Same time for all reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="different" id="different-time-email" />
                        <Label htmlFor="different-time-email" className="text-sm">Different time for each report</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {emailTimeMode === 'same' && (
                    <div className="space-y-2">
                      <Label>Global Time</Label>
                      <Select value={globalEmailTime} onValueChange={setGlobalEmailTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i === 0 ? 12 : i;
                            const ampm = i < 12 ? 'AM' : 'PM';
                            const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                            const value = `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
                            const display = `${displayHour}:00 ${ampm}`;
                            return (
                              <SelectItem key={i + 1} value={value}>
                                {display}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Report Format</Label>
                    <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                      Excel
                    </div>
                    <p className="text-xs text-gray-500">All reports will be generated in Excel format</p>
                  </div>

                  <Button 
                    onClick={() => saveConfiguration('email')} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Select Reports Section */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      Select Reports to Automate
                      {settingsLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Choose which reports you want to receive automatically via email
                      {settingsLoading && (
                        <span className="ml-2 text-blue-600">(Loading settings...)</span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {emailReports.length > 0 ? (
                      emailReports.map((report) => (
                        <div key={report.id} className="border rounded-2xl p-6 bg-white hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                {getReportIcon(report.title)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                                <p className="text-sm text-gray-600">{report.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={report.enabled}
                              onCheckedChange={() => toggleReport(report.id, 'email')}
                            />
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            {/* Email Settings Section - Always Visible */}
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <h4 className="text-sm font-medium text-blue-700 mb-2">📧 Email Settings</h4>
                              <div className="space-y-3">
                                {/* Recipients - Editable */}
                                <div>
                                  <Label className="text-xs text-blue-600">Recipients</Label>
                                  <Input
                                    placeholder="Enter email addresses (comma separated)"
                                    value={emailMode === 'same' ? globalEmail : (report.emailSetting?.email || report.recipients || '')}
                                    onChange={(e) => {
                                      setEmailReports(prev => prev.map(r => 
                                        r.id === report.id ? { 
                                          ...r, 
                                          recipients: e.target.value,
                                          emailSetting: r.emailSetting ? {
                                            ...r.emailSetting,
                                            email: e.target.value
                                          } : null
                                        } : r
                                      ));
                                    }}
                                    className="text-sm"
                                    disabled={emailMode === 'same'}
                                  />
                                </div>

                                {/* Frequency and Time - Editable on same line */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs text-blue-600">Frequency</Label>
                                    <Select 
                                      value={report.emailSetting?.frequency || report.frequency || 'daily'}
                                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => {
                                        setEmailReports(prev => prev.map(r => 
                                          r.id === report.id ? { 
                                            ...r, 
                                            frequency: value,
                                            emailSetting: r.emailSetting ? {
                                              ...r.emailSetting,
                                              frequency: value
                                            } : null
                                          } : r
                                        ));
                                      }}
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                                                  <div>
                                  <Label className="text-xs text-blue-600">Report Time</Label>
                                  <Select 
                                    value={emailTimeMode === 'same' ? globalEmailTime : (report.emailSetting?.scheduler_time || report.schedulerTime || '09:00 AM')}
                                    onValueChange={(value) => {
                                      console.log(`🕐 Setting time for report ${report.id}:`, {
                                        newValue: value,
                                        currentEmailSetting: report.emailSetting?.scheduler_time,
                                        currentSchedulerTime: report.schedulerTime,
                                        globalTime: globalEmailTime,
                                        timeMode: emailTimeMode
                                      });
                                      setEmailReports(prev => prev.map(r => 
                                        r.id === report.id ? { 
                                          ...r, 
                                          schedulerTime: value,
                                          emailSetting: r.emailSetting ? {
                                            ...r.emailSetting,
                                            scheduler_time: value
                                          } : null
                                        } : r
                                      ));
                                    }}
                                    disabled={emailTimeMode === 'same'}
                                  >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select time" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Array.from({ length: 24 }, (_, i) => {
                                          const hour = i === 0 ? 12 : i;
                                          const ampm = i < 12 ? 'AM' : 'PM';
                                          const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                                          const value = `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
                                          const display = `${displayHour}:00 ${ampm}`;
                                          return (
                                            <SelectItem key={i + 1} value={value}>
                                              {display}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>





                              


                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
                          <p className="text-gray-600 mb-4">
                            {loading ? 'Loading reports...' : 'No reports were found or loaded.'}
                          </p>
                          {!loading && (
                            <Button 
                              onClick={fetchReports} 
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Loader2 className="h-4 w-4" />
                              Reload Reports
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">Automation Summary</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {emailReports.filter(r => r.enabled).length > 0 
                          ? `${emailReports.filter(r => r.enabled).length} reports selected for automation`
                          : 'No reports selected for automation'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* WhatsApp Configuration Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    WhatsApp Configuration
                    {settingsLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Setup your WhatsApp preferences for automated reports</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Recipient Configuration</Label>
                    <RadioGroup value={whatsappMode} onValueChange={handleWhatsappModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same-whatsapp" />
                        <Label htmlFor="same-whatsapp" className="text-sm">Send all reports to same number</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="different" id="different-whatsapp" />
                        <Label htmlFor="different-whatsapp" className="text-sm">Different number for each report</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {whatsappMode === 'same' && (
                    <div className="space-y-2">
                      <Label htmlFor="global-whatsapp">Global WhatsApp Number</Label>
                      <Input
                        id="global-whatsapp"
                        value={globalWhatsapp}
                        onChange={(e) => setGlobalWhatsapp(e.target.value)}
                        placeholder="Enter WhatsApp numbers (comma separated)"
                      />
                      <p className="text-xs text-gray-500">Use comma to separate multiple numbers</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Time Configuration</Label>
                    <RadioGroup value={whatsappTimeMode} onValueChange={handleWhatsappTimeModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same-time-whatsapp" />
                        <Label htmlFor="same-time-whatsapp" className="text-sm">Same time for all reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="different" id="different-time-whatsapp" />
                        <Label htmlFor="different-time-whatsapp" className="text-sm">Different time for each report</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {whatsappTimeMode === 'same' && (
                    <div className="space-y-2">
                      <Label>Global Time</Label>
                      <Select value={globalWhatsappTime} onValueChange={setGlobalWhatsappTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i === 0 ? 12 : i;
                            const ampm = i < 12 ? 'AM' : 'PM';
                            const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                            const value = `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
                            const display = `${displayHour}:00 ${ampm}`;
                            return (
                              <SelectItem key={i + 1} value={value}>
                                {display}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    onClick={() => saveConfiguration('whatsapp')} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Select Reports Section for WhatsApp */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Select Reports to Automate
                    </CardTitle>
                    <p className="text-sm text-gray-600">Choose which reports you want to receive automatically via WhatsApp</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {whatsappReports.map((report) => (
                      <div key={report.id} className="border rounded-2xl p-6 bg-white hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                              {getReportIcon(report.title)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                              <p className="text-sm text-gray-600">{report.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={report.enabled}
                            onCheckedChange={() => toggleReport(report.id, 'whatsapp')}
                          />
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          {/* WhatsApp Settings Section - Always Visible */}
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <h4 className="text-sm font-medium text-green-700 mb-2">📱 WhatsApp Settings</h4>
                            <div className="space-y-3">
                              {/* Recipients - Editable */}
                              <div>
                                <Label className="text-xs text-green-600">Recipients</Label>
                                <Input
                                  placeholder="Enter WhatsApp numbers (comma separated)"
                                  value={whatsappMode === 'same' ? globalWhatsapp : (report.whatsappSetting?.phone_numbers || report.recipients || '')}
                                  onChange={(e) => {
                                    setWhatsappReports(prev => prev.map(r => 
                                      r.id === report.id ? { 
                                        ...r, 
                                        recipients: e.target.value,
                                        whatsappSetting: r.whatsappSetting ? {
                                          ...r.whatsappSetting,
                                          phone_numbers: e.target.value
                                        } : null
                                      } : r
                                    ));
                                  }}
                                  className="text-sm"
                                  disabled={whatsappMode === 'same'}
                                />
                              </div>

                              {/* Frequency and Time - Editable on same line */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs text-green-600">Frequency</Label>
                                  <Select 
                                    value={report.whatsappSetting?.frequency || report.frequency || 'daily'}
                                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => {
                                      setWhatsappReports(prev => prev.map(r => 
                                        r.id === report.id ? { 
                                          ...r, 
                                          frequency: value,
                                          whatsappSetting: r.whatsappSetting ? {
                                            ...r.whatsappSetting,
                                            frequency: value
                                          } : null
                                        } : r
                                      ));
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                                                <div>
                                  <Label className="text-xs text-green-600">Report Time</Label>
                                  <Select 
                                    value={whatsappTimeMode === 'same' ? globalWhatsappTime : (report.whatsappSetting?.scheduler_time || report.schedulerTime || '09:00 AM')}
                                    onValueChange={(value) => {
                                      console.log(`🕐 Setting WhatsApp time for report ${report.id}:`, {
                                        newValue: value,
                                        currentWhatsAppSetting: report.whatsappSetting?.scheduler_time,
                                        currentSchedulerTime: report.schedulerTime,
                                        globalTime: globalWhatsappTime,
                                        timeMode: whatsappTimeMode
                                      });
                                      setWhatsappReports(prev => prev.map(r => 
                                        r.id === report.id ? { 
                                          ...r, 
                                          schedulerTime: value,
                                          whatsappSetting: r.whatsappSetting ? {
                                            ...r.whatsappSetting,
                                            scheduler_time: value
                                          } : null
                                        } : r
                                      ));
                                    }}
                                    disabled={whatsappTimeMode === 'same'}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i === 0 ? 12 : i;
                                        const ampm = i < 12 ? 'AM' : 'PM';
                                        const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                                        const value = `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
                                        const display = `${displayHour}:00 ${ampm}`;
                                        return (
                                          <SelectItem key={i + 1} value={value}>
                                            {display}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Message Preview</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => report.previewContent && openPreviewModal(report.previewContent)}
                              className="inline-flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Preview Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm font-medium text-green-900">Automation Summary</span>
                      </div>
                      <p className="text-sm text-green-700">
                        {whatsappReports.filter(r => r.enabled).length > 0 
                          ? `${whatsappReports.filter(r => r.enabled).length} reports selected for automation`
                          : 'No reports selected for automation'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        )}

        {/* Past Reports Section */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Past Reports
              </CardTitle>
              <p className="text-sm text-gray-600">View and download previously generated reports</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loading State */}
              {pastReportsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading past reports...</span>
                  </div>
                </div>
              )}

              {/* No Reports State */}
              {!pastReportsLoading && pastReports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Past Reports</h3>
                  <p className="text-gray-600">Reports will appear here once they are generated and sent.</p>
                </div>
              )}

              {/* Past Reports List */}
              {!pastReportsLoading && pastReports.length > 0 && pastReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{report.report_title}</h4>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(report.report_generated_time).toLocaleDateString()} • {report.file_format} • {report.file_size}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sent to: {report.sent_reports}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className={`inline-flex items-center gap-1 ${
                        report.delivery_method === 'email' 
                          ? 'border-blue-200 bg-blue-50 text-blue-700' 
                          : 'border-green-200 bg-green-50 text-green-700'
                      }`}
                    >
                      {report.delivery_method === 'email' ? (
                        <Mail className="h-3 w-3 text-blue-600" />
                      ) : (
                        <MessageCircle className="h-3 w-3 text-green-600" />
                      )}
                      {report.delivery_method === 'email' ? 'Email' : 'WhatsApp'}
                    </Badge>
                    <Button 
                      className={`inline-flex items-center gap-2 ${
                        report.delivery_method === 'email'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                      } transition-all duration-300`}
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WhatsApp Message Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <pre className="whitespace-pre-wrap text-sm font-mono">{previewContent}</pre>
          </div>
          <p className="text-sm text-gray-600 mt-4">This is how the message will appear on WhatsApp</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailReports;
