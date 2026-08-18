import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  WarehouseBin,
  FulfillmentOrder,
  PickWave,
  PackingStation,
  DockBay,
  BottleneckAlert,
  WarehouseMetrics,
  SimulationScenario,
  OrderStatus,
  CustomerTier,
  OrderItem,
  AuditLogEntry,
  UserAccount,
  UserRole,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_BINS,
  INITIAL_ORDERS,
  INITIAL_WAVES,
  INITIAL_PACK_STATIONS,
  INITIAL_DOCKS,
  INITIAL_BOTTLENECKS,
  INITIAL_METRICS,
  SIMULATION_SCENARIOS,
  INITIAL_USERS,
} from '../data/initialData';
import { warehouseSound } from '../utils/audioFeedback';

export type ActiveTab =
  | 'command'
  | 'floorplan'
  | 'orders'
  | 'simulator'
  | 'inventory'
  | 'picker_packer'
  | 'dispatch'
  | 'copilot';

export type AuthModalView = 'none' | 'login' | 'signup' | 'forgot';

interface WarehouseContextType {
  products: Product[];
  bins: WarehouseBin[];
  orders: FulfillmentOrder[];
  waves: PickWave[];
  packStations: PackingStation[];
  docks: DockBay[];
  bottlenecks: BottleneckAlert[];
  metrics: WarehouseMetrics;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedOrder: FulfillmentOrder | null;
  setSelectedOrder: (order: FulfillmentOrder | null) => void;
  selectedBin: WarehouseBin | null;
  setSelectedBin: (bin: WarehouseBin | null) => void;
  activeScenario: SimulationScenario | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Authentication & Operator Session
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  registeredUsers: UserAccount[];
  authModalView: AuthModalView;
  setAuthModalView: (view: AuthModalView) => void;
  login: (emailOrBadge: string, password?: string) => { success: boolean; error?: string };
  signup: (userData: {
    name: string;
    email: string;
    badgeId?: string;
    role: UserRole;
    facility: string;
    shift?: 'Shift Alpha (06:00 - 14:00)' | 'Shift Bravo (14:00 - 22:00)' | 'Shift Charlie (22:00 - 06:00)';
    clearanceLevel?: 'Tier-1 Floor' | 'Tier-2 Specialist' | 'Tier-3 Supervisor' | 'Tier-4 Root Admin';
  }, password?: string) => { success: boolean; error?: string };
  forgotPassword: (emailOrBadge: string, newPassword?: string) => { success: boolean; message?: string; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  isTerminalLocked: boolean;
  lockTerminal: () => void;
  unlockTerminal: (pin: string) => boolean;

  // Key Decision & Operational Actions
  allocateOrderStock: (
    orderId: string,
    strategy: 'preempt_lower_priority' | 'split_shipment' | 'cross_dock_expedite' | 'standard'
  ) => void;
  autoAllocateAll: () => void;
  resolveException: (orderId: string, resolutionId: string) => void;
  advanceOrderStage: (orderId: string) => void;
  pickItemInWave: (waveId: string, binCode: string) => void;
  packOrderAtStation: (
    stationId: string,
    orderId: string,
    boxSize: 'Box-A (Small)' | 'Box-B (Medium)' | 'Box-C (Heavy/Large)' | 'Poly-Mailer',
    scaleWeight: number
  ) => void;
  dispatchDock: (dockId: string) => void;
  reportDamage: (orderId: string, sku: string, binCode: string, qty: number) => void;
  triggerSupplierPO: (sku: string, quantity: number) => void;
  runScenario: (scenarioId: string) => void;
  resetToDefault: () => void;
  createNewOrder: (orderData: {
    customerName: string;
    customerTier: CustomerTier;
    shippingMethod: 'Next-Day Air AM' | 'Priority Express' | 'Standard Freight' | 'Regional Courier';
    carrier: 'FedEx Priority' | 'DHL Air Express' | 'UPS Next Day' | 'XPO Freight';
    slaMinutes: number;
    items: { sku: string; requestedQty: number }[];
  }) => void;
  systemNotification: { text: string; type: 'success' | 'warning' | 'info' | 'error' } | null;
  clearNotification: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bins, setBins] = useState<WarehouseBin[]>(INITIAL_BINS);
  const [orders, setOrders] = useState<FulfillmentOrder[]>(INITIAL_ORDERS);
  const [waves, setWaves] = useState<PickWave[]>(INITIAL_WAVES);
  const [packStations, setPackStations] = useState<PackingStation[]>(INITIAL_PACK_STATIONS);
  const [docks, setDocks] = useState<DockBay[]>(INITIAL_DOCKS);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAlert[]>(INITIAL_BOTTLENECKS);
  const [metrics, setMetrics] = useState<WarehouseMetrics>(INITIAL_METRICS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('command');
  const [selectedOrder, setSelectedOrder] = useState<FulfillmentOrder | null>(null);
  const [selectedBin, setSelectedBin] = useState<WarehouseBin | null>(null);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [systemNotification, setSystemNotification] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info' | 'error';
  } | null>(null);

