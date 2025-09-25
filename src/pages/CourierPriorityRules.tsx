import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, Wand2, TriangleAlert, Settings, Truck } from "lucide-react";
import { CourierPriorityService } from "@/services/courierPriorityService";
import { 
  CourierPriorityData, 
  CourierPartner, 
  OrderType,
  LocalPriorityConfig,
  LocalCourierPriority
} from "@/types/courierPriority";
// ---- Types ----
type Mode = "cheapest" | "custom";

export type OrderTypeKey = "prepaid" | "cod" | "reverse";

export interface PriorityConfig {
  "1": LocalCourierPriority | null;
  "2": LocalCourierPriority | null;
  "3": LocalCourierPriority | null;
}

export type RulesState = Record<OrderTypeKey, PriorityConfig>;

interface PersistedConfigV1 {
  mode: Mode;
  rules: RulesState;
  updatedAt?: string;
}

// ---- Constants ----
const STORAGE_KEY = "courier-priority-config:v1";
const CLEAR_VALUE = "__CLEAR__"; // used in <SelectItem/> but mapped to null in state

const emptyPriority = (): PriorityConfig => ({ "1": null, "2": null, "3": null });

// ---- Helpers ----
const loadFromStorage = (): PersistedConfigV1 | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedConfigV1;
  } catch {
    return null;
  }
};

const saveToStorage = (data: PersistedConfigV1) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const __safeValueForSelect = (val: LocalCourierPriority | null): string | undefined =>
  val === null ? undefined : val?.courier_partner_id.toString();

const Kbd: React.FC<{children: React.ReactNode}> = ({children}) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">{children}</kbd>
);

