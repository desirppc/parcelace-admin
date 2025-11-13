import React, { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  CheckCircle,
  X,
  AlertTriangle,
  Loader2,
  Star,
  User,
  Eye,
  Edit,
  MapPin,
  ExternalLink,
  MessageCircle,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Mock data structure
interface PhoneNumber {
  number: string;
  confidence: number;
  isPrimary: boolean;
  whatsappNumber?: string;
}

interface FieldExecutive {
  id: string;
  feName: string;
  role: 'FE' | 'TL'; // Field Executive or Team Leader
  phoneNumbers: PhoneNumber[];
  status: 'active' | 'inactive' | 'verified';
}

interface Warehouse {
  id: string;
  warehouseId: string;
  hub: string;
  city: string;
  courierPartner: string;
  googleMapsLink?: string;
  remarks?: string;
  fieldExecutives: FieldExecutive[];
}

// For backward compatibility and table display
interface CourierBoy {
  id: string;
  feName: string;
  role: string;
  hub: string;
  city: string;
  courierPartner: string;
  phoneNumbers: PhoneNumber[];
  warehouseId: string;
  awbNumber: string;
  status: 'active' | 'inactive' | 'verified';
  googleMapsLink?: string;
  remarks?: string;
}

// Warehouse FE Details interface
interface WarehouseFEDetail {
  id: string;
  userId: string;
  email: string;
  warehouseName: string;
  address: string;
  city: string;
  state: string;
  number: string;
  hasNumber: boolean;
  courierPartners: {
    delhivery: boolean;
    xbee: boolean;
    bluedart: boolean;
  };
}

// Generate mock data - Warehouse based structure
const generateMockData = (): { warehouses: Warehouse[], courierBoys: CourierBoy[] } => {
  const hubs = ['Mumbai Hub', 'Delhi Hub', 'Bangalore Hub', 'Chennai Hub', 'Kolkata Hub'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
  const courierPartners = ['Delhivery', 'BlueDart', 'FedEx', 'DTDC', 'XpressBees'];
  const feRoles: ('FE' | 'TL')[] = ['FE', 'TL'];
  const statuses: ('active' | 'inactive' | 'verified')[] = ['active', 'inactive', 'verified'];
  const names = [
    'Rajesh Kumar', 'Amit Sharma', 'Vikash Singh', 'Priya Patel', 'Suresh Yadav',
    'Anjali Desai', 'Rahul Mehta', 'Kavita Joshi', 'Manoj Gupta', 'Sunita Reddy',
    'Deepak Verma', 'Neha Agarwal', 'Ravi Malhotra', 'Pooja Shah', 'Kiran Nair'
  ];

  const warehouses: Warehouse[] = [];
  const courierBoys: CourierBoy[] = [];

  // Create 10-15 warehouses
  const warehouseCount = 12;
  for (let w = 1; w <= warehouseCount; w++) {
    const hub = hubs[Math.floor(Math.random() * hubs.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const courierPartner = courierPartners[Math.floor(Math.random() * courierPartners.length)];
    const warehouseId = `WH${String(Math.floor(Math.random() * 900) + 100)}`;
    
    // Each warehouse has 2-5 FEs
    const feCount = Math.floor(Math.random() * 4) + 2;
    const fieldExecutives: FieldExecutive[] = [];

    for (let f = 0; f < feCount; f++) {
      const feName = names[Math.floor(Math.random() * names.length)];
      const role = feRoles[Math.floor(Math.random() * feRoles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate 1-3 phone numbers with varying confidence
      const phoneCount = Math.floor(Math.random() * 3) + 1;
      const phoneNumbers: PhoneNumber[] = [];
      for (let j = 0; j < phoneCount; j++) {
        phoneNumbers.push({
          number: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          confidence: Math.floor(Math.random() * 100),
          isPrimary: j === 0,
          whatsappNumber: Math.random() > 0.5 ? `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined
        });
      }

      const feId = `fe-${w}-${f + 1}`;
      fieldExecutives.push({
        id: feId,
        feName,
        role,
        phoneNumbers,
        status
      });

      // Also create CourierBoy for table display
      courierBoys.push({
        id: feId,
        feName,
        role: role === 'FE' ? 'Field Executive' : 'Team Leader',
        hub,
        city,
        courierPartner,
        phoneNumbers,
        warehouseId,
        awbNumber: `AWB${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
        status
      });
    }

    warehouses.push({
      id: `wh-${w}`,
      warehouseId,
      hub,
      city,
      courierPartner,
      googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hub}, ${city}`)}`,
      remarks: Math.random() > 0.6 ? `Warehouse notes: ${hub} operations` : undefined,
      fieldExecutives
    });
  }

  return { warehouses, courierBoys };
};

const FENumberPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [courierBoys, setCourierBoys] = useState<CourierBoy[]>([]);
  const [filteredCourierBoys, setFilteredCourierBoys] = useState<CourierBoy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourierPartner, setSelectedCourierPartner] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFEModalOpen, setEditFEModalOpen] = useState(false);
  const [addFEModalOpen, setAddFEModalOpen] = useState(false);
  const [editLocationModalOpen, setEditLocationModalOpen] = useState(false);
  const [editRemarksModalOpen, setEditRemarksModalOpen] = useState(false);
  const [selectedCourierBoy, setSelectedCourierBoy] = useState<CourierBoy | null>(null);
  const [selectedFE, setSelectedFE] = useState<FieldExecutive | null>(null);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<string>('');
  const [editedPhoneNumber, setEditedPhoneNumber] = useState<string>('');
  const [editedFEName, setEditedFEName] = useState<string>('');
  const [editedGoogleMapsLink, setEditedGoogleMapsLink] = useState<string>('');
  const [editedRemarks, setEditedRemarks] = useState<string>('');
  const [editedPhoneWhatsapp, setEditedPhoneWhatsapp] = useState<string>('');
  // Add FE form state
  const [newFEName, setNewFEName] = useState<string>('');
  const [newFENumber, setNewFENumber] = useState<string>('');
  const [newFEWhatsapp, setNewFEWhatsapp] = useState<string>('');
  const [newFERole, setNewFERole] = useState<'FE' | 'TL'>('FE');
  const [newFEConfidence, setNewFEConfidence] = useState<number>(50);
  const [newFEIsPrimary, setNewFEIsPrimary] = useState<boolean>(true);
  // Add FE Number dialog state
  const [addFENumberModalOpen, setAddFENumberModalOpen] = useState(false);
  const [awbNumber, setAwbNumber] = useState<string>('');
  const [fetchingShipmentData, setFetchingShipmentData] = useState(false);
  // Form fields for Add FE Number
  const [feAWB, setFeAWB] = useState<string>('');
  const [feCourierPartner, setFeCourierPartner] = useState<string>('');
  const [feWarehouseName, setFeWarehouseName] = useState<string>('');
  const [feCity, setFeCity] = useState<string>('');
  const [feHubName, setFeHubName] = useState<string>('');
  const [feGmapLocation, setFeGmapLocation] = useState<string>('');
  const [feName, setFeName] = useState<string>('');
  const [feNumber, setFeNumber] = useState<string>('');
  const [feWhatsappNumber, setFeWhatsappNumber] = useState<string>('');
  const [feConfidence, setFeConfidence] = useState<number>(50);
  const [feRemarks, setFeRemarks] = useState<string>('');
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('all-details');
  // Warehouse FE Details state
  const [warehouseFEDetails, setWarehouseFEDetails] = useState<WarehouseFEDetail[]>([]);
  const [warehouseFELoading, setWarehouseFELoading] = useState(false);
  const [selectedWarehouseCourierPartner, setSelectedWarehouseCourierPartner] = useState<string>('all');
  const [warehouseFESearchTerm, setWarehouseFESearchTerm] = useState<string>('');
  const [editWarehouseFEModalOpen, setEditWarehouseFEModalOpen] = useState(false);
  const [addWarehouseFEModalOpen, setAddWarehouseFEModalOpen] = useState(false);
  const [selectedWarehouseFE, setSelectedWarehouseFE] = useState<WarehouseFEDetail | null>(null);
  // Form state for warehouse FE
  const [weUserId, setWeUserId] = useState<string>('');
  const [weEmail, setWeEmail] = useState<string>('');
  const [weWarehouseName, setWeWarehouseName] = useState<string>('');
  const [weAddress, setWeAddress] = useState<string>('');
  const [weCity, setWeCity] = useState<string>('');
  const [weState, setWeState] = useState<string>('');
  const [weNumber, setWeNumber] = useState<string>('');
  const [weCourierPartners, setWeCourierPartners] = useState<{
    delhivery: boolean;
    xbee: boolean;
    bluedart: boolean;
  }>({
    delhivery: false,
    xbee: false,
    bluedart: false
  });

  const { toast } = useToast();

  const courierPartners = ['Delhivery', 'BlueDart', 'FedEx', 'DTDC', 'XpressBees'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
  const hubs = ['Mumbai Hub', 'Delhi Hub', 'Bangalore Hub', 'Chennai Hub', 'Kolkata Hub'];
  const statuses = ['active', 'inactive', 'verified'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const { warehouses: mockWarehouses, courierBoys: mockCourierBoys } = generateMockData();
      setWarehouses(mockWarehouses);
      setCourierBoys(mockCourierBoys);
      setFilteredCourierBoys(mockCourierBoys);
      setLoading(false);
    }, 500);
  }, []);

  // Fetch warehouse FE details
  useEffect(() => {
    if (activeTab === 'warehouse-fe-details') {
      fetchWarehouseFEDetails();
    }
  }, [activeTab]);

  const fetchWarehouseFEDetails = async () => {
    setWarehouseFELoading(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        setWarehouseFELoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      let warehousesData: any[] = [];
      if (data && data.status && data.data && Array.isArray(data.data.warehouses_data)) {
        warehousesData = data.data.warehouses_data;
      } else if (data && Array.isArray(data)) {
        warehousesData = data;
      } else if (data && Array.isArray(data.data)) {
        warehousesData = data.data;
      } else if (data && data.data && Array.isArray(data.data.warehouses)) {
        warehousesData = data.data.warehouses;
      } else if (data && data.warehouses && Array.isArray(data.warehouses)) {
        warehousesData = data.warehouses;
      }

      // Transform warehouse data to WarehouseFEDetail format
      // Filter warehouses where FE number is missing or not associated
      const transformedData: WarehouseFEDetail[] = warehousesData
        .filter((wh: any) => {
          // Filter warehouses without FE numbers or with missing FE numbers
          const hasFENumber = wh.mobile_number || wh.phone_number || wh.field_executive_number;
          return !hasFENumber || !hasFENumber.trim();
        })
        .map((wh: any, index: number) => ({
          id: wh.id?.toString() || `wh-fe-${index}`,
          userId: wh.user_id?.toString() || wh.id?.toString() || '',
          email: wh.email || wh.user_email || '',
          warehouseName: wh.warehouse_name || wh.name || '',
          address: wh.address || wh.warehouse_address || '',
          city: wh.city || '',
          state: wh.state || '',
          number: wh.mobile_number || wh.phone_number || wh.field_executive_number || '',
          hasNumber: !!(wh.mobile_number || wh.phone_number || wh.field_executive_number),
          courierPartners: {
            delhivery: wh.courier_partners?.includes('Delhivery') || wh.delhivery || false,
            xbee: wh.courier_partners?.includes('Xbee') || wh.courier_partners?.includes('XpressBees') || wh.xbee || false,
            bluedart: wh.courier_partners?.includes('BlueDart') || wh.bluedart || false,
          }
        }));

      setWarehouseFEDetails(transformedData);
    } catch (error) {
      console.error('Error fetching warehouse FE details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch warehouse FE details.",
        variant: "destructive",
      });
      setWarehouseFEDetails([]);
    } finally {
      setWarehouseFELoading(false);
    }
  };

  // Filter data
  useEffect(() => {
    let filtered = [...courierBoys];

    // Search filter (AWB, City, Hub, Warehouse ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.awbNumber.toLowerCase().includes(searchLower) ||
        item.city.toLowerCase().includes(searchLower) ||
        item.hub.toLowerCase().includes(searchLower) ||
        item.warehouseId.toLowerCase().includes(searchLower) ||
        item.feName.toLowerCase().includes(searchLower)
      );
    }

    // Courier Partner filter
    if (selectedCourierPartner !== 'all') {
      filtered = filtered.filter(item => item.courierPartner === selectedCourierPartner);
    }

    // City filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(item => item.city === selectedCity);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredCourierBoys(filtered);
  }, [searchTerm, selectedCourierPartner, selectedCity, selectedStatus, courierBoys]);

  const handleViewAll = (courierBoy: CourierBoy) => {
    // Find the warehouse and FE for this courier boy
    const warehouse = warehouses.find(wh => wh.warehouseId === courierBoy.warehouseId);
    if (warehouse) {
      setSelectedWarehouse(warehouse);
      setViewAllModalOpen(true);
    }
  };

  const handleVerify = (courierBoy: CourierBoy, phoneIndex: number) => {
    setSelectedCourierBoy(courierBoy);
    setSelectedPhoneIndex(phoneIndex);
    setVerificationResult('');
    setVerifyModalOpen(true);
  };


  const getGoogleMapsLink = (warehouse: Warehouse) => {
    return warehouse.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${warehouse.hub}, ${warehouse.city}`)}`;
  };

  const handleEditLocation = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditedGoogleMapsLink(warehouse.googleMapsLink || getGoogleMapsLink(warehouse));
    setEditLocationModalOpen(true);
  };

  const handleSaveLocation = () => {
    if (!selectedWarehouse || !editedGoogleMapsLink.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid Google Maps link.",
        variant: "destructive",
      });
      return;
    }

    setWarehouses(prev => prev.map(wh => {
      if (wh.id === selectedWarehouse.id) {
        return { ...wh, googleMapsLink: editedGoogleMapsLink.trim() };
      }
      return wh;
    }));

    toast({
      title: "Location Updated",
      description: "Google Maps link has been updated successfully.",
    });

    setEditLocationModalOpen(false);
    setEditedGoogleMapsLink('');
  };

  const handleEditRemarks = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditedRemarks(warehouse.remarks || '');
    setEditRemarksModalOpen(true);
  };

  const handleSaveRemarks = () => {
    if (!selectedWarehouse) {
      return;
    }

    setWarehouses(prev => prev.map(wh => {
      if (wh.id === selectedWarehouse.id) {
        return { ...wh, remarks: editedRemarks.trim() || undefined };
      }
      return wh;
    }));

    toast({
      title: "Remarks Updated",
      description: "Warehouse remarks have been updated successfully.",
    });

    setEditRemarksModalOpen(false);
    setEditedRemarks('');
  };

  const handleAddFE = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setNewFEName('');
    setNewFENumber('');
    setNewFEWhatsapp('');
    setNewFERole('FE');
    setNewFEConfidence(50);
    setNewFEIsPrimary(true);
    setAddFEModalOpen(true);
  };

  const handleSaveNewFE = () => {
    if (!selectedWarehouse || !newFEName.trim() || !newFENumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter FE name and phone number.",
        variant: "destructive",
      });
      return;
    }

    const newFEId = `fe-${selectedWarehouse.id}-${Date.now()}`;
    const newPhoneNumber: PhoneNumber = {
      number: newFENumber.trim(),
      confidence: newFEConfidence,
      isPrimary: newFEIsPrimary,
      whatsappNumber: newFEWhatsapp.trim() || undefined
    };

    const newFE: FieldExecutive = {
      id: newFEId,
      feName: newFEName.trim(),
      role: newFERole,
      phoneNumbers: [newPhoneNumber],
      status: 'active'
    };

    // Add to warehouse
    setWarehouses(prev => prev.map(wh => {
      if (wh.id === selectedWarehouse.id) {
        return { ...wh, fieldExecutives: [...wh.fieldExecutives, newFE] };
      }
      return wh;
    }));

    // Also add to courierBoys for table display
    const newCourierBoy: CourierBoy = {
      id: newFEId,
      feName: newFEName.trim(),
      role: newFERole === 'FE' ? 'Field Executive' : 'Team Leader',
      hub: selectedWarehouse.hub,
      city: selectedWarehouse.city,
      courierPartner: selectedWarehouse.courierPartner,
      phoneNumbers: [newPhoneNumber],
      warehouseId: selectedWarehouse.warehouseId,
      awbNumber: `AWB${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      status: 'active'
    };

    setCourierBoys(prev => [...prev, newCourierBoy]);

    toast({
      title: "FE Added",
      description: "Field Executive has been added successfully.",
    });

    setAddFEModalOpen(false);
    setNewFEName('');
    setNewFENumber('');
    setNewFEWhatsapp('');
    setNewFERole('FE');
    setNewFEConfidence(50);
    setNewFEIsPrimary(true);
  };

  const handleEditFE = (courierBoy: CourierBoy) => {
    // Find the warehouse and FE
    const warehouse = warehouses.find(wh => wh.warehouseId === courierBoy.warehouseId);
    const fe = warehouse?.fieldExecutives.find(f => f.id === courierBoy.id);
    
    if (warehouse && fe) {
      setSelectedWarehouse(warehouse);
      setSelectedCourierBoy(courierBoy);
      setEditedFEName(fe.feName);
      const primaryPhone = fe.phoneNumbers.find(p => p.isPrimary) || fe.phoneNumbers[0];
      if (primaryPhone) {
        setEditedPhoneNumber(primaryPhone.number);
        setEditedPhoneWhatsapp(primaryPhone.whatsappNumber || '');
        setSelectedPhoneIndex(fe.phoneNumbers.findIndex(p => p === primaryPhone));
      }
      setEditFEModalOpen(true);
    }
  };

  const handleSaveFE = () => {
    if (!selectedWarehouse || !selectedCourierBoy || !editedFEName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }

    setWarehouses(prev => prev.map(wh => {
      if (wh.id === selectedWarehouse.id) {
        const updatedFEs = wh.fieldExecutives.map(fe => {
          if (fe.id === selectedCourierBoy.id) {
            const updatedPhones = fe.phoneNumbers.map((phone, idx) => 
              idx === selectedPhoneIndex 
                ? { 
                    ...phone, 
                    number: editedPhoneNumber.trim(),
                    whatsappNumber: editedPhoneWhatsapp.trim() || undefined
                  }
                : phone
            );
            return {
              ...fe,
              feName: editedFEName.trim(),
              phoneNumbers: updatedPhones
            };
          }
          return fe;
        });
        return { ...wh, fieldExecutives: updatedFEs };
      }
      return wh;
    }));

    // Also update courierBoys for table display
    setCourierBoys(prev => prev.map(cb => {
      if (cb.id === selectedCourierBoy.id) {
        const updatedPhones = cb.phoneNumbers.map((phone, idx) => 
          idx === selectedPhoneIndex 
            ? { 
                ...phone, 
                number: editedPhoneNumber.trim(),
                whatsappNumber: editedPhoneWhatsapp.trim() || undefined
              }
            : phone
        );
        return { 
          ...cb, 
          feName: editedFEName.trim(),
          phoneNumbers: updatedPhones
        };
      }
      return cb;
    }));

    toast({
      title: "FE Details Updated",
      description: "Name, phone number, and WhatsApp have been updated successfully.",
    });

    setEditFEModalOpen(false);
    setEditedFEName('');
    setEditedPhoneNumber('');
    setEditedPhoneWhatsapp('');
  };

  const handleEditPhoneWhatsapp = (courierBoy: CourierBoy, phoneIndex: number) => {
    setSelectedCourierBoy(courierBoy);
    setSelectedPhoneIndex(phoneIndex);
    setEditedPhoneNumber(courierBoy.phoneNumbers[phoneIndex].number);
    setEditedPhoneWhatsapp(courierBoy.phoneNumbers[phoneIndex].whatsappNumber || '');
    setEditModalOpen(true);
  };

  const handleSavePhoneWhatsapp = () => {
    if (!selectedCourierBoy || !editedPhoneNumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    // Find the warehouse and update it
    const warehouse = warehouses.find(wh => wh.warehouseId === selectedCourierBoy.warehouseId);
    if (warehouse) {
      setWarehouses(prev => prev.map(wh => {
        if (wh.id === warehouse.id) {
          const updatedFEs = wh.fieldExecutives.map(fe => {
            if (fe.id === selectedCourierBoy.id) {
              const updatedPhones = fe.phoneNumbers.map((phone, idx) => 
                idx === selectedPhoneIndex 
                  ? { 
                      ...phone, 
                      number: editedPhoneNumber.trim(),
                      whatsappNumber: editedPhoneWhatsapp.trim() || undefined
                    }
                  : phone
              );
              return { ...fe, phoneNumbers: updatedPhones };
            }
            return fe;
          });
          return { ...wh, fieldExecutives: updatedFEs };
        }
        return wh;
      }));
    }

    // Also update courierBoys for table display
    setCourierBoys(prev => prev.map(cb => {
      if (cb.id === selectedCourierBoy.id) {
        const updatedPhones = cb.phoneNumbers.map((phone, idx) => 
          idx === selectedPhoneIndex 
            ? { 
                ...phone, 
                number: editedPhoneNumber.trim(),
                whatsappNumber: editedPhoneWhatsapp.trim() || undefined
              }
            : phone
        );
        return { ...cb, phoneNumbers: updatedPhones };
      }
      return cb;
    }));

    toast({
      title: "Phone Number Updated",
      description: "Phone number and WhatsApp have been updated successfully.",
    });

    setEditModalOpen(false);
    setEditedPhoneNumber('');
    setEditedPhoneWhatsapp('');
  };

  const handleWhatsAppClick = (whatsappNumber: string) => {
    const cleanNumber = whatsappNumber.replace(/\s+/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleSetPrimary = (courierBoyId: string, phoneIndex: number) => {
    setCourierBoys(prev => prev.map(cb => {
      if (cb.id === courierBoyId) {
        const updatedPhones = cb.phoneNumbers.map((phone, idx) => ({
          ...phone,
          isPrimary: idx === phoneIndex
        }));
        return { ...cb, phoneNumbers: updatedPhones };
      }
      return cb;
    }));

    toast({
      title: "Primary Number Updated",
      description: "Primary phone number has been set successfully.",
    });
  };

  const handleSaveVerification = () => {
    if (!selectedCourierBoy || !verificationResult) {
      toast({
        title: "Please Select Verification Result",
        description: "Please select a verification result before saving.",
        variant: "destructive",
      });
      return;
    }

    // Update confidence based on verification result
    let newConfidence = selectedCourierBoy.phoneNumbers[selectedPhoneIndex].confidence;
    
    switch (verificationResult) {
      case 'works':
        newConfidence = Math.min(100, newConfidence + 20);
        break;
      case 'wrong-number':
        newConfidence = Math.max(0, newConfidence - 30);
        break;
      case 'didnt-pick':
        newConfidence = Math.max(0, newConfidence - 10);
        break;
      case 'different-person':
        newConfidence = Math.max(0, newConfidence - 20);
        break;
    }

    setCourierBoys(prev => prev.map(cb => {
      if (cb.id === selectedCourierBoy.id) {
        const updatedPhones = cb.phoneNumbers.map((phone, idx) => 
          idx === selectedPhoneIndex 
            ? { ...phone, confidence: newConfidence }
            : phone
        );
        return { ...cb, phoneNumbers: updatedPhones };
      }
      return cb;
    }));

    toast({
      title: "Verification Saved",
      description: `Confidence score updated to ${newConfidence}%.`,
    });

    setVerifyModalOpen(false);
    setSelectedCourierBoy(null);
    setVerificationResult('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'verified': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  // Fetch shipment data by AWB
  const handleFetchShipmentData = async () => {
    if (!awbNumber.trim()) {
      toast({
        title: "AWB Number Required",
        description: "Please enter an AWB number to fetch shipment details.",
        variant: "destructive",
      });
      return;
    }

    setFetchingShipmentData(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        setFetchingShipmentData(false);
        return;
      }

      // Use AWB as shipmentId for the API call
      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/${awbNumber.trim()}/view-web`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        const isReverse = data.data.order_details?.shipment_mod?.toLowerCase() === 'reverse';
        
        // Auto-populate fields from API response
        setFeAWB(awbNumber.trim());
        setFeCourierPartner(data.data.order_details?.delivery_partner || '');
        
        // For reverse shipments, use customer shipping details instead of warehouse details
        if (isReverse) {
          // Use customer shipping details for warehouse fields
          const shippingName = data.data.customer_details?.shipping_first_name || '';
          const shippingAddress = data.data.customer_details?.shipping_address1 || '';
          // Construct warehouse name from shipping details
          const warehouseName = shippingName ? `${shippingName} - ${shippingAddress}` : shippingAddress || '';
          setFeWarehouseName(warehouseName);
          setFeCity(data.data.customer_details?.shipping_city || '');
        } else {
          // Normal shipment - use warehouse details
          setFeWarehouseName(data.data.warehouse_details?.warehouse_name || '');
          setFeCity(data.data.warehouse_details?.city || data.data.customer_details?.shipping_city || '');
        }
        
        // Find the first tracking entry where status = "Booked"
        const trackingDetails = data.data.trakings_details || [];
        const bookedTracking = trackingDetails.find((track: any) => 
          track.status?.toLowerCase() === 'booked'
        );
        
        if (bookedTracking) {
          setFeHubName(bookedTracking.location || '');
        } else if (trackingDetails.length > 0) {
          // Sort by status_time to get oldest entries
          const sortedTracking = [...trackingDetails].sort((a: any, b: any) => {
            const timeA = new Date(a.status_time || 0).getTime();
            const timeB = new Date(b.status_time || 0).getTime();
            return timeA - timeB;
          });
          
          // For reverse shipments, use 2nd oldest (index 1) as 1st is pickup/RTO warehouse
          // For normal shipments, use oldest (index 0)
          const hubIndex = isReverse && sortedTracking.length > 1 ? 1 : 0;
          setFeHubName(sortedTracking[hubIndex]?.location || '');
        }

        toast({
          title: "Data Fetched",
          description: isReverse 
            ? "Reverse shipment detected. Using customer shipping details and 2nd oldest hub."
            : "Shipment details have been auto-populated.",
        });
      } else {
        // Data not found - allow manual entry
        setFeAWB(awbNumber.trim());
        toast({
          title: "Data Not Found",
          description: "Shipment data not found. Please enter details manually.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching shipment data:', error);
      // On error, still allow manual entry
      setFeAWB(awbNumber.trim());
      toast({
        title: "Error Fetching Data",
        description: "Could not fetch shipment data. Please enter details manually.",
        variant: "default",
      });
    } finally {
      setFetchingShipmentData(false);
    }
  };

  const handleSaveFENumber = () => {
    if (!feAWB.trim() || !feName.trim() || !feNumber.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in AWB, Name, and Number fields.",
        variant: "destructive",
      });
      return;
    }

    // Create new FE entry
    const newFEId = `fe-${Date.now()}`;
    const newPhoneNumber: PhoneNumber = {
      number: feNumber.trim(),
      confidence: feConfidence,
      isPrimary: true,
      whatsappNumber: feWhatsappNumber.trim() || undefined
    };

    const newFE: FieldExecutive = {
      id: newFEId,
      feName: feName.trim(),
      role: 'FE',
      phoneNumbers: [newPhoneNumber],
      status: 'active'
    };

    // Check if warehouse exists, if not create one
    let warehouse = warehouses.find(wh => 
      wh.warehouseId === feWarehouseName || 
      wh.hub === feHubName
    );

    if (!warehouse) {
      // Create new warehouse
      const newWarehouseId = `WH${String(Math.floor(Math.random() * 900) + 100)}`;
      warehouse = {
        id: `wh-${Date.now()}`,
        warehouseId: newWarehouseId,
        hub: feHubName || 'Unknown Hub',
        city: feCity || 'Unknown City',
        courierPartner: feCourierPartner || 'Unknown',
        googleMapsLink: feGmapLocation || undefined,
        remarks: feRemarks || undefined,
        fieldExecutives: [newFE]
      };
      setWarehouses(prev => [...prev, warehouse!]);
    } else {
      // Add FE to existing warehouse
      setWarehouses(prev => prev.map(wh => {
        if (wh.id === warehouse!.id) {
          return { ...wh, fieldExecutives: [...wh.fieldExecutives, newFE] };
        }
        return wh;
      }));
    }

    // Also add to courierBoys for table display
    const newCourierBoy: CourierBoy = {
      id: newFEId,
      feName: feName.trim(),
      role: 'Field Executive',
      hub: warehouse.hub,
      city: warehouse.city,
      courierPartner: warehouse.courierPartner,
      phoneNumbers: [newPhoneNumber],
      warehouseId: warehouse.warehouseId,
      awbNumber: feAWB.trim(),
      status: 'active',
      googleMapsLink: feGmapLocation || undefined,
      remarks: feRemarks || undefined
    };

    setCourierBoys(prev => [...prev, newCourierBoy]);

    toast({
      title: "FE Number Added",
      description: "Field Executive has been added successfully.",
    });

    // Reset and close
    setAddFENumberModalOpen(false);
    setAwbNumber('');
    setFeAWB('');
    setFeCourierPartner('');
    setFeWarehouseName('');
    setFeCity('');
    setFeHubName('');
    setFeGmapLocation('');
    setFeName('');
    setFeNumber('');
    setFeWhatsappNumber('');
    setFeConfidence(50);
    setFeRemarks('');
  };

  // Filter warehouse FE details
  const filteredWarehouseFEDetails = warehouseFEDetails.filter((wh) => {
    // Search filter
    if (warehouseFESearchTerm) {
      const searchLower = warehouseFESearchTerm.toLowerCase();
      if (
        !wh.warehouseName.toLowerCase().includes(searchLower) &&
        !wh.city.toLowerCase().includes(searchLower) &&
        !wh.email.toLowerCase().includes(searchLower) &&
        !wh.userId.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    
    // Courier partner filter
    if (selectedWarehouseCourierPartner !== 'all') {
      const partnerMap: { [key: string]: string } = {
        'Delhivery': 'delhivery',
        'Xbee': 'xbee',
        'XpressBees': 'xbee',
        'BlueDart': 'bluedart'
      };
      const partnerKey = partnerMap[selectedWarehouseCourierPartner];
      if (partnerKey && !wh.courierPartners[partnerKey as keyof typeof wh.courierPartners]) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
          FE Number Management
        </h1>
        <p className="text-muted-foreground mt-1">Search and verify courier boy contact information</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all-details">All Details</TabsTrigger>
            <TabsTrigger value="warehouse-fe-details">Warehouse FE Details</TabsTrigger>
          </TabsList>
          <Button
            onClick={() => {
              setAddFENumberModalOpen(true);
              // Reset form fields
              setAwbNumber('');
              setFeAWB('');
              setFeCourierPartner('');
              setFeWarehouseName('');
              setFeCity('');
              setFeHubName('');
              setFeGmapLocation('');
              setFeName('');
              setFeNumber('');
              setFeWhatsappNumber('');
              setFeConfidence(50);
              setFeRemarks('');
            }}
            className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
          >
            Add FE Number
          </Button>
        </div>

        {/* All Details Tab */}
        <TabsContent value="all-details" className="space-y-6">
          {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-[0.3]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by AWB / City / Hub / Warehouse"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <div className="flex-1"></div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Courier Partner:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedCourierPartner === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCourierPartner('all')}
              className="h-8"
            >
              All
            </Button>
            {courierPartners.map((partner) => (
              <Button
                key={partner}
                variant={selectedCourierPartner === partner ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCourierPartner(partner)}
                className="h-8"
              >
                {partner}
              </Button>
            ))}
          </div>
        </div>

      </div>

      {/* Results */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">AWB</TableHead>
              <TableHead className="w-48">Sender Name</TableHead>
              <TableHead className="w-32">Warehouse Name</TableHead>
              <TableHead className="w-32">City</TableHead>
              <TableHead className="w-32">Courier Partner</TableHead>
              <TableHead className="w-40">Phone Number</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading courier boys...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCourierBoys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>No courier boys found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCourierBoys.map((courierBoy) => (
                <TableRow key={courierBoy.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{courierBoy.awbNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{courierBoy.feName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{courierBoy.warehouseId}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{courierBoy.city}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{courierBoy.courierPartner}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {courierBoy.phoneNumbers.length > 0 && (() => {
                        const primaryPhone = courierBoy.phoneNumbers.find(p => p.isPrimary) || courierBoy.phoneNumbers[0];
                        const primaryIndex = courierBoy.phoneNumbers.findIndex(p => p === primaryPhone);
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-mono text-sm">{primaryPhone.number}</span>
                              <Star 
                                className={`w-3.5 h-3.5 transition-colors ${
                                  primaryPhone.isPrimary 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'
                                }`}
                              />
                              <span className={`text-xs font-semibold ml-auto px-2 py-0.5 rounded ${getConfidenceTextColor(primaryPhone.confidence)} text-white`}>
                                {primaryPhone.confidence}%
                              </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className={`h-full transition-all ${getConfidenceColor(primaryPhone.confidence)}`}
                                style={{ width: `${primaryPhone.confidence}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {courierBoy.phoneNumbers.length > 0 && (() => {
                        const primaryPhone = courierBoy.phoneNumbers.find(p => p.isPrimary) || courierBoy.phoneNumbers[0];
                        const primaryIndex = courierBoy.phoneNumbers.findIndex(p => p === primaryPhone);
                        return (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(courierBoy, primaryIndex)}
                              className="h-8 text-xs px-3"
                              title="Verify"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Verify
                            </Button>
                            {courierBoy.phoneNumbers.length > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewAll(courierBoy)}
                                className="h-8 text-xs px-3"
                                title="View All Numbers"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View All
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewAll(courierBoy)}
                              className="h-8 text-xs px-3"
                              title="View Warehouse Details"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Edit FE
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

          {/* View All Warehouse FEs Modal */}
      <Dialog open={viewAllModalOpen} onOpenChange={setViewAllModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWarehouse && (
                <>
                  Warehouse: {selectedWarehouse.warehouseId} - {selectedWarehouse.hub}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[600px] overflow-y-auto">
            {selectedWarehouse && (
              <div className="space-y-4">
                {/* Warehouse Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{selectedWarehouse.warehouseId}</h3>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddFE(selectedWarehouse)}
                      className="h-8 text-xs px-3 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
                    >
                      <User className="w-3.5 h-3.5 mr-1" />
                      Add FE
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedWarehouse.hub}</span>
                    <span>•</span>
                    <span>{selectedWarehouse.courierPartner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={getGoogleMapsLink(selectedWarehouse)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditLocation(selectedWarehouse)}
                      className="h-6 px-2 text-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  {selectedWarehouse.remarks && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Remarks:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRemarks(selectedWarehouse)}
                          className="h-6 px-2 text-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedWarehouse.remarks}</p>
                    </div>
                  )}
                  {!selectedWarehouse.remarks && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditRemarks(selectedWarehouse)}
                      className="h-7 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Add Remarks
                    </Button>
                  )}
                </div>

                {/* Field Executives */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Field Executives ({selectedWarehouse.fieldExecutives.length})</h4>
                  {selectedWarehouse.fieldExecutives.map((fe) => {
                    const courierBoy = courierBoys.find(cb => cb.id === fe.id);
                    return (
                      <div key={fe.id} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{fe.feName}</span>
                            <Badge variant="outline" className="text-xs">{fe.role}</Badge>
                          </div>
                          {courierBoy && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                handleEditFE(courierBoy);
                              }}
                              className="h-7 text-xs px-2"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit FE
                            </Button>
                          )}
                        </div>
                        {/* Phone Numbers for this FE */}
                        {fe.phoneNumbers.map((phone, index) => {
                          const firstName = fe.feName.split(' ')[0];
                          return (
                            <div 
                              key={index}
                              className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-800/30 rounded border"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="font-semibold text-xs whitespace-nowrap">{firstName}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="font-mono text-xs whitespace-nowrap">{phone.number}</span>
                                {phone.whatsappNumber && (
                                  <>
                                    <span className="text-muted-foreground">-</span>
                                    <MessageCircle 
                                      className="w-3 h-3 text-green-600 flex-shrink-0 cursor-pointer hover:text-green-700" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsAppClick(phone.whatsappNumber!);
                                      }}
                                    />
                                    <span className="font-mono text-xs text-green-600 whitespace-nowrap">{phone.whatsappNumber}</span>
                                  </>
                                )}
                                {phone.isPrimary && (
                                  <>
                                    <span className="text-muted-foreground">-</span>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">Primary</Badge>
                                  </>
                                )}
                                <span className="text-muted-foreground">-</span>
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getConfidenceTextColor(phone.confidence)} text-white whitespace-nowrap`}>
                                  {phone.confidence}%
                                </span>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {courierBoy && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedFE(fe);
                                        setSelectedPhoneIndex(index);
                                        handleEditPhoneWhatsapp(courierBoy, index);
                                      }}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setViewAllModalOpen(false);
                                        handleVerify(courierBoy, index);
                                      }}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Phone/WhatsApp Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Phone Number & WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCourierBoy && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="feName">Field Executive Name</Label>
                  <Input
                    id="feName"
                    value={selectedCourierBoy.feName}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editedPhoneNumber}
                    onChange={(e) => setEditedPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
                  <Input
                    id="whatsappNumber"
                    value={editedPhoneWhatsapp}
                    onChange={(e) => setEditedPhoneWhatsapp(e.target.value)}
                    placeholder="Enter WhatsApp number"
                    className="font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditModalOpen(false);
                      setEditedPhoneNumber('');
                      setEditedPhoneWhatsapp('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePhoneWhatsapp}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit FE Modal */}
      <Dialog open={editFEModalOpen} onOpenChange={setEditFEModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit FE Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCourierBoy && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="feName">Field Executive Name</Label>
                  <Input
                    id="feName"
                    value={editedFEName}
                    onChange={(e) => setEditedFEName(e.target.value)}
                    placeholder="Enter FE name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editedPhoneNumber}
                    onChange={(e) => setEditedPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
                  <Input
                    id="whatsappNumber"
                    value={editedPhoneWhatsapp}
                    onChange={(e) => setEditedPhoneWhatsapp(e.target.value)}
                    placeholder="Enter WhatsApp number"
                    className="font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditFEModalOpen(false);
                      setEditedFEName('');
                      setEditedRemarks('');
                      setEditedPhoneNumber('');
                      setEditedPhoneWhatsapp('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveFE}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Location Modal */}
      <Dialog open={editLocationModalOpen} onOpenChange={setEditLocationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Google Maps Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWarehouse && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Warehouse ID</Label>
                  <Input
                    id="warehouseId"
                    value={selectedWarehouse.warehouseId}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                  <Input
                    id="googleMapsLink"
                    value={editedGoogleMapsLink}
                    onChange={(e) => setEditedGoogleMapsLink(e.target.value)}
                    placeholder="Enter Google Maps link"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditLocationModalOpen(false);
                      setEditedGoogleMapsLink('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveLocation}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Remarks Modal */}
      <Dialog open={editRemarksModalOpen} onOpenChange={setEditRemarksModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Warehouse Remarks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWarehouse && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Warehouse ID</Label>
                  <Input
                    id="warehouseId"
                    value={selectedWarehouse.warehouseId}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={editedRemarks}
                    onChange={(e) => setEditedRemarks(e.target.value)}
                    placeholder="Enter remarks or notes about this warehouse..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditRemarksModalOpen(false);
                      setEditedRemarks('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveRemarks}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add FE Modal */}
      <Dialog open={addFEModalOpen} onOpenChange={setAddFEModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Field Executive</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWarehouse && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Warehouse ID</Label>
                  <Input
                    id="warehouseId"
                    value={selectedWarehouse.warehouseId}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feName">Name *</Label>
                  <Input
                    id="feName"
                    value={newFEName}
                    onChange={(e) => setNewFEName(e.target.value)}
                    placeholder="Enter FE name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feNumber">Phone Number *</Label>
                  <Input
                    id="feNumber"
                    value={newFENumber}
                    onChange={(e) => setNewFENumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feWhatsapp">WhatsApp Number</Label>
                  <Input
                    id="feWhatsapp"
                    value={newFEWhatsapp}
                    onChange={(e) => setNewFEWhatsapp(e.target.value)}
                    placeholder="Enter WhatsApp number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feRole">Role *</Label>
                  <Select value={newFERole} onValueChange={(value: 'FE' | 'TL') => setNewFERole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FE">Field Executive (FE)</SelectItem>
                      <SelectItem value="TL">Team Leader (TL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feConfidence">Confidence (%)</Label>
                  <Input
                    id="feConfidence"
                    type="number"
                    min="0"
                    max="100"
                    value={newFEConfidence}
                    onChange={(e) => setNewFEConfidence(parseInt(e.target.value) || 0)}
                    placeholder="Enter confidence (0-100)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="feIsPrimary"
                    checked={newFEIsPrimary}
                    onCheckedChange={(checked) => setNewFEIsPrimary(checked === true)}
                  />
                  <Label
                    htmlFor="feIsPrimary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Set as Primary (Favorite)
                  </Label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddFEModalOpen(false);
                      setNewFEName('');
                      setNewFENumber('');
                      setNewFEWhatsapp('');
                      setNewFERole('FE');
                      setNewFEConfidence(50);
                      setNewFEIsPrimary(true);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNewFE}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    Add FE
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add FE Number Modal */}
      <Dialog open={addFENumberModalOpen} onOpenChange={setAddFENumberModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add FE Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* AWB Input and Fetch Button */}
            <div className="space-y-2">
              <Label htmlFor="awbNumber">AWB Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="awbNumber"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="Enter AWB number"
                  className="font-mono flex-1"
                  disabled={fetchingShipmentData}
                />
                <Button
                  onClick={handleFetchShipmentData}
                  disabled={fetchingShipmentData || !awbNumber.trim()}
                  className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
                >
                  {fetchingShipmentData ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    'Fetch Data'
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feAWB">AWB *</Label>
                  <Input
                    id="feAWB"
                    value={feAWB}
                    onChange={(e) => setFeAWB(e.target.value)}
                    placeholder="AWB Number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feCourierPartner">Courier Partner</Label>
                  <Input
                    id="feCourierPartner"
                    value={feCourierPartner}
                    onChange={(e) => setFeCourierPartner(e.target.value)}
                    placeholder="Courier Partner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feWarehouseName">Warehouse Name</Label>
                  <Input
                    id="feWarehouseName"
                    value={feWarehouseName}
                    onChange={(e) => setFeWarehouseName(e.target.value)}
                    placeholder="Warehouse Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feCity">City</Label>
                  <Input
                    id="feCity"
                    value={feCity}
                    onChange={(e) => setFeCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feHubName">Hub Name</Label>
                  <Input
                    id="feHubName"
                    value={feHubName}
                    onChange={(e) => setFeHubName(e.target.value)}
                    placeholder="Hub Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feGmapLocation">Gmap Location</Label>
                  <Input
                    id="feGmapLocation"
                    value={feGmapLocation}
                    onChange={(e) => setFeGmapLocation(e.target.value)}
                    placeholder="Google Maps Link"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feName">Name *</Label>
                  <Input
                    id="feName"
                    value={feName}
                    onChange={(e) => setFeName(e.target.value)}
                    placeholder="Field Executive Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feNumber">Number *</Label>
                  <Input
                    id="feNumber"
                    value={feNumber}
                    onChange={(e) => setFeNumber(e.target.value)}
                    placeholder="Phone Number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feWhatsappNumber">WhatsApp Number (Optional)</Label>
                  <Input
                    id="feWhatsappNumber"
                    value={feWhatsappNumber}
                    onChange={(e) => setFeWhatsappNumber(e.target.value)}
                    placeholder="WhatsApp Number"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feConfidence">Confidence</Label>
                  <Input
                    id="feConfidence"
                    type="number"
                    min="0"
                    max="100"
                    value={feConfidence}
                    onChange={(e) => setFeConfidence(parseInt(e.target.value) || 0)}
                    placeholder="Confidence (0-100)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feRemarks">Remarks</Label>
                <Textarea
                  id="feRemarks"
                  value={feRemarks}
                  onChange={(e) => setFeRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddFENumberModalOpen(false);
                  setAwbNumber('');
                  setFeAWB('');
                  setFeCourierPartner('');
                  setFeWarehouseName('');
                  setFeCity('');
                  setFeHubName('');
                  setFeGmapLocation('');
                  setFeName('');
                  setFeNumber('');
                  setFeWhatsappNumber('');
                  setFeConfidence(50);
                  setFeRemarks('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFENumber}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
              >
                Save FE Number
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        </TabsContent>

        {/* Warehouse FE Details Tab */}
        <TabsContent value="warehouse-fe-details" className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-[0.3]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by Warehouse / City / Email / User ID"
                value={warehouseFESearchTerm}
                onChange={(e) => setWarehouseFESearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Courier Partner:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedWarehouseCourierPartner === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedWarehouseCourierPartner('all')}
                  className="h-8"
                >
                  All
                </Button>
                <Button
                  variant={selectedWarehouseCourierPartner === 'Delhivery' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedWarehouseCourierPartner('Delhivery')}
                  className="h-8"
                >
                  Delhivery
                </Button>
                <Button
                  variant={selectedWarehouseCourierPartner === 'Xbee' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedWarehouseCourierPartner('Xbee')}
                  className="h-8"
                >
                  Xbee
                </Button>
                <Button
                  variant={selectedWarehouseCourierPartner === 'BlueDart' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedWarehouseCourierPartner('BlueDart')}
                  className="h-8"
                >
                  BlueDart
                </Button>
              </div>
            </div>
          </div>

          {/* Warehouse FE Details Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">User ID</TableHead>
                  <TableHead className="w-48">Email</TableHead>
                  <TableHead className="w-48">Warehouse Name</TableHead>
                  <TableHead className="w-64">Address</TableHead>
                  <TableHead className="w-32">City</TableHead>
                  <TableHead className="w-32">State</TableHead>
                  <TableHead className="w-32">Number</TableHead>
                  <TableHead className="w-24">Number (Yes/No)</TableHead>
                  <TableHead className="w-48">Courier Partner</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseFELoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading warehouse FE details...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredWarehouseFEDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-gray-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p>No warehouse FE details found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarehouseFEDetails.map((warehouseFE) => (
                    <TableRow key={warehouseFE.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{warehouseFE.userId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{warehouseFE.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{warehouseFE.warehouseName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{warehouseFE.address}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{warehouseFE.city}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{warehouseFE.state}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{warehouseFE.number || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={warehouseFE.hasNumber ? "default" : "secondary"}>
                          {warehouseFE.hasNumber ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {warehouseFE.courierPartners.delhivery && (
                            <Badge variant="outline" className="text-xs">Delhivery</Badge>
                          )}
                          {warehouseFE.courierPartners.xbee && (
                            <Badge variant="outline" className="text-xs">Xbee</Badge>
                          )}
                          {warehouseFE.courierPartners.bluedart && (
                            <Badge variant="outline" className="text-xs">BlueDart</Badge>
                          )}
                          {!warehouseFE.courierPartners.delhivery && 
                           !warehouseFE.courierPartners.xbee && 
                           !warehouseFE.courierPartners.bluedart && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWarehouseFE(warehouseFE);
                              setWeUserId(warehouseFE.userId);
                              setWeEmail(warehouseFE.email);
                              setWeWarehouseName(warehouseFE.warehouseName);
                              setWeAddress(warehouseFE.address);
                              setWeCity(warehouseFE.city);
                              setWeState(warehouseFE.state);
                              setWeNumber(warehouseFE.number);
                              setWeCourierPartners(warehouseFE.courierPartners);
                              setEditWarehouseFEModalOpen(true);
                            }}
                            className="h-8 text-xs px-3"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWarehouseFE(warehouseFE);
                              setWeUserId(warehouseFE.userId);
                              setWeEmail(warehouseFE.email);
                              setWeWarehouseName(warehouseFE.warehouseName);
                              setWeAddress(warehouseFE.address);
                              setWeCity(warehouseFE.city);
                              setWeState(warehouseFE.state);
                              setWeNumber(warehouseFE.number);
                              setWeCourierPartners(warehouseFE.courierPartners);
                              setAddWarehouseFEModalOpen(true);
                            }}
                            className="h-8 text-xs px-3 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
                          >
                            <User className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Warehouse FE Modal */}
      <Dialog open={addWarehouseFEModalOpen || editWarehouseFEModalOpen} onOpenChange={(open) => {
        if (!open) {
          setAddWarehouseFEModalOpen(false);
          setEditWarehouseFEModalOpen(false);
          setSelectedWarehouseFE(null);
          setWeUserId('');
          setWeEmail('');
          setWeWarehouseName('');
          setWeAddress('');
          setWeCity('');
          setWeState('');
          setWeNumber('');
          setWeCourierPartners({ delhivery: false, xbee: false, bluedart: false });
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editWarehouseFEModalOpen ? 'Edit Warehouse FE' : 'Add Warehouse FE'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weUserId">User ID</Label>
                <Input
                  id="weUserId"
                  value={weUserId}
                  onChange={(e) => setWeUserId(e.target.value)}
                  placeholder="User ID"
                  disabled={editWarehouseFEModalOpen}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weEmail">Email</Label>
                <Input
                  id="weEmail"
                  value={weEmail}
                  onChange={(e) => setWeEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weWarehouseName">Warehouse Name</Label>
                <Input
                  id="weWarehouseName"
                  value={weWarehouseName}
                  onChange={(e) => setWeWarehouseName(e.target.value)}
                  placeholder="Warehouse Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weAddress">Address</Label>
                <Input
                  id="weAddress"
                  value={weAddress}
                  onChange={(e) => setWeAddress(e.target.value)}
                  placeholder="Address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weCity">City</Label>
                <Input
                  id="weCity"
                  value={weCity}
                  onChange={(e) => setWeCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weState">State</Label>
                <Input
                  id="weState"
                  value={weState}
                  onChange={(e) => setWeState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weNumber">Number</Label>
                <Input
                  id="weNumber"
                  value={weNumber}
                  onChange={(e) => setWeNumber(e.target.value)}
                  placeholder="Phone Number"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Courier Partners</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="we-delhivery"
                    checked={weCourierPartners.delhivery}
                    onCheckedChange={(checked) =>
                      setWeCourierPartners(prev => ({ ...prev, delhivery: checked === true }))
                    }
                  />
                  <Label htmlFor="we-delhivery" className="text-sm font-normal cursor-pointer">
                    Delhivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="we-xbee"
                    checked={weCourierPartners.xbee}
                    onCheckedChange={(checked) =>
                      setWeCourierPartners(prev => ({ ...prev, xbee: checked === true }))
                    }
                  />
                  <Label htmlFor="we-xbee" className="text-sm font-normal cursor-pointer">
                    Xbee
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="we-bluedart"
                    checked={weCourierPartners.bluedart}
                    onCheckedChange={(checked) =>
                      setWeCourierPartners(prev => ({ ...prev, bluedart: checked === true }))
                    }
                  />
                  <Label htmlFor="we-bluedart" className="text-sm font-normal cursor-pointer">
                    BlueDart
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddWarehouseFEModalOpen(false);
                  setEditWarehouseFEModalOpen(false);
                  setSelectedWarehouseFE(null);
                  setWeUserId('');
                  setWeEmail('');
                  setWeWarehouseName('');
                  setWeAddress('');
                  setWeCity('');
                  setWeState('');
                  setWeNumber('');
                  setWeCourierPartners({ delhivery: false, xbee: false, bluedart: false });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle save logic here
                  toast({
                    title: editWarehouseFEModalOpen ? "Warehouse FE Updated" : "Warehouse FE Added",
                    description: "Changes have been saved successfully.",
                  });
                  setAddWarehouseFEModalOpen(false);
                  setEditWarehouseFEModalOpen(false);
                  setSelectedWarehouseFE(null);
                  // Refresh data
                  if (activeTab === 'warehouse-fe-details') {
                    fetchWarehouseFEDetails();
                  }
                }}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCourierBoy && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Courier Boy: {selectedCourierBoy.feName}</p>
                  <p className="text-sm font-mono">
                    {selectedCourierBoy.phoneNumbers[selectedPhoneIndex].number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current Confidence: {selectedCourierBoy.phoneNumbers[selectedPhoneIndex].confidence}%
                  </p>
                </div>

                <RadioGroup value={verificationResult} onValueChange={setVerificationResult}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="works" id="works" />
                      <Label htmlFor="works" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Works</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="wrong-number" id="wrong-number" />
                      <Label htmlFor="wrong-number" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-600" />
                          <span>Wrong Number</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="didnt-pick" id="didnt-pick" />
                      <Label htmlFor="didnt-pick" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-yellow-600" />
                          <span>Didn't Pick</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="different-person" id="different-person" />
                      <Label htmlFor="different-person" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-600" />
                          <span>Different Person</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setVerifyModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveVerification}
                    disabled={!verificationResult}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FENumberPage;