  // Authentication & Users State
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_wms_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('nexus_wms_current_user');
      if (saved) {
        return JSON.parse(saved);
      }
      return null; // Login page comes first!
    } catch {
      return null;
    }
  });

  const [authModalView, setAuthModalView] = useState<AuthModalView>('none');
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(false);

  // Sync users to storage
  useEffect(() => {
    try {
      localStorage.setItem('nexus_wms_users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  // Sync current user to storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('nexus_wms_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('nexus_wms_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const login = (emailOrBadge: string, _password?: string): { success: boolean; error?: string } => {
    const trimmed = emailOrBadge.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Please enter your email or Badge ID.' };
    }

    const found = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        u.badgeId.toLowerCase() === trimmed ||
        u.name.toLowerCase().includes(trimmed)
    );

    if (found) {
      const updatedUser: UserAccount = {
        ...found,
        lastLogin: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      };
      setCurrentUser(updatedUser);
      setIsTerminalLocked(false);
      setAuthModalView('none');
      showNotification(`Welcome back, ${found.name}! Session authenticated for ${found.roleTitle}.`, 'success');
      return { success: true };
    } else {
      // Auto-fallback guest login for seamless access if user typed a new name/email
      const newGuest: UserAccount = {
        id: `usr-${Date.now()}`,
        name: emailOrBadge.includes('@') ? emailOrBadge.split('@')[0] : emailOrBadge,
        email: emailOrBadge.includes('@') ? emailOrBadge : `${emailOrBadge.toLowerCase().replace(/\s+/g, '.')}@nexuswms.io`,
        badgeId: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'shift_supervisor',
        roleTitle: 'Floor Operations Lead',
        facility: 'HUB-07 Chicago Core Logistics',
        shift: 'Shift Alpha (06:00 - 14:00)',
        clearanceLevel: 'Tier-3 Supervisor',
        lastLogin: 'Just now',
      };
      setRegisteredUsers((prev) => [...prev, newGuest]);
      setCurrentUser(newGuest);
      setIsTerminalLocked(false);
      setAuthModalView('none');
      showNotification(`Session created for ${newGuest.name} (Badge: ${newGuest.badgeId})`, 'success');
      return { success: true };
    }
  };

  const signup = (
    userData: {
      name: string;
      email: string;
      badgeId?: string;
      role: UserRole;
      facility: string;
      shift?: 'Shift Alpha (06:00 - 14:00)' | 'Shift Bravo (14:00 - 22:00)' | 'Shift Charlie (22:00 - 06:00)';
      clearanceLevel?: 'Tier-1 Floor' | 'Tier-2 Specialist' | 'Tier-3 Supervisor' | 'Tier-4 Root Admin';
    },
    _password?: string
  ): { success: boolean; error?: string } => {
    if (!userData.name.trim() || !userData.email.trim()) {
      return { success: false, error: 'Full name and work email are required.' };
    }

    const roleTitleMap: Record<UserRole, string> = {
      shift_supervisor: 'Shift Operations Supervisor',
      inventory_lead: 'Inventory & ATP Specialist',
      picker_packer: 'Wave Fulfillment & Pack Specialist',
      logistics_officer: 'Carrier Logistics & Dispatch Manager',
      system_admin: 'Warehouse Systems Administrator',
    };

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      badgeId: userData.badgeId?.trim() || `OP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: userData.role,
      roleTitle: roleTitleMap[userData.role] || 'Warehouse Operator',
      facility: userData.facility || 'HUB-07 Chicago Core Logistics',
      shift: userData.shift || 'Shift Alpha (06:00 - 14:00)',
      clearanceLevel: userData.clearanceLevel || (userData.role === 'shift_supervisor' ? 'Tier-3 Supervisor' : 'Tier-2 Specialist'),
      lastLogin: 'Just now',
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsTerminalLocked(false);
    setAuthModalView('none');
    showNotification(`Account created successfully! Welcome to Nexus WMS, ${newUser.name}.`, 'success');
    return { success: true };
  };

  const forgotPassword = (
    emailOrBadge: string,
    _newPassword?: string
  ): { success: boolean; message?: string; error?: string } => {
    const trimmed = emailOrBadge.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Please enter your registered email or badge ID.' };
    }

    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmed || u.badgeId.toLowerCase() === trimmed
    );

    if (found) {
      showNotification(`Security PIN verified! Password successfully updated for ${found.name}.`, 'success');
      setCurrentUser(found);
      setAuthModalView('none');
      return {
        success: true,
        message: `Security access reset for ${found.email}. You are now authenticated.`,
      };
    } else {
      // Friendly fallback for non-existing demo user
      showNotification(`Recovery credentials verified. New security token provisioned for ${emailOrBadge}.`, 'success');
      return {
        success: true,
        message: `A temporary 6-digit one-time access token has been generated.`,
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthModalView('login');
    showNotification('Operator session logged out safely.', 'info');
  };

  const switchUser = (userId: string) => {
    const user = registeredUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsTerminalLocked(false);
      showNotification(`Switched operator profile to ${user.name} (${user.roleTitle}).`, 'info');
    }
  };

  const lockTerminal = () => {
    setIsTerminalLocked(true);
    showNotification('Terminal locked for operator security.', 'warning');
  };

  const unlockTerminal = (pin: string): boolean => {
    if (pin === '1234' || pin.length >= 4) {
      setIsTerminalLocked(false);
      showNotification('Terminal unlocked. Resuming active session.', 'success');
      return true;
    }
    showNotification('Invalid security PIN. Try "1234" or any 4-digit code.', 'error');
    return false;
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    warehouseSound.enabled = val;
  };

  const showNotification = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    setSystemNotification({ text, type });
    if (type === 'error' || type === 'warning') {
      warehouseSound.playAlert();
    } else if (type === 'success') {
      warehouseSound.playSuccessChime();
    }
  };

  const clearNotification = () => setSystemNotification(null);

  // Recalculate Warehouse Metrics dynamically
  const recalculateMetrics = useCallback(() => {
    setMetrics((prev) => {
      const activeExceptions = orders.filter((o) => o.status === 'exception_held' || o.exception).length;
      const pendingAlloc = orders.filter((o) => o.status === 'created' || o.status === 'prioritizing').length;
      const pickingCount = orders.filter((o) => o.status === 'picking' || o.status === 'wave_batched').length;
      const packingCount = orders.filter((o) => o.status === 'packing' || o.status === 'quality_check').length;
      const dispatchCount = orders.filter((o) => o.status === 'staged').length;
      const fulfilledCount = orders.filter((o) => o.status === 'dispatched').length;

      return {
        ...prev,
        pendingAllocation: pendingAlloc,
        inPicking: pickingCount,
        inPacking: packingCount,
        inDispatch: dispatchCount,
        fulfilledToday: prev.fulfilledToday + (fulfilledCount > prev.fulfilledToday ? 1 : 0),
        activeExceptionsCount: activeExceptions,
      };
    });
  }, [orders]);

  useEffect(() => {
    recalculateMetrics();
  }, [orders, recalculateMetrics]);

  // SLA and Carrier Countdown Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.status === 'dispatched') return ord;
          const newSla = Math.max(0, ord.slaDeadlineMinutes - 1);
          const newCutoff = Math.max(0, ord.carrierCutoffMinutes - 1);
          return {
            ...ord,
            slaDeadlineMinutes: newSla,
            carrierCutoffMinutes: newCutoff,
          };
        })
      );

      setDocks((prev) =>
        prev.map((dock) => ({
          ...dock,
          departureTimeMinutes: Math.max(0, dock.departureTimeMinutes - 1),
        }))
      );
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, []);

  // SMART ALLOCATION ENGINE (The Competitive Twist)
  const allocateOrderStock = (
    orderId: string,
    strategy: 'preempt_lower_priority' | 'split_shipment' | 'cross_dock_expedite' | 'standard'
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const nowStr = new Date().toLocaleTimeString();

    if (strategy === 'preempt_lower_priority') {
      // Find conflicting lower-priority order with soft allocation
      const conflictOrder = orders.find(
        (o) =>
          o.id !== orderId &&
          (o.customerTier === 'standard_b2b' || o.customerTier === 'retail') &&
          o.items.some((i) => i.sku === 'SKU-LITH-900' && i.allocatedQty > 0)
      );

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            // Target VIP order receives full allocation
            const updatedItems: OrderItem[] = ord.items.map((it) => ({
              ...it,
              allocatedQty: it.requestedQty,
              status: 'allocated',
            }));
            const newAudit: AuditLogEntry = {
              timestamp: nowStr,
              stage: 'Stock Allocation (Preemption)',
              note: `Preemption Protocol Approved: Reallocated 5 units from ${conflictOrder?.orderNumber || 'B2B orders'}. Order fully allocated (10/10) with $0 SLA penalty.`,
              userOrAi: 'AI Engine',
            };
            return {
              ...ord,
              status: 'allocated',
              items: updatedItems,
              exception: undefined, // Cleared!
              auditLogs: [...ord.auditLogs, newAudit],
            };
          }

          if (conflictOrder && ord.id === conflictOrder.id) {
            // Lower priority order adjusted to partial/backorder
            const updatedItems: OrderItem[] = ord.items.map((it) =>
              it.sku === 'SKU-LITH-900'
                ? { ...it, allocatedQty: 0, status: 'shortage' }
                : it
            );
            const newAudit: AuditLogEntry = {
              timestamp: nowStr,
              stage: 'Stock Preemption Rebalance',
              note: `Stock reallocated to Tier-1 VIP Order ${targetOrder.orderNumber}. Supplier PO #PO-2026-881 auto-dispatched for 24h restock.`,
              userOrAi: 'AI Engine',
            };
            return {
              ...ord,
              status: 'exception_held',
              items: updatedItems,
              auditLogs: [...ord.auditLogs, newAudit],
            };
          }

          return ord;
        })
      );

      // Create new pick wave for target order
      const newWave: PickWave = {
        id: `wave-${Date.now().toString().slice(-4)}`,
        waveNumber: `WAVE-VIP-${targetOrder.orderNumber.slice(-4)}`,
        zone: 'Zone A & D (High Priority Fast-Track)',
        orderIds: [targetOrder.id],
        pickerId: 'pick-01',
        pickerName: 'Elena Rostova (Priority Cart)',
        status: 'pending',
        routeOptimized: true,
        totalDistanceMeters: 62,
        estimatedMinutes: 6.0,
        itemsCount: 14,
        pickedCount: 0,
        pathNodes: [
          { binCode: 'A-01-1', x: 18, y: 22, sku: 'SKU-OPT-440', productName: 'LiDAR Optical Sensor', quantity: 4, picked: false },
          { binCode: 'D-01-2', x: 74, y: 62, sku: 'SKU-LITH-900', productName: 'Lithium-Ion Power Pack', quantity: 10, picked: false },
        ]
      };
      setWaves((prev) => [newWave, ...prev]);

      showNotification(`Preemption Executed: Order ${targetOrder.orderNumber} fully allocated!`, 'success');
      return;
    }

    if (strategy === 'split_shipment') {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const updatedItems: OrderItem[] = ord.items.map((it) =>
              it.sku === 'SKU-LITH-900'
                ? { ...it, allocatedQty: 7, status: 'allocated' }
                : { ...it, allocatedQty: it.requestedQty, status: 'allocated' }
            );
            const newAudit: AuditLogEntry = {
              timestamp: nowStr,
              stage: 'Split Fulfillment Generated',
              note: `Split Shipment Approved: 7 units allocated for immediate dispatch. Child Backorder #ORD-9801-SPLIT generated for remaining 3 units via Next-Day Air.`,
              userOrAi: 'AI Engine',
            };
            return {
              ...ord,
              status: 'split_fulfilled',
              items: updatedItems,
              exception: undefined,
              auditLogs: [...ord.auditLogs, newAudit],
            };
          }
          return ord;
        })
      );
      showNotification(`Split-Shipment Created for ${targetOrder.orderNumber} (7 units allocated now, 3 on backorder)`, 'info');
      return;
    }

    if (strategy === 'cross_dock_expedite') {
      // Ingest 50 units from incoming supplier shipment
      setProducts((prev) =>
        prev.map((p) =>
          p.sku === 'SKU-LITH-900'
            ? {
                ...p,
                totalPhysicalStock: p.totalPhysicalStock + 50,
                availableToPromise: p.availableToPromise + 50,
              }
            : p
        )
      );

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const updatedItems: OrderItem[] = ord.items.map((it) => ({
              ...it,
              allocatedQty: it.requestedQty,
              status: 'allocated',
            }));
            const newAudit: AuditLogEntry = {
              timestamp: nowStr,
              stage: 'Cross-Dock Inbound Fulfillment',
              note: `Cross-Dock Expedited: 50 units received from Supplier Inbound PO #4491 at Dock 4. 10 units allocated to order.`,
              userOrAi: 'AI Engine',
            };
            return {
              ...ord,
              status: 'allocated',
              items: updatedItems,
              exception: undefined,
              auditLogs: [...ord.auditLogs, newAudit],
            };
          }
          return ord;
        })
      );
      showNotification(`Cross-Dock Receiving Completed: 50 units ingested, Order ${targetOrder.orderNumber} allocated!`, 'success');
      return;
    }

    // Standard Allocation
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems: OrderItem[] = ord.items.map((it) => ({
            ...it,
            allocatedQty: it.requestedQty,
            status: 'allocated',
          }));
          return {
            ...ord,
            status: 'allocated',
            items: updatedItems,
            exception: undefined,
            auditLogs: [
              ...ord.auditLogs,
              {
                timestamp: nowStr,
                stage: 'Stock Allocation',
                note: 'Standard stock allocation confirmed.',
                userOrAi: 'AI Engine',
              },
            ],
          };
        }
        return ord;
      })
    );
    showNotification(`Stock allocated to ${targetOrder.orderNumber}`, 'success');
  };

  // 1-Click Auto-Allocation for all pending orders
  const autoAllocateAll = () => {
    const unallocated = orders.filter((o) => o.status === 'created' || o.status === 'prioritizing');
    if (unallocated.length === 0) {
      showNotification('No pending orders requiring allocation.', 'info');
      return;
    }

    // Sort by priorityScore descending
    unallocated.forEach((ord) => {
      if (ord.exception?.type === 'stock_shortage' && ord.customerTier === 'enterprise_vip') {
        allocateOrderStock(ord.id, 'preempt_lower_priority');
      } else {
        allocateOrderStock(ord.id, 'standard');
      }
    });

    showNotification(`Multi-Order Intelligent Allocation completed for ${unallocated.length} orders!`, 'success');
  };

  // Resolve Exception
  const resolveException = (orderId: string, resolutionId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.exception) return;

    const resolution = order.exception.suggestedResolutions.find((r) => r.id === resolutionId);
    const nowStr = new Date().toLocaleTimeString();

    if (resolution?.actionType === 'quarantine_and_reroute') {
      // Move damaged item to quarantine stock, switch pick route to secondary bin
      setProducts((prev) =>
        prev.map((p) =>
          p.sku === 'SKU-BIO-SAMP'
            ? {
                ...p,
                quarantineStock: p.quarantineStock + 2,
                availableToPromise: Math.max(0, p.availableToPromise - 2),
              }
            : p
        )
      );

      setBins((prev) =>
        prev.map((b) =>
          b.binCode === 'D-03-1'
            ? { ...b, status: 'quarantined' }
            : b
        )
      );

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const updatedItems: OrderItem[] = ord.items.map((it) =>
              it.sku === 'SKU-BIO-SAMP'
                ? { ...it, locationBin: 'D-03-2 (Backup Vault)', status: 'allocated' }
                : it
            );
            return {
              ...ord,
              status: 'picking',
              items: updatedItems,
              exception: undefined,
              auditLogs: [
                ...ord.auditLogs,
                {
                  timestamp: nowStr,
                  stage: 'Exception Resolved',
                  note: `Damaged stock at D-03-1 isolated to QA. Pick route dynamically shifted to backup Bin D-03-2.`,
                  userOrAi: 'QA Inspector',
                },
              ],
            };
          }
          return ord;
        })
      );

      showNotification('Damaged units quarantined. Pick route dynamically rerouted to backup Bin D-03-2!', 'success');
      return;
    }

    if (resolution?.actionType === 'preempt_lower_priority') {
      allocateOrderStock(orderId, 'preempt_lower_priority');
      return;
    }

    if (resolution?.actionType === 'split_shipment') {
      allocateOrderStock(orderId, 'split_shipment');
      return;
    }

    // Default clear exception
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              exception: undefined,
              auditLogs: [
                ...ord.auditLogs,
                {
                  timestamp: nowStr,
                  stage: 'Exception Resolved',
                  note: `Exception manually cleared with action: ${resolution?.title || 'Approved override'}.`,
                  userOrAi: 'Operator',
                },
              ],
            }
          : ord
      )
    );
    showNotification(`Exception on ${order.orderNumber} resolved.`, 'success');
  };

  // Advance Order through Lifecycle
  const advanceOrderStage = (orderId: string) => {
    const stageSequence: OrderStatus[] = [
      'created',
      'prioritizing',
      'allocated',
      'wave_batched',
      'picking',
      'packing',
      'quality_check',
      'staged',
      'dispatched',
    ];

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const currentIndex = stageSequence.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= stageSequence.length - 1) return;

    const nextStatus = stageSequence[currentIndex + 1];
    const nowStr = new Date().toLocaleTimeString();

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map((it) => {
            if (nextStatus === 'picking') return { ...it, status: 'allocated' as const };
            if (nextStatus === 'packing') return { ...it, pickedQty: it.allocatedQty, status: 'picked' as const };
            if (nextStatus === 'quality_check' || nextStatus === 'staged' || nextStatus === 'dispatched') {
              return { ...it, pickedQty: it.allocatedQty, packedQty: it.allocatedQty, status: 'verified' as const };
            }
            return it;
          });

          return {
            ...ord,
            status: nextStatus,
            items: updatedItems,
            auditLogs: [
              ...ord.auditLogs,
              {
                timestamp: nowStr,
                stage: `Stage Transition: ${nextStatus.toUpperCase()}`,
                note: `Order progressed to ${nextStatus.replace('_', ' ')}.`,
                userOrAi: 'AI Engine',
              },
            ],
          };
        }
        return ord;
      })
    );

    showNotification(`Order ${order.orderNumber} transitioned to ${nextStatus.toUpperCase()}`, 'info');
  };

  // Interactive Pick Item in Wave
  const pickItemInWave = (waveId: string, binCode: string) => {
    warehouseSound.playScanBeep();

    setWaves((prev) =>
      prev.map((wave) => {
        if (wave.id === waveId) {
          const updatedNodes = wave.pathNodes.map((node) =>
            node.binCode === binCode ? { ...node, picked: true } : node
          );
          const pickedCount = updatedNodes.filter((n) => n.picked).length;
          const isComplete = pickedCount === updatedNodes.length;

          // If all nodes picked, update associated orders to 'packing'
          if (isComplete) {
            wave.orderIds.forEach((ordId) => {
              setOrders((ordList) =>
                ordList.map((ord) =>
                  ord.id === ordId
                    ? {
                        ...ord,
                        status: 'packing',
                        items: ord.items.map((it) => ({ ...it, pickedQty: it.allocatedQty, status: 'picked' })),
                        auditLogs: [
                          ...ord.auditLogs,
                          {
                            timestamp: new Date().toLocaleTimeString(),
                            stage: 'Picking Completed',
                            note: `All items picked via Wave ${wave.waveNumber}. Transferred to packing queue.`,
                            userOrAi: 'Operator',
                          },
                        ],
                      }
                    : ord
                )
              );
            });
            warehouseSound.playSuccessChime();
          }

          return {
            ...wave,
            pathNodes: updatedNodes,
            pickedCount: pickedCount,
            status: isComplete ? 'completed' : 'in_progress',
          };
        }
        return wave;
      })
    );

    showNotification(`Barcode Verified at Bin ${binCode}: Pick item confirmed!`, 'success');
  };

  // Complete Packing at Bench
  const packOrderAtStation = (
    stationId: string,
    orderId: string,
    boxSize: 'Box-A (Small)' | 'Box-B (Medium)' | 'Box-C (Heavy/Large)' | 'Poly-Mailer',
    scaleWeight: number
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    warehouseSound.playSuccessChime();
    const trackingCode = `${order.carrier.slice(0, 3).toUpperCase()}-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'staged',
            trackingNumber: trackingCode,
            items: ord.items.map((it) => ({ ...it, packedQty: it.allocatedQty, status: 'verified' })),
            auditLogs: [
              ...ord.auditLogs,
              {
                timestamp: new Date().toLocaleTimeString(),
                stage: 'Packing & QA Complete',
                note: `Packed in ${boxSize}. Weight: ${scaleWeight.toFixed(2)}kg. Thermal label ${trackingCode} printed. Staged at Dock Bay #1.`,
                userOrAi: 'QA Inspector',
              },
            ],
          };
        }
        return ord;
      })
    );

    setPackStations((prev) =>
      prev.map((st) =>
        st.id === stationId
          ? {
              ...st,
              boxesPackedToday: st.boxesPackedToday + 1,
              status: 'idle',
              currentOrderId: undefined,
            }
          : st
      )
    );

    showNotification(`Packing Complete for ${order.orderNumber}! Shipping Label Generated: ${trackingCode}`, 'success');
  };

  // Dispatch Carrier Dock
  const dispatchDock = (dockId: string) => {
    const dock = docks.find((d) => d.id === dockId);
    if (!dock) return;

    warehouseSound.playSuccessChime();

    setOrders((prev) =>
      prev.map((ord) => {
        if (dock.assignedOrderIds.includes(ord.id) && ord.status !== 'dispatched') {
          return {
            ...ord,
            status: 'dispatched',
            auditLogs: [
              ...ord.auditLogs,
              {
                timestamp: new Date().toLocaleTimeString(),
                stage: 'Carrier Dispatch',
                note: `Loaded into ${dock.carrier} trailer at Dock Bay #${dock.dockNumber}. Bill of Lading (BOL) signed. Departure confirmed.`,
                userOrAi: 'Carrier System',
              },
            ],
          };
        }
        return ord;
      })
    );

    setDocks((prev) =>
      prev.map((d) =>
        d.id === dockId
          ? {
              ...d,
              status: 'dispatched',
              capacityPct: 100,
              departureTimeMinutes: 0,
            }
          : d
      )
    );

    showNotification(`Carrier ${dock.carrier} Dispatched from Dock #${dock.dockNumber}! All orders cleared.`, 'success');
  };

  // Report Damaged Item in Bin
  const reportDamage = (orderId: string, sku: string, binCode: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === sku
          ? {
              ...p,
              quarantineStock: p.quarantineStock + qty,
              availableToPromise: Math.max(0, p.availableToPromise - qty),
            }
          : p
      )
    );

    setBins((prev) =>
      prev.map((b) => (b.binCode === binCode ? { ...b, status: 'quarantined' } : b))
    );

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'exception_held',
            exception: {
              id: `exc-dam-${Date.now()}`,
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              type: 'damaged_item',
              severity: 'warning',
              title: `Damaged Stock at Bin ${binCode}`,
              details: `${qty} unit(s) damaged during handling. Isolated to quarantine QA.`,
              affectedSku: sku,
              shortQuantity: qty,
              suggestedResolutions: [
                {
                  id: 'res-reroute-1',
                  actionType: 'quarantine_and_reroute',
                  title: 'Reroute to Secondary Bin & Isolate Broken Lot',
                  impactSummary: 'Updates pick route to secondary vault slot immediately.',
                  costOrSlaImpact: '+1.2 min pick time.',
                  confidenceScore: 96,
                  autoExecuteAllowed: true,
                },
              ],
            },
          };
        }
        return ord;
      })
    );

    showNotification(`Damage reported on ${sku} at ${binCode}. Exception raised and isolated.`, 'warning');
  };

  // Trigger Supplier Purchase Order (Restock)
  const triggerSupplierPO = (sku: string, quantity: number) => {
    warehouseSound.playSuccessChime();
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === sku
          ? {
              ...p,
              totalPhysicalStock: p.totalPhysicalStock + quantity,
              availableToPromise: p.availableToPromise + quantity,
            }
          : p
      )
    );

    showNotification(`Supplier Purchase Order PO-2026-${Math.floor(100 + Math.random() * 900)} for ${quantity} units of ${sku} confirmed! Stock updated.`, 'success');
  };

  // Run Simulation Scenario
  const runScenario = (scenarioId: string) => {
    const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setActiveScenario(scenario);
    setActiveTab('simulator');

    if (scenario.id === 'scen-vip-shortage') {
      // Ensure VIP dilemma state
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      showNotification('Loaded VIP Stockout Dilemma: 10 units requested by VIP vs 7 available!', 'warning');
    } else if (scenario.id === 'scen-damaged-picker') {
      showNotification('Loaded Damaged Item Scenario at Bin D-03-1!', 'warning');
    } else if (scenario.id === 'scen-carrier-cutoff') {
      showNotification('Loaded Carrier Cut-off Crunch: FedEx departing in 25 min!', 'warning');
    } else if (scenario.id === 'scen-flash-surge') {
      showNotification('Loaded Flash Surge Simulation: 100+ orders incoming to Zone A!', 'info');
    } else if (scenario.id === 'scen-reorder-breach') {
      showNotification('Loaded Safety Stock Breach Scenario for Lithium Batteries!', 'warning');
    }
  };

  // Reset to default initial state
  const resetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setBins(INITIAL_BINS);
    setOrders(INITIAL_ORDERS);
    setWaves(INITIAL_WAVES);
    setPackStations(INITIAL_PACK_STATIONS);
    setDocks(INITIAL_DOCKS);
    setBottlenecks(INITIAL_BOTTLENECKS);
    setMetrics(INITIAL_METRICS);
    setSelectedOrder(null);
    setSelectedBin(null);
    setActiveScenario(null);
    showNotification('Warehouse operations reset to initial nominal state.', 'info');
  };

  // Create New Live Order
  const createNewOrder = (orderData: {
    customerName: string;
    customerTier: CustomerTier;
    shippingMethod: 'Next-Day Air AM' | 'Priority Express' | 'Standard Freight' | 'Regional Courier';
    carrier: 'FedEx Priority' | 'DHL Air Express' | 'UPS Next Day' | 'XPO Freight';
    slaMinutes: number;
    items: { sku: string; requestedQty: number }[];
  }) => {
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${orderData.customerTier === 'enterprise_vip' ? 'VIP' : 'STD'}`;
    const orderId = `ord-${Date.now().toString().slice(-4)}`;

    let hasShortage = false;
    let shortItemSku = '';

    const orderItems: OrderItem[] = orderData.items.map((it) => {
      const prod = products.find((p) => p.sku === it.sku);
      const isShort = prod ? prod.availableToPromise < it.requestedQty : true;
      if (isShort) {
        hasShortage = true;
        shortItemSku = it.sku;
      }

      return {
        sku: it.sku,
        productName: prod?.name || it.sku,
        requestedQty: it.requestedQty,
        allocatedQty: 0,
        pickedQty: 0,
        packedQty: 0,
        unitPrice: prod?.unitPrice || 100,
        locationBin: prod?.primaryBin || 'A-01-1',
        status: isShort ? 'shortage' : 'allocated',
      };
    });

    // Calculate priority score (1 - 100)
    let score = 50;
    if (orderData.customerTier === 'enterprise_vip') score += 35;
    else if (orderData.customerTier === 'prime_express') score += 20;
    if (orderData.shippingMethod === 'Next-Day Air AM') score += 15;
    if (orderData.slaMinutes < 60) score += 10;
    score = Math.min(100, score);

    const newOrder: FulfillmentOrder = {
      id: orderId,
      orderNumber: orderNum,
      customerName: orderData.customerName,
      customerTier: orderData.customerTier,
      createdAt: new Date().toISOString(),
      slaDeadlineMinutes: orderData.slaMinutes,
      status: hasShortage ? 'prioritizing' : 'created',
      priorityScore: score,
      items: orderItems,
      shippingMethod: orderData.shippingMethod,
      carrier: orderData.carrier,
      carrierCutoffMinutes: 90,
      totalWeightKg: 12.4,
      totalVolumeCm3: 18000,
      exception: hasShortage
        ? {
            id: `exc-${Date.now()}`,
            orderId: orderId,
            orderNumber: orderNum,
            type: 'stock_shortage',
            severity: 'critical',
            title: `Insufficient Stock for ${shortItemSku}`,
            details: `Requested stock exceeds available to promise (ATP).`,
            affectedSku: shortItemSku,
            shortQuantity: 5,
            suggestedResolutions: [
              {
                id: 'res-new-1',
                actionType: 'preempt_lower_priority',
                title: 'Preempt Lower Priority Queue',
                impactSummary: 'Reallocates stock from standard orders.',
                costOrSlaImpact: '0 penalty for VIP.',
                confidenceScore: 94,
                autoExecuteAllowed: true,
              },
              {
                id: 'res-new-2',
                actionType: 'split_shipment',
                title: 'Split Order Fulfillment',
                impactSummary: 'Ship in-stock items now, remainder on restock.',
                costOrSlaImpact: '+$24 split fee.',
                confidenceScore: 88,
                autoExecuteAllowed: true,
              },
            ],
          }
        : undefined,
      auditLogs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          stage: 'Order Ingestion',
          note: `Order ${orderNum} created with priority score ${score}/100.`,
          userOrAi: 'AI Engine',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    showNotification(`Order ${orderNum} created! Prioritized at rank ${score}/100.`, 'success');
  };

  return (
    <WarehouseContext.Provider
      value={{
        products,
        bins,
        orders,
        waves,
        packStations,
        docks,
        bottlenecks,
        metrics,
        activeTab,
        setActiveTab,
        selectedOrder,
        setSelectedOrder,
        selectedBin,
        setSelectedBin,
        activeScenario,
        soundEnabled,
        setSoundEnabled,
        currentUser,
        isAuthenticated: !!currentUser,
        registeredUsers,
        authModalView,
        setAuthModalView,
        login,
        signup,
        forgotPassword,
        logout,
        switchUser,
        isTerminalLocked,
        lockTerminal,
        unlockTerminal,
        allocateOrderStock,
        autoAllocateAll,
        resolveException,
        advanceOrderStage,
        pickItemInWave,
        packOrderAtStation,
        dispatchDock,
        reportDamage,
        triggerSupplierPO,
        runScenario,
        resetToDefault,
        createNewOrder,
        systemNotification,
        clearNotification,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
