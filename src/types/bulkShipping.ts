export interface ShippingRateData {
  freightCharges: number;
  parcelAceProfitAmount: number;
  insuranceCharges: number;
  codCharges: number;
  earlyCodCharges: number;
  gstAmount: number;
  grossAmount: number;
  totalPayable: number;
  id: string;
  name: string;
}

export interface CourierPartnerRate {
  estimated_pickup: string;
  estimated_delivery: string;
  rate: ShippingRateData[];
  name: string;
  courier_partner_id: number;
  mode: string;
  weight: number;
  destination: string;
  origin: string;
  rating: number | null;
  payment_type: string;
  chargeType: string;
  baseRate: number | null;
}