// ---- Component ----
const CourierPriorityRules: React.FC = () => {
  const [mode, setMode] = useState<Mode>("custom");
  const [rules, setRules] = useState<RulesState>({} as RulesState);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [courierPartners, setCourierPartners] = useState<CourierPartner[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);

  useEffect(() => {
    const fetchCourierPrioritySettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await CourierPriorityService.getCourierPrioritySettings();
        
        // Set the data from API
        setCourierPartners(data.courier_partners);
        setOrderTypes(data.order_types);
        
        // Transform API data to local format
        const localData = CourierPriorityService.transformApiDataToLocal(data);
        
        // Create rules state from API data
        const apiRules: RulesState = {} as RulesState;
        Object.keys(localData.priorities).forEach(orderType => {
          const orderTypeKey = orderType as OrderTypeKey;
          apiRules[orderTypeKey] = {
            "1": localData.priorities[orderType].find(p => p.priority_id === 1) || null,
            "2": localData.priorities[orderType].find(p => p.priority_id === 2) || null,
            "3": localData.priorities[orderType].find(p => p.priority_id === 3) || null,
          };
        });
        
        setRules(apiRules);
        
        // Load any existing local storage preferences
        const existing = loadFromStorage();
        if (existing) {
          setMode(existing.mode);
        }
        
      } catch (err) {
        console.error('Failed to fetch courier priority settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };

    fetchCourierPrioritySettings();
  }, []);

  const isDisabled = mode === "cheapest";

  const handleSelect = (
    orderType: OrderTypeKey,
    priorityKey: keyof PriorityConfig,
    value: string
  ) => {
    if (value === CLEAR_VALUE) {
      setRules((prev) => ({
        ...prev,
        [orderType]: {
          ...prev[orderType],
          [priorityKey]: null,
        },
      }));
      return;
    }

    const courierPartnerId = parseInt(value);
    const courierPartner = courierPartners.find(cp => cp.value === courierPartnerId);
    
    if (courierPartner) {
      const priorityId = parseInt(priorityKey);
      const newPriority: LocalCourierPriority = {
        courier_partner_id: courierPartnerId,
        priority_id: priorityId,
        courier_name: courierPartner.label
      };

      setRules((prev) => ({
        ...prev,
        [orderType]: {
          ...prev[orderType],
          [priorityKey]: newPriority,
        },
      }));
      
      // Clear success message when user makes changes
      setSuccess(null);
    }
  };

  const hasDuplicateWithinRow = (cfg: PriorityConfig) => {
    const picked = [cfg["1"], cfg["2"], cfg["3"]].filter(Boolean).map(p => p?.courier_partner_id);
    return new Set(picked).size !== picked.length;
  };

  const tableHasIssues = useMemo(() => {
    return orderTypes.some((ot) => {
      const orderTypeKey = ot.value as OrderTypeKey;
      return hasDuplicateWithinRow(rules[orderTypeKey]);
    });
  }, [rules, orderTypes]);

  const onSave = async () => {
    try {
      setSaving(true);
      
      // Transform rules to API format
      const priorities: LocalPriorityConfig = {};
      Object.keys(rules).forEach(orderType => {
        priorities[orderType] = Object.values(rules[orderType as OrderTypeKey])
          .filter(Boolean)
          .sort((a, b) => (a?.priority_id || 0) - (b?.priority_id || 0));
      });

      // Save to API
      await CourierPriorityService.updateCourierPrioritySettings(priorities);
      
      // Show success message
      setSuccess('Courier priority settings updated successfully!');
      setError(null);
      
      // Save mode preference to local storage
      const payload: PersistedConfigV1 = {
        mode,
        rules,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(payload);
      
    } catch (err) {
      console.error('Failed to save courier priority settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const clearMessages = () => {
    setSuccess(null);
    setError(null);
  };

  const onReset = async () => {
    try {
      setLoading(true);
      const data = await CourierPriorityService.getCourierPrioritySettings();
      
      // Transform API data to local format
      const localData = CourierPriorityService.transformApiDataToLocal(data);
      
      // Create rules state from API data
      const apiRules: RulesState = {} as RulesState;
      Object.keys(localData.priorities).forEach(orderType => {
        const orderTypeKey = orderType as OrderTypeKey;
        apiRules[orderTypeKey] = {
          "1": localData.priorities[orderType].find(p => p.priority_id === 1) || null,
          "2": localData.priorities[orderType].find(p => p.priority_id === 2) || null,
          "3": localData.priorities[orderType].find(p => p.priority_id === 3) || null,
        };
      });
      
      setRules(apiRules);
    } catch (err) {
      console.error('Failed to reset courier priority settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  // ---- Render ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-lg text-gray-600">Loading courier priority settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <TriangleAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-red-700">Failed to Load Settings</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Basic Title */}
        <div className="text-left">
          <h1 className="text-xl font-semibold text-slate-700">Setup Your Courier Priority</h1>
        </div>


        {/* Mode Selection */}
        <div className="flex justify-start">
          {/* Mode Selection */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                Selection Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Label 
                  htmlFor="mode-cheapest" 
                  className={`cursor-pointer inline-flex items-center justify-center rounded-xl border-2 p-4 text-sm font-medium transition-all duration-200 ${
                    mode === 'cheapest' 
                      ? 'border-blue-500 text-blue-700 ring-4 ring-blue-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroup value={mode} onValueChange={(v) => { setMode(v as Mode); clearMessages(); }}>
                    <RadioGroupItem value="cheapest" id="mode-cheapest" className="mr-2"/>
                    Cheapest
                  </RadioGroup>
                </Label>
                <Label 
                  htmlFor="mode-custom" 
                  className={`cursor-pointer inline-flex items-center justify-center rounded-xl border-2 p-4 text-sm font-medium transition-all duration-200 ${
                    mode === 'custom' 
                      ? 'border-indigo-500 text-indigo-700 ring-4 ring-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroup value={mode} onValueChange={(v) => { setMode(v as Mode); clearMessages(); }}>
                    <RadioGroupItem value="custom" id="mode-custom" className="mr-2"/>
                    Custom
                  </RadioGroup>
                </Label>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="rounded-2xl border-green-200 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Alert */}
        {mode === "custom" && tableHasIssues && (
          <Alert variant="destructive" className="rounded-2xl border-red-200">
            <TriangleAlert className="h-5 w-5" />
            <AlertTitle className="text-red-800">Priority Configuration Issues</AlertTitle>
            <AlertDescription className="text-red-700">
              Each order type must have unique courier partners across all priority levels. Please resolve duplicates before saving.
            </AlertDescription>
          </Alert>
        )}

        {/* Priority Configuration Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orderTypes.map((ot) => {
            const orderTypeKey = ot.value as OrderTypeKey;
            const cfg = rules[orderTypeKey];
            const hasDup = hasDuplicateWithinRow(cfg);
            return (
              <Card 
                key={ot.value} 
                className={`rounded-2xl transition-all duration-300 hover:shadow-xl ${
                  hasDup 
                    ? 'ring-2 ring-red-200' 
                    : 'shadow-lg'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-800">{ot.label}</CardTitle>
                    {mode === "cheapest" ? (
                      <Badge variant="outline" className="gap-2 text-blue-700 border-blue-200">
                        <Wand2 className="h-3 w-3"/>
                        Auto
                      </Badge>
                    ) : hasDup ? (
                      <Badge variant="destructive" className="gap-2">
                        <TriangleAlert className="h-3 w-3"/>
                        Fix Priorities
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-2 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3"/>
                        Configured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {["1", "2", "3"].map((pKey) => {
                    const currentRaw = cfg[pKey as keyof PriorityConfig] as string;
                    const safeValue = __safeValueForSelect(currentRaw);
                    return (
                      <div key={`${ot}-${pKey}`} className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          {pKey === '1' ? '🥇 1st Priority' : pKey === '2' ? '🥈 2nd Priority' : '🥉 3rd Priority'}
                        </Label>
                        <Select
                          disabled={mode === "cheapest"}
                          value={safeValue}
                          onValueChange={(val) => handleSelect(orderTypeKey, pKey as keyof PriorityConfig, val)}
                        >
                          <SelectTrigger className="w-full border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select courier partner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CLEAR_VALUE}>None</SelectItem>
                            {courierPartners.map((cp) => (
                              <SelectItem key={cp.value} value={cp.value.toString()}>{cp.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button 
            onClick={onReset} 
            disabled={loading}
            variant="outline"
            className="px-6 py-3 border-gray-300 hover:border-gray-400 text-gray-700 font-normal shadow-sm transition-all duration-200"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin"/>
                Resetting...
              </span>
            ) : (
              "Reset to Default"
            )}
          </Button>
          
          <Button 
            onClick={onSave} 
            disabled={saving || (mode === "custom" && tableHasIssues)}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white font-normal shadow-md transition-all duration-200 text-lg"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin"/>
                Saving...
              </span>
            ) : (
              "Apply Rule"
            )}
          </Button>
        </div>




      </div>
    </div>
  );
};

export default CourierPriorityRules;
