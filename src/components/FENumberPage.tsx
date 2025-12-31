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
  Building,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  role: 'FE' | 'TL' | 'Hub Manager'; // Field Executive, Team Leader, or Hub Manager
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

// API Response interfaces
interface FEDetail {
  id: number;
  user_id: number;
  warehouse_fe_id: number;
  name: string;
  number: string;
  role: string;
  confidence: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface FEData {
  id: number;
  user_id: number;
  warehouse_id: number;
  awb: string;
  courier_partner: string;
  warehouse_name: string;
  city: string;
  hub_name: string;
  gmap: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: FEDetail[];
}

interface APIResponse {
  status: boolean;
  message: string;
  data: {
    fes_data: FEData[];
    pagination: {
      current_page: number;
      last_page: number;
      total_page: number;
      per_page: number;
      total: number;
    };
  };
  error: null | any;
}

// Transformed FE data for table display
interface FERowData {
  id: string;
  awb: string;
  courierPartner: string;
  warehouseName: string;
  city: string;
  hubName: string;
  gmap: string;
  name: string;
  number: string;
  role: string;
  confidence: string;
  remarks: string | null;
  warehouseFeId: number;
  detailId: number;
}

// Generate mock data - Warehouse based structure
const generateMockData = (): { warehouses: Warehouse[], courierBoys: CourierBoy[] } => {
  const hubs = ['Mumbai Hub', 'Delhi Hub', 'Bangalore Hub', 'Chennai Hub', 'Kolkata Hub'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
  const courierPartners = ['Delhivery', 'BlueDart', 'FedEx', 'DTDC', 'XpressBees'];
  const feRoles: ('FE' | 'TL' | 'Hub Manager')[] = ['FE', 'TL', 'Hub Manager'];
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
      const roleDisplayMap: { [key: string]: string } = {
        'FE': 'Field Executive',
        'TL': 'Team Leader',
        'Hub Manager': 'Hub Manager'
      };
      
      courierBoys.push({
        id: feId,
        feName,
        role: roleDisplayMap[role] || role,
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
  const [feRowsData, setFeRowsData] = useState<FERowData[]>([]);
  const [filteredFeRowsData, setFilteredFeRowsData] = useState<FERowData[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [loadingFEDetails, setLoadingFEDetails] = useState(false);
  const [currentFEData, setCurrentFEData] = useState<FEData | null>(null); // Store current FE data for adding new FE
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [feToDelete, setFeToDelete] = useState<{ detailId: number; feName: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourierPartner, setSelectedCourierPartner] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  // API Search state
  const [searchByField, setSearchByField] = useState<string>('awb');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
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
  const [newFERole, setNewFERole] = useState<'FE' | 'TL' | 'Hub Manager'>('FE');
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
  const [feCustomerName, setFeCustomerName] = useState<string>('');
  const [feCustomerCity, setFeCustomerCity] = useState<string>('');
  const [feHubName, setFeHubName] = useState<string>('');
  const [feGmapLocation, setFeGmapLocation] = useState<string>('');
  const [feName, setFeName] = useState<string>('');
  const [feNumber, setFeNumber] = useState<string>('');
  const [feRole, setFeRole] = useState<'FE' | 'TL' | 'Hub Manager'>('FE');
  const [feWhatsappNumber, setFeWhatsappNumber] = useState<string>('');
  const [feConfidence, setFeConfidence] = useState<number>(50);
  const [feRemarks, setFeRemarks] = useState<string>('');
  const [feWarehouseId, setFeWarehouseId] = useState<number | null>(null);
  const [savingFENumber, setSavingFENumber] = useState<boolean>(false);
  // Data type selection (customer or warehouse)
  const [dataType, setDataType] = useState<'warehouse' | 'customer'>('warehouse');
  // Courier partner dropdown state
  const [feCourierPartnerSelect, setFeCourierPartnerSelect] = useState<string>('');
  const [feCourierPartnerOther, setFeCourierPartnerOther] = useState<string>('');
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

  // Fetch FE data from API
  const fetchFEData = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
      setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse-fe`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const data: APIResponse = await response.json();
      
      if (response.ok && data.status && data.data && data.data.fes_data) {
        // Transform API data to FERowData format
        const transformedData: FERowData[] = [];
        
        data.data.fes_data.forEach((fe) => {
          // If there are details, create a row for each detail
          if (fe.details && fe.details.length > 0) {
            fe.details.forEach((detail) => {
              transformedData.push({
                id: `fe-${fe.id}-detail-${detail.id}`,
                awb: fe.awb,
                courierPartner: fe.courier_partner,
                warehouseName: fe.warehouse_name,
                city: fe.city,
                hubName: fe.hub_name,
                gmap: fe.gmap,
                name: detail.name,
                number: detail.number,
                role: detail.role,
                confidence: detail.confidence,
                remarks: detail.remarks || fe.remarks,
                warehouseFeId: fe.id,
                detailId: detail.id,
              });
            });
          } else {
            // If no details, still create a row with FE-level data
            transformedData.push({
              id: `fe-${fe.id}`,
              awb: fe.awb,
              courierPartner: fe.courier_partner,
              warehouseName: fe.warehouse_name,
              city: fe.city,
              hubName: fe.hub_name,
              gmap: fe.gmap,
              name: '',
              number: '',
              role: '',
              confidence: '',
              remarks: fe.remarks,
              warehouseFeId: fe.id,
              detailId: 0,
            });
          }
        });
        
        setFeRowsData(transformedData);
        setFilteredFeRowsData(transformedData);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch FE data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching FE data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FE data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search FE data by field
  const searchFEData = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search value.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        setIsSearching(false);
        setLoading(false);
        return;
      }

      // Map UI field names to API parameter names
      const fieldMap: { [key: string]: string } = {
        'awb': 'awb',
        'courier_partner': 'courier_partner',
        'warehouse_name': 'warehouse_name',
        'city': 'city',
        'hub_name': 'hub_name',
        'number': 'number'
      };

      const apiParam = fieldMap[searchByField] || 'awb';
      const baseUrl = import.meta.env.VITE_API_URL || 'https://app.parcelace.io/';
      const apiUrl = `${baseUrl}api/warehouse-fe?${apiParam}=${encodeURIComponent(searchValue.trim())}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const data: APIResponse = await response.json();
      
      if (response.ok && data.status && data.data && data.data.fes_data) {
        // Transform API data to FERowData format
        const transformedData: FERowData[] = [];
        
        data.data.fes_data.forEach((fe) => {
          // If there are details, create a row for each detail
          if (fe.details && fe.details.length > 0) {
            fe.details.forEach((detail) => {
              transformedData.push({
                id: `fe-${fe.id}-detail-${detail.id}`,
                awb: fe.awb,
                courierPartner: fe.courier_partner,
                warehouseName: fe.warehouse_name,
                city: fe.city,
                hubName: fe.hub_name,
                gmap: fe.gmap,
                name: detail.name,
                number: detail.number,
                role: detail.role,
                confidence: detail.confidence,
                remarks: detail.remarks || fe.remarks,
                warehouseFeId: fe.id,
                detailId: detail.id,
              });
            });
          } else {
            // If no details, still create a row with FE-level data
            transformedData.push({
              id: `fe-${fe.id}`,
              awb: fe.awb,
              courierPartner: fe.courier_partner,
              warehouseName: fe.warehouse_name,
              city: fe.city,
              hubName: fe.hub_name,
              gmap: fe.gmap,
              name: '',
              number: '',
              role: '',
              confidence: '',
              remarks: fe.remarks,
              warehouseFeId: fe.id,
              detailId: 0,
            });
          }
        });
        
        setFeRowsData(transformedData);
        setFilteredFeRowsData(transformedData);
        
        toast({
          title: "Search Complete",
          description: `Found ${transformedData.length} result(s).`,
        });
      } else {
        toast({
          title: "Search Error",
          description: data.message || "No results found.",
          variant: "destructive",
        });
        // Clear results if search fails
        setFeRowsData([]);
        setFilteredFeRowsData([]);
      }
    } catch (error) {
      console.error('Error searching FE data:', error);
      toast({
        title: "Error",
        description: "Failed to search FE data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch FE data when component loads or when All Details tab is active
    if (activeTab === 'all-details') {
      fetchFEData();
    }
  }, [activeTab]);

  // Fetch FE details by ID from API
  const fetchFEDetailsById = async (feId: number) => {
    setLoadingFEDetails(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        setLoadingFEDetails(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse-fe/${feId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      // Handle different response structures
      let feData: FEData | null = null;
      
      if (response.ok && data.status) {
        // Check if response has fes_data array
        if (data.data && data.data.fes_data && Array.isArray(data.data.fes_data) && data.data.fes_data.length > 0) {
          feData = data.data.fes_data[0];
        }
        // Check if response has direct fe_data object
        else if (data.data && data.data.fe_data) {
          feData = data.data.fe_data;
        }
        // Check if response data is directly the FE object
        else if (data.data && data.data.id && data.data.awb) {
          feData = data.data;
        }
      }
      
      if (feData) {
        
        // Transform API data to Warehouse structure for the modal
        const warehouse: Warehouse = {
          id: `wh-${feData.id}`,
          warehouseId: feData.warehouse_name,
          hub: feData.hub_name,
          city: feData.city,
          courierPartner: feData.courier_partner,
          googleMapsLink: feData.gmap,
          remarks: feData.remarks || undefined,
          fieldExecutives: feData.details.map((detail) => ({
            id: `fe-${feData.id}-detail-${detail.id}`,
            feName: detail.name,
            role: (detail.role === 'Delivery Boy' ? 'FE' : detail.role === 'Team Leader' ? 'TL' : 'Hub Manager') as 'FE' | 'TL' | 'Hub Manager',
            phoneNumbers: [{
              number: detail.number,
              confidence: parseFloat(detail.confidence) || 0,
              isPrimary: true,
              whatsappNumber: undefined
            }],
            status: 'active'
          }))
        };
        
        // Also create CourierBoy entries for compatibility
        const courierBoysData: CourierBoy[] = feData.details.map((detail) => ({
          id: `fe-${feData.id}-detail-${detail.id}`,
          feName: detail.name,
          role: detail.role,
          hub: feData.hub_name,
          city: feData.city,
          courierPartner: feData.courier_partner,
          phoneNumbers: [{
            number: detail.number,
            confidence: parseFloat(detail.confidence) || 0,
            isPrimary: true
          }],
          warehouseId: feData.warehouse_name,
          awbNumber: feData.awb,
          status: 'active',
          googleMapsLink: feData.gmap,
          remarks: detail.remarks || feData.remarks || undefined
        }));
        
        // Update state
        setWarehouses(prev => {
          const exists = prev.find(w => w.id === warehouse.id);
          if (!exists) {
            return [...prev, warehouse];
          }
          return prev.map(w => w.id === warehouse.id ? warehouse : w);
        });
        
        setCourierBoys(prev => {
          const newCourierBoys = courierBoysData.filter(cb => !prev.find(p => p.id === cb.id));
          return [...prev, ...newCourierBoys];
        });
        
        setSelectedWarehouse(warehouse);
        setCurrentFEData(feData); // Store FE data for later use when adding new FE
        setViewAllModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "FE details not found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching FE details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FE details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingFEDetails(false);
    }
  };

  // Delete individual FE detail
  const deleteFEDetail = async (detailId: number) => {
    if (!currentFEData) {
      toast({
        title: "Error",
        description: "FE data not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        return;
      }

      console.log('Deleting FE detail:', { detailId, currentFEDataId: currentFEData.id, totalDetails: currentFEData.details.length });

      // Remove the deleted FE detail from the list
      const remainingFEDetails = currentFEData.details
        .filter(detail => detail.id !== detailId)
        .map(detail => ({
          name: detail.name,
          number: detail.number,
          role: detail.role,
          confidence: parseFloat(detail.confidence) || 0,
          remarks: detail.remarks || ''
        }));

      console.log('Remaining FE details:', remainingFEDetails.length);

      // If no FE details remain, delete the entire warehouse FE entry
      if (remainingFEDetails.length === 0) {
        const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse-fe/${currentFEData.id}`;
        
        console.log('Deleting entire warehouse FE entry:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        console.log('Delete response status:', response.status, response.ok);

        // Handle empty response (204 No Content) or JSON response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // For 204 No Content or empty responses, consider it successful
          if (response.ok || response.status === 204) {
            data = { status: true, message: 'FE deleted successfully' };
          } else {
            data = { status: false, message: 'Failed to delete FE' };
          }
        }

        console.log('Delete response data:', data);

        if (response.ok || response.status === 204 || data.status) {
          toast({
            title: "Success",
            description: data.message || "FE deleted successfully",
          });

          // Close the modal
          setViewAllModalOpen(false);
          setCurrentFEData(null);
          setSelectedWarehouse(null);

          // Refresh the FE list
          if (activeTab === 'all-details') {
            await fetchFEData();
          }
        } else {
          const errorMessage = data.error?.message || data.message || `Failed to delete FE. Status: ${response.status}`;
          console.error('Delete error:', errorMessage, data);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        // Update warehouse FE with remaining FE details
        const payload = {
          warehouse_id: currentFEData.warehouse_id,
          awb: currentFEData.awb,
          courier_partner: currentFEData.courier_partner,
          warehouse_name: currentFEData.warehouse_name,
          city: currentFEData.city,
          hub_name: currentFEData.hub_name,
          gmap: currentFEData.gmap,
          remarks: currentFEData.remarks || '',
          fe_details: remainingFEDetails
        };

        const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse-fe`;
        
        console.log('Updating warehouse FE with remaining details:', apiUrl, payload);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log('Update response:', response.status, data);

        if (response.ok && data.status) {
          toast({
            title: "Success",
            description: data.message || "FE detail deleted successfully",
          });

          // Refresh FE data to show updated list
          if (currentFEData.id) {
            await fetchFEDetailsById(currentFEData.id);
          }
        } else {
          const errorMessage = data.error?.message || data.message || `Failed to delete FE detail. Status: ${response.status}`;
          console.error('Update error:', errorMessage, data);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error deleting FE detail:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while deleting FE detail. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  // Filter FE rows data based on search and filters
  useEffect(() => {
    let filtered = [...feRowsData];

    // Search filter (AWB, City, Hub, Warehouse Name, Name, Number)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.awb.toLowerCase().includes(searchLower) ||
        item.city.toLowerCase().includes(searchLower) ||
        item.hubName.toLowerCase().includes(searchLower) ||
        item.warehouseName.toLowerCase().includes(searchLower) ||
        item.name.toLowerCase().includes(searchLower) ||
        item.number.toLowerCase().includes(searchLower)
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

    setFilteredFeRowsData(filtered);
  }, [searchTerm, selectedCourierPartner, selectedCity, feRowsData]);

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

  const handleSaveNewFE = async () => {
    if (!selectedWarehouse || !newFEName.trim() || !newFENumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter FE name and phone number.",
        variant: "destructive",
      });
      return;
    }

    // Check if we have current FE data (from View FE modal)
    if (!currentFEData) {
      toast({
        title: "Error",
        description: "FE data not found. Please view FE details first.",
        variant: "destructive",
      });
      return;
    }

    // Map role to API format
    const roleMap: { [key: string]: string } = {
      'FE': 'Delivery Boy',
      'TL': 'Team Leader',
      'Hub Manager': 'Hub Manager'
    };

    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        return;
      }

      // Get existing FE details
      const existingFEDetails = currentFEData.details.map(detail => ({
        name: detail.name,
        number: detail.number,
        role: detail.role,
        confidence: parseFloat(detail.confidence) || 0,
        remarks: detail.remarks || ''
      }));

      // Add new FE detail
      const newFEDetail = {
        name: newFEName.trim(),
        number: newFENumber.trim(),
        role: roleMap[newFERole] || newFERole,
        confidence: newFEConfidence,
        remarks: ''
      };

      // Combine existing and new FE details
      const allFEDetails = [...existingFEDetails, newFEDetail];

      // Prepare API payload with existing warehouse FE data plus new FE detail
      const payload = {
        warehouse_id: currentFEData.warehouse_id,
        awb: currentFEData.awb,
        courier_partner: currentFEData.courier_partner,
        warehouse_name: currentFEData.warehouse_name,
        city: currentFEData.city,
        hub_name: currentFEData.hub_name,
        gmap: currentFEData.gmap,
        remarks: currentFEData.remarks || '',
        fe_details: allFEDetails
      };

      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse-fe`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status) {
    toast({
          title: "Success",
          description: data.message || "FE added successfully",
        });

        // Refresh FE data to show the new FE (keep modal open)
        if (currentFEData.id) {
          // Refresh the data but keep the modal open
          await fetchFEDetailsById(currentFEData.id);
        }

        // Reset form
    setAddFEModalOpen(false);
    setNewFEName('');
    setNewFENumber('');
    setNewFEWhatsapp('');
    setNewFERole('FE');
    setNewFEConfidence(50);
    setNewFEIsPrimary(true);
      } else {
        const errorMessage = data.error?.message || data.message || "Failed to add FE. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding FE:', error);
      toast({
        title: "Error",
        description: "An error occurred while adding FE. Please try again.",
        variant: "destructive",
      });
    }
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
        const apiCourierPartner = data.data.order_details?.delivery_partner || '';
        
        // Map API courier partner to dropdown options
        const courierPartnerOptions = ['Delhivery', 'Xbee', 'DTDC', 'Bluedart', 'Professional', 'Maruti', 'Anjani'];
        const normalizedApiPartner = apiCourierPartner.trim();
        const matchedOption = courierPartnerOptions.find(opt => 
          opt.toLowerCase() === normalizedApiPartner.toLowerCase() ||
          normalizedApiPartner.toLowerCase().includes(opt.toLowerCase()) ||
          opt.toLowerCase().includes(normalizedApiPartner.toLowerCase())
        );
        
        if (matchedOption) {
          setFeCourierPartnerSelect(matchedOption);
          setFeCourierPartner(matchedOption);
        } else if (normalizedApiPartner) {
          // If API value doesn't match any option, set to "Other" and populate the other field
          setFeCourierPartnerSelect('Other');
          setFeCourierPartnerOther(normalizedApiPartner);
          setFeCourierPartner(normalizedApiPartner);
        } else {
          setFeCourierPartnerSelect('');
          setFeCourierPartner('');
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
        
        // Set default data type based on shipment type, but allow user to change
        // Default to warehouse for normal shipments, but user can switch
        setDataType('warehouse');
        
        // Populate both warehouse and customer data (user will choose which to use)
        // Warehouse data
        const warehouseName = data.data.warehouse_details?.warehouse_name || '';
        const warehouseCity = data.data.warehouse_details?.city || '';
        const warehouseId = data.data.warehouse_details?.id || data.data.warehouse_details?.warehouse_id || null;
        setFeWarehouseName(warehouseName);
        setFeCity(warehouseCity);
        setFeWarehouseId(warehouseId ? parseInt(warehouseId.toString()) : null);
        
        // Customer data
        const customerFirstName = data.data.customer_details?.shipping_first_name || '';
        const customerLastName = data.data.customer_details?.shipping_last_name || '';
        const customerName = `${customerFirstName} ${customerLastName}`.trim() || customerFirstName || '';
        const customerCity = data.data.customer_details?.shipping_city || '';
        setFeCustomerName(customerName);
        setFeCustomerCity(customerCity);

        toast({
          title: "Data Fetched",
          description: "Shipment details have been auto-populated. Please select data type (Warehouse/Customer).",
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

  const handleSaveFENumber = async () => {
    if (!feAWB.trim() || !feName.trim() || !feNumber.trim() || !feRole) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in AWB, Name, Number, and Role fields.",
        variant: "destructive",
      });
      return;
    }

    // Use the appropriate fields based on data type
    const warehouseName = dataType === 'warehouse' ? feWarehouseName : feCustomerName;
    const city = dataType === 'warehouse' ? feCity : feCustomerCity;
    // If customer data is selected, warehouse_id should be null
    const warehouseId = dataType === 'warehouse' ? feWarehouseId : null;

    if (!warehouseName.trim() || !city.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Warehouse/Customer Name and City fields.",
        variant: "destructive",
      });
      return;
    }

    setSavingFENumber(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue.",
          variant: "destructive",
        });
        setSavingFENumber(false);
        return;
      }

      // Map role to API format
      const roleMap: { [key: string]: string } = {
        'FE': 'Delivery Boy',
        'TL': 'Team Leader',
        'Hub Manager': 'Hub Manager'
      };

      // Prepare API payload
      const payload = {
        warehouse_id: warehouseId,
        awb: feAWB.trim(),
        courier_partner: feCourierPartner.trim() || '',
        warehouse_name: warehouseName.trim(),
        city: city.trim(),
        hub_name: feHubName.trim() || '',
        gmap: feGmapLocation.trim() || '',
        remarks: feRemarks.trim() || '',
        fe_details: [
          {
            name: feName.trim(),
            number: feNumber.trim(),
            role: roleMap[feRole] || feRole,
            confidence: feConfidence,
            remarks: feRemarks.trim() || ''
          }
        ]
      };

      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse-fe`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Show API message
        toast({
          title: "Success",
          description: data.message || data.data?.message || "FE created successfully",
        });

        // Reset and close
        setAddFENumberModalOpen(false);
        setAwbNumber('');
        setFeAWB('');
        setFeCourierPartner('');
        setFeCourierPartnerSelect('');
        setFeCourierPartnerOther('');
        setFeWarehouseName('');
        setFeCity('');
        setFeCustomerName('');
        setFeCustomerCity('');
        setFeHubName('');
        setFeGmapLocation('');
        setFeName('');
        setFeNumber('');
        setFeRole('FE');
        setFeWhatsappNumber('');
        setFeConfidence(50);
        setFeRemarks('');
        setFeWarehouseId(null);
        setDataType('warehouse');
        
        // Refresh the FE data
        if (activeTab === 'all-details') {
          fetchFEData();
        }
      } else {
        // Extract error message from API response
        const errorMessage = data.error?.message || data.message || "Failed to create FE. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating FE:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating FE. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingFENumber(false);
    }
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
    <div className="space-y-6 px-6 pt-6">
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
              setFeCourierPartnerSelect('');
              setFeCourierPartnerOther('');
              setFeWarehouseName('');
              setFeCity('');
              setFeCustomerName('');
              setFeCustomerCity('');
              setFeHubName('');
              setFeGmapLocation('');
              setFeName('');
              setFeNumber('');
              setFeRole('FE');
              setFeWhatsappNumber('');
              setFeConfidence(50);
              setFeRemarks('');
              setFeWarehouseId(null);
              setDataType('warehouse');
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
        <div className="flex items-center gap-2 flex-1">
          <Select value={searchByField} onValueChange={setSearchByField}>
            <SelectTrigger className="w-[200px] h-12">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awb">AWB</SelectItem>
              <SelectItem value="courier_partner">Courier Partner</SelectItem>
              <SelectItem value="warehouse_name">Warehouse Name</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="hub_name">Hub Name</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder={`Enter ${searchByField === 'awb' ? 'AWB' : searchByField === 'courier_partner' ? 'Courier Partner' : searchByField === 'warehouse_name' ? 'Warehouse Name' : searchByField === 'city' ? 'City' : searchByField === 'hub_name' ? 'Hub Name' : 'Number'} to search`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchFEData();
                }
              }}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button
            onClick={searchFEData}
            disabled={isSearching || !searchValue.trim()}
            className="h-12 px-6 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              setSearchValue('');
              setSearchByField('awb');
              fetchFEData();
            }}
            variant="outline"
            className="h-12 px-4"
          >
            Reset
          </Button>
        </div>
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
              <TableHead className="w-32">Courier Partner</TableHead>
              <TableHead className="w-32">Warehouse Name</TableHead>
              <TableHead className="w-32">City</TableHead>
              <TableHead className="w-32">Hub Name</TableHead>
              <TableHead className="w-24">Location</TableHead>
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-40">Number</TableHead>
              <TableHead className="w-32">Role</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading FE data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredFeRowsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>No FE data found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFeRowsData.map((feRow) => (
                <TableRow key={feRow.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{feRow.awb}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{feRow.courierPartner}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{feRow.warehouseName}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{feRow.city}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{feRow.hubName}</span>
                  </TableCell>
                  <TableCell>
                    {feRow.gmap && (
                      <a
                        href={feRow.gmap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center"
                        title="View Location"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{feRow.name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {feRow.number ? (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono text-sm">{feRow.number}</span>
                        {feRow.confidence && feRow.confidence.trim() !== '' && !isNaN(parseFloat(feRow.confidence)) && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getConfidenceTextColor(parseFloat(feRow.confidence))} text-white`}>
                            {feRow.confidence}%
                              </span>
                        )}
                            </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{feRow.role || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                        onClick={() => {
                          // Keep existing action button behavior
                          const mockCourierBoy: CourierBoy = {
                            id: feRow.id,
                            feName: feRow.name,
                            role: feRow.role,
                            hub: feRow.hubName,
                            city: feRow.city,
                            courierPartner: feRow.courierPartner,
                            phoneNumbers: feRow.number ? [{
                              number: feRow.number,
                              confidence: parseFloat(feRow.confidence) || 0,
                              isPrimary: true
                            }] : [],
                            warehouseId: feRow.warehouseName,
                            awbNumber: feRow.awb,
                            status: 'active',
                            googleMapsLink: feRow.gmap,
                            remarks: feRow.remarks || undefined
                          };
                          handleVerify(mockCourierBoy, 0);
                        }}
                              className="h-8 text-xs px-3"
                              title="Verify"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Verify
                            </Button>
                              <Button
                                size="sm"
                                variant="outline"
                        onClick={() => {
                          // Fetch FE details from API using warehouse_fe_id
                          fetchFEDetailsById(feRow.warehouseFeId);
                        }}
                                className="h-8 text-xs px-3"
                        title="View FE Details"
                        disabled={loadingFEDetails}
                      >
                        {loadingFEDetails ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                                <Eye className="w-3.5 h-3.5 mr-1" />
                            View FE
                          </>
                        )}
                            </Button>
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
                          <div className="flex items-center gap-2">
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
                            {currentFEData && (() => {
                              // Find the detail ID from the FE id (format: fe-{warehouseFeId}-detail-{detailId})
                              const detailIdMatch = fe.id.match(/detail-(\d+)$/);
                              if (detailIdMatch) {
                                const detailId = parseInt(detailIdMatch[1]);
                                const detail = currentFEData.details.find(d => d.id === detailId);
                                if (detail) {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setFeToDelete({ detailId, feName: fe.feName });
                                        setDeleteConfirmOpen(true);
                                      }}
                                      className="h-7 text-xs px-2"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </div>
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
                  <Select value={newFERole} onValueChange={(value: 'FE' | 'TL' | 'Hub Manager') => setNewFERole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FE">Field Executive (FE)</SelectItem>
                      <SelectItem value="TL">Team Leader (TL)</SelectItem>
                      <SelectItem value="Hub Manager">Hub Manager</SelectItem>
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
              {/* Data Type Selection - Show after data is fetched */}
              {feAWB && (
                <div className="space-y-2">
                  <Label>Data Type *</Label>
                  <RadioGroup value={dataType} onValueChange={(value: 'warehouse' | 'customer') => setDataType(value)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="warehouse" id="dataType-warehouse" />
                        <Label htmlFor="dataType-warehouse" className="cursor-pointer">
                          Warehouse Data
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="customer" id="dataType-customer" />
                        <Label htmlFor="dataType-customer" className="cursor-pointer">
                          Customer Data
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
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
                  <Select
                    value={feCourierPartnerSelect || feCourierPartner}
                    onValueChange={(value) => {
                      setFeCourierPartnerSelect(value);
                      if (value === 'Other') {
                        setFeCourierPartner(feCourierPartnerOther || '');
                      } else {
                        setFeCourierPartner(value);
                        setFeCourierPartnerOther('');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Courier Partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhivery">Delhivery</SelectItem>
                      <SelectItem value="Xbee">Xbee</SelectItem>
                      <SelectItem value="DTDC">DTDC</SelectItem>
                      <SelectItem value="Bluedart">Bluedart</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Maruti">Maruti</SelectItem>
                      <SelectItem value="Anjani">Anjani</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {feCourierPartnerSelect === 'Other' && (
                    <Input
                      value={feCourierPartnerOther}
                      onChange={(e) => {
                        setFeCourierPartnerOther(e.target.value);
                        setFeCourierPartner(e.target.value);
                      }}
                      placeholder="Enter courier partner name"
                      className="mt-2"
                    />
                  )}
                </div>
                {dataType === 'warehouse' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="feCustomerName">Customer Name</Label>
                      <Input
                        id="feCustomerName"
                        value={feCustomerName}
                        onChange={(e) => setFeCustomerName(e.target.value)}
                        placeholder="Customer Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feCustomerCity">Customer City</Label>
                      <Input
                        id="feCustomerCity"
                        value={feCustomerCity}
                        onChange={(e) => setFeCustomerCity(e.target.value)}
                        placeholder="Customer City"
                      />
                    </div>
                  </>
                )}
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
                  <Label htmlFor="feRole">Role *</Label>
                  <Select
                    value={feRole}
                    onValueChange={(value: 'FE' | 'TL' | 'Hub Manager') => setFeRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FE">FE</SelectItem>
                      <SelectItem value="TL">TL</SelectItem>
                      <SelectItem value="Hub Manager">Hub Manager</SelectItem>
                    </SelectContent>
                  </Select>
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
                  setFeCourierPartnerSelect('');
                  setFeCourierPartnerOther('');
                  setFeWarehouseName('');
                  setFeCity('');
                  setFeCustomerName('');
                  setFeCustomerCity('');
                  setFeHubName('');
                  setFeGmapLocation('');
                  setFeName('');
                  setFeNumber('');
                  setFeRole('FE');
                  setFeWhatsappNumber('');
                  setFeConfidence(50);
                  setFeRemarks('');
                  setFeWarehouseId(null);
                  setDataType('warehouse');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFENumber}
                disabled={savingFENumber}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
              >
                {savingFENumber ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save FE Number'
                )}
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

      {/* Delete FE Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Field Executive
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{feToDelete?.feName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setFeToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (feToDelete) {
                  deleteFEDetail(feToDelete.detailId);
                  setDeleteConfirmOpen(false);
                  setFeToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FENumberPage;
