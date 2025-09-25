// Courier Priority Types

export interface OrderType {
  value: string;
  label: string;
}

export interface CourierPartner {
  value: number;
  label: string;
}

export interface CourierPriority {
  courier_partner_id: number;
  priority_id: number;
}

export interface CourierPriorityData {
  order_types: OrderType[];
  courier_partners: CourierPartner[];
  courier_priorities: {
    [key: string]: CourierPriority[];
  };
}

export interface CourierPriorityResponse {
  status: boolean;
  message: string;
  data: CourierPriorityData;
  error: string | null;
}

// POST API request types
export interface PriorityUpdateRequest {
  priority: Array<{
    order_type: string;
    courier_partner_id: string[];
  }>;
}

// Local state types for the component
export interface LocalCourierPriority {
  courier_partner_id: number;
  priority_id: number;
  courier_name: string;
}

export interface LocalPriorityConfig {
  [key: string]: LocalCourierPriority[];
}

export interface CourierPriorityFormData {
  order_types: OrderType[];
  courier_partners: CourierPartner[];
  priorities: LocalPriorityConfig;
}
