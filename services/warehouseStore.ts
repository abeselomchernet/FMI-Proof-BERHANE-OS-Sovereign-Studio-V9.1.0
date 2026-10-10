import { RawLoan, AssetLedgerItem } from '../types';
import { generateMockRawLoans, processBatch } from './dataService';

const WAREHOUSE_STORAGE_KEY = 'berhane_warehouse_data_v1';
const WAREHOUSE_CHANNEL_NAME = 'berhane_warehouse_broadcast';

export interface WarehouseSnapshot {
  version: number;
  updatedAt: string;
  rawData: RawLoan[];
  processedData: AssetLedgerItem[];
}

type WarehouseListener = (snapshot: WarehouseSnapshot) => void;
const listeners = new Set<WarehouseListener>();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(WAREHOUSE_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'WAREHOUSE_UPDATED') {
        notifyListeners(event.data.payload);
      }
    };
  } catch (err) {
    console.warn('[WarehouseStore] BroadcastChannel not supported or restricted:', err);
  }
}

// Window storage listener for cross-tab synchronicity fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === WAREHOUSE_STORAGE_KEY && event.newValue) {
      try {
        const parsed: WarehouseSnapshot = JSON.parse(event.newValue);
        notifyListeners(parsed);
      } catch (e) {
        console.error('[WarehouseStore] Storage sync parse error:', e);
      }
    }
  });
}

function notifyListeners(snapshot: WarehouseSnapshot) {
  listeners.forEach((callback) => {
    try {
      callback(snapshot);
    } catch (e) {
      console.error('[WarehouseStore] Listener error:', e);
    }
  });
}

/**
 * Generate fresh default factory mock seeds
 */
export function createDefaultWarehouseSeeds(): { rawData: RawLoan[]; processedData: AssetLedgerItem[] } {
  const initialRaw = generateMockRawLoans(8);
  const initialProcessed = processBatch(initialRaw.slice(0, 4));
  return {
    rawData: initialRaw,
    processedData: initialProcessed,
  };
}

/**
 * Load persisted warehouse data from localStorage, or initialize with factory seeds
 */
export function loadWarehouseState(): WarehouseSnapshot {
  if (typeof window === 'undefined') {
    const seeds = createDefaultWarehouseSeeds();
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      rawData: seeds.rawData,
      processedData: seeds.processedData,
    };
  }

  try {
    const raw = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    if (raw) {
      const parsed: WarehouseSnapshot = JSON.parse(raw);
      if (Array.isArray(parsed.rawData) && Array.isArray(parsed.processedData)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[WarehouseStore] Failed to load persisted state from localStorage:', e);
  }

  // Fallback to fresh mock seeds and save them
  const seeds = createDefaultWarehouseSeeds();
  const initialSnapshot: WarehouseSnapshot = {
    version: 1,
    updatedAt: new Date().toISOString(),
    rawData: seeds.rawData,
    processedData: seeds.processedData,
  };
  saveWarehouseState(initialSnapshot.rawData, initialSnapshot.processedData, false);
  return initialSnapshot;
}

/**
 * Save current raw loans and processed ledger items to persistent storage
 * and broadcast change across browser tabs for warehouse synchronicity.
 */
export function saveWarehouseState(
  rawData: RawLoan[],
  processedData: AssetLedgerItem[],
  broadcast = true
): WarehouseSnapshot {
  const snapshot: WarehouseSnapshot = {
    version: Date.now(),
    updatedAt: new Date().toISOString(),
    rawData,
    processedData,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.error('[WarehouseStore] Failed to persist warehouse state to localStorage:', e);
    }

    if (broadcast && broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'WAREHOUSE_UPDATED',
          payload: snapshot,
        });
      } catch (e) {
        console.warn('[WarehouseStore] Broadcast postMessage error:', e);
      }
    }
  }

  return snapshot;
}

/**
 * Reset warehouse to pristine factory seed state
 */
export function resetWarehouseToFactory(): WarehouseSnapshot {
  const seeds = createDefaultWarehouseSeeds();
  const snapshot = saveWarehouseState(seeds.rawData, seeds.processedData, true);
  notifyListeners(snapshot);
  return snapshot;
}

/**
 * Subscribe to cross-tab and storage synchronicity events
 */
export function subscribeWarehouseChanges(callback: WarehouseListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Export full warehouse snapshot as JSON string
 */
export function exportWarehouseSnapshotJson(snapshot?: WarehouseSnapshot): string {
  const data = snapshot || loadWarehouseState();
  return JSON.stringify(data, null, 2);
}

/**
 * Import a warehouse snapshot from JSON string
 */
export function importWarehouseSnapshotJson(jsonString: string): WarehouseSnapshot {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed.rawData) || !Array.isArray(parsed.processedData)) {
    throw new Error('Invalid warehouse snapshot: missing rawData or processedData arrays.');
  }

  const snapshot = saveWarehouseState(parsed.rawData, parsed.processedData, true);
  notifyListeners(snapshot);
  return snapshot;
}
