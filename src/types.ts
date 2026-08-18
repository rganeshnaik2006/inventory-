/**
 * Smart Warehouse Operations & Order Fulfillment System Types
*/

export type CustomerTier = 'enterprise_vip' | 'prime_express' | 'standard_b2b' | 'retail';

export type OrderStatus =
  | 'created'
  | 'prioritizing'
  | 'allocated'
  | 'wave_batched'
  | 'picking'
  | 'packing'
  | 'quality_check'
  | 'staged'
  | 'dispatched'
  | 'exception_held'
  | 'split_fulfilled';

export type VelocityRank = 'A' | 'B' | 'C'; // A = Fast Mover, B = Medium, C = Slow

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  barcode: string;
  unitPrice: number;
  weightKg: number;
  volumeCm3: number;
  velocityRank: VelocityRank;
  totalPhysicalStock: number;
  allocatedStock: number;
  availableToPromise: number; // ATP = Physical - Allocated - Quarantine
  quarantineStock: number;
  safetyStockThreshold: number;
  reorderQuantity: number;
  leadTimeDays: number;
  supplier: string;
  primaryZone: string;
  primaryBin: string;
  secondaryBins: string[];
  isHazmat?: boolean;
  isFragile?: boolean;
  isPerishable?: boolean;
  batchNumber: string;
  expiryDate?: string;
}

export type BinStatus = 'nominal' | 'congested' | 'low_stock' | 'quarantined' | 'maintenance';

export interface WarehouseBin {
  id: string;
  zone: 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D';
  zoneName: string;
  aisle: number; // 1 - 6
  rack: number; // 1 - 4
  shelf: number; // 1 - 3
  binCode: string; // e.g. A-02-3
  capacityMax: number;
  currentCapacity: number;
  sku: string;
  productName: string;
  quantity: number;
  status: BinStatus;
  x: number; // For 2D grid/map positioning (0 - 100)
  y: number; // (0 - 100)
  pickFrequencyToday: number;
}

export interface OrderItem {
  sku: string;
  productName: string;
  requestedQty: number;
  allocatedQty: number;
  pickedQty: number;
  packedQty: number;
  unitPrice: number;
  locationBin: string;
  status: 'allocated' | 'shortage' | 'damaged' | 'picked' | 'verified';
}

export interface AuditLogEntry {
  timestamp: string;
  stage: string;
  note: string;
  userOrAi: 'AI Engine' | 'Operator' | 'QA Inspector' | 'Carrier System' | 'Inventory Agent';
}

export interface ExceptionResolutionOption {
  id: string;
  actionType:
    | 'preempt_lower_priority'
    | 'split_shipment'
    | 'substitute_sku'
    | 'cross_dock_expedite'
    | 'swap_bin_location'
    | 'reassign_carrier'
    | 'quarantine_and_reroute';
  title: string;
  impactSummary: string;
  costOrSlaImpact: string;
  confidenceScore: number; // e.g. 94%
  autoExecuteAllowed: boolean;
}

export interface OrderException {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'stock_shortage' | 'damaged_item' | 'misplaced_bin' | 'carrier_delay' | 'weight_mismatch' | 'rush_vip_preemption';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  details: string;
  affectedSku?: string;
  shortQuantity?: number;
  suggestedResolutions: ExceptionResolutionOption[];
  resolvedAt?: string;
  resolutionSelected?: string;
}

export interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerTier: CustomerTier;
  createdAt: string;
  slaDeadlineMinutes: number; // Count down minutes remaining
  status: OrderStatus;
  priorityScore: number; // 1 - 100
  items: OrderItem[];
  shippingMethod: 'Next-Day Air AM' | 'Priority Express' | 'Standard Freight' | 'Regional Courier';
  carrier: 'FedEx Priority' | 'DHL Air Express' | 'UPS Next Day' | 'XPO Freight';
  carrierCutoffMinutes: number; // Minutes until carrier vehicle leaves
  assignedPicker?: string;
  assignedPackStation?: string;
  trackingNumber?: string;
  exception?: OrderException;
  splitShipmentId?: string;
  totalWeightKg: number;
  totalVolumeCm3: number;
  auditLogs: AuditLogEntry[];
}

export interface PickPathNode {
  binCode: string;
  x: number;
  y: number;
  sku: string;
  productName: string;
  quantity: number;
  picked: boolean;
  scannedBarcode?: string;
}

export interface PickWave {
  id: string;
  waveNumber: string;
  zone: string;
  orderIds: string[];
  pickerId: string;
  pickerName: string;
  status: 'pending' | 'in_progress' | 'completed';
  routeOptimized: boolean;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  itemsCount: number;
  pickedCount: number;
  pathNodes: PickPathNode[];
}

export interface PackingStation {
  id: string;
  stationNumber: number;
  stationName: string;
  packerName: string;
  status: 'idle' | 'active' | 'bottlenecked';
  currentOrderId?: string;
  boxesPackedToday: number;
  avgPackTimeSeconds: number;
  scaleWeightKg: number;
  boxSizeRecommendation: 'Box-A (Small)' | 'Box-B (Medium)' | 'Box-C (Heavy/Large)' | 'Poly-Mailer';
  materialsChecklist: { name: string; checked: boolean }[];
}

export interface DockBay {
  id: string;
  dockNumber: number;
  carrier: string;
  destination: string;
  departureTimeMinutes: number;
  status: 'docked_loading' | 'scheduled' | 'delayed' | 'dispatched';
  capacityPct: number;
  assignedOrderIds: string[];
}

export interface BottleneckAlert {
  id: string;
  zoneOrStation: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
  rootCause: string;
  impactMinutes: number;
}

export interface WarehouseMetrics {
  totalOrdersToday: number;
  fulfilledToday: number;
  pendingAllocation: number;
  inPicking: number;
  inPacking: number;
  inDispatch: number;
  atpAccuracyRate: number; // e.g. 99.4%
  slaComplianceRate: number; // e.g. 98.1%
  avgCycleTimeMinutes: number; // e.g. 24.5 min
  pickerThroughputUnitsPerHour: number; // e.g. 138 units/hr
  activeExceptionsCount: number;
}

export interface SimulationScenario {
  id: string;
  title: string;
  tagline: string;
  description?: string;
  category: 'shortage' | 'damaged' | 'carrier' | 'surge' | 'discrepancy' | 'replenishment';
  difficulty: 'Standard' | 'High Stakes' | 'Extreme Crisis';
  icon: string;
  explanationOfDilemma: string;
  aiSuggestedStrategy: string;
  actionRequired: string;
}

export type UserRole = 'shift_supervisor' | 'inventory_lead' | 'picker_packer' | 'logistics_officer' | 'system_admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  badgeId: string;
  role: UserRole;
  roleTitle: string;
  facility: string;
  shift: 'Shift Alpha (06:00 - 14:00)' | 'Shift Bravo (14:00 - 22:00)' | 'Shift Charlie (22:00 - 06:00)';
  avatarUrl?: string;
  clearanceLevel: 'Tier-1 Floor' | 'Tier-2 Specialist' | 'Tier-3 Supervisor' | 'Tier-4 Root Admin';
  lastLogin?: string;
}
