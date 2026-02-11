export interface Order {
  id: number;
  customer: string;
  buyer: string; // <--- NEW: Separate Buyer from Customer
  style: string;
  color: string;
  poNo: string;
  qty: number;
  deliveryDate: string;
  psd: string;
}

export interface LoadingPlanItem {
  id: number;
  orderId: number;
  customer: string;
  style: string;
  poQty: number;
  poNo?: string;
  cutInDate: string;
  receivedDate: string;
  dispatchedDate: string;
  tableNo: string;
  targetPocket: string;
  targetLogo: string;
  targetGraph: string;
  status: 'Pending' | 'In Progress' | 'Done';
}

export interface HourlyProduction {
  timeSlot: string;
  seating: number;
  printing: number;
  curing: number;
  checking: number;
  packing: number;
  dispatch: number;
  rejects: number; // <--- NEW: Track Rejects
}

export interface DailyOutputRecord {
  id: number;
  planId: number;
  date: string;
  customer: string;
  style: string;
  dailyTarget: number;
  hourlyData: HourlyProduction[];
  totalPrinting: number;
  totalPacking: number;
  totalDispatch: number; // <--- NEW: Needed for report
  totalRejects: number;  // <--- NEW: Needed for report
}

// ... (Keep DowntimeRecord, Supplier, IncomingGood, UserState as is)
export interface DowntimeRecord { id: number; date: string; category: string; hours: number; reason: string; acknowledgedBy: string; }
export interface Supplier { id: number; styleNo: string; name: string; telephone: string; address: string; email: string; }
export interface IncomingGood { id: number; supplierName: string; gatepassNo: string; styleNo: string; inHouseDate: string; orderedQty: number; poNo: string; }