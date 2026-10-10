
// Reflects Table 1: raw_loan_book
export interface RawLoan {
  loan_id: string;
  value_etb: number;
  trad_score: number;
  uploaded_at: string;
  source_file_name: string;
  applicant_name: string; // Added for UI clarity
}

// Reflects Table 2: securitization_asset_ledger
export interface AssetLedgerItem {
  asset_uuid: string;
  loan_id: string;
  borrower_name?: string;
  applicant_name?: string;
  
  // AI/Risk Metrics
  imm_uplift: number;
  berhane_score: number; // CR-Score
  
  // Flags
  is_alpha_compliant: boolean;
  is_sfdr_article9_ready: boolean;
  
  // Financial/DLT
  provisioning_cost_reduction_pct: number;
  securitization_denomination: string;
  
  // DLT Status
  dlt_mint_status: 'PENDING' | 'MINTED' | 'REJECTED_ALPHA_GATE_FAIL';
  dlt_txn_hash: string | null;
  
  // V9.0.0 Liquidity Resilience & Settlement Finality
  settlement_status: 'PENDING' | 'SETTLED' | 'LIQUIDITY_CRUNCH' | 'INJECTED_SETTLEMENT' | 'NOT_APPLICABLE';
  
  processed_timestamp: string;
}

// Stats for the dashboard
export interface DashboardStats {
  totalValueLocked: number;
  compliantAssets: number;
  avgCrScore: number;
  totalLoansProcessed: number;
}

// For Regulatory Index Ingestion (Smart Learner Phase I + IV Optimization)
export interface RegulatoryChunk {
  chunk_id: string;
  content: string;
  source_institution: string; // e.g., NBE, ECMA
  reference_number: string;   // e.g., SBB/95/2025
  date_of_issuance: string;
  access_level: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
  regulatory_causality: string | null; // Parent Directive ID
  is_redacted: boolean;
  
  // Phase IV Optimizations
  extraction_method: 'NER_MODEL_V4' | 'REGEX_SPLIT' | 'MANUAL';
  cache_status: 'MISS' | 'HIT_TTL_24H' | 'EXPIRED';
  cache_ttl_remaining?: string; // e.g., "23h 14m"
}

// Phase V: External Market Intelligence (Moat 5)
export interface MarketData {
  pair: string;
  rate: number;
  change_24h: number;
  volatility_index: number;
  trust_level: 'LOW' | 'MEDIUM' | 'HIGH';
  last_updated: string;
}

// NEW: Causal Engine & Simulation Types (Phase II)
export interface DistributionPoint {
  x: number; // The metric value (e.g., Liquidity Premium %)
  y: number; // Probability Density
}

export interface SimulationResult {
  scenario_id: string;
  target_metric_name: string; // e.g., "Liquidity Premium"
  predicted_mean: number;
  confidence_interval_lower: number; // 95% lower bound
  confidence_interval_upper: number; // 95% upper bound
  distribution_data: DistributionPoint[];
  parsed_variables: {
    name: string;
    original_value: string;
    shock_value: string;
    description: string;
  }[];
  cr_score_impact: number; // Projected change in CR-Score
  optimization_advice: string;
  source_moat?: string; // 'MOAT 1 (Policy)' or 'MOAT 5 (Market)'
}

export interface ScenarioPreset {
  id: string;
  label: string;
  query_text: string;
}

// NEW: Governance & Ops Types (Phase IV & V)
export interface ConflictAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category?: 'REGULATORY' | 'MARKET_CAUSALITY' | 'PREDICTIVE_MITIGATION';
  source_directive: string;
  conflicting_contract_var: string;
  description: string;
  detected_at: string;
  status: 'OPEN' | 'FLAGGED_FOR_REVIEW' | 'RESOLVED';
}

export interface VerificationResult {
  asset_uuid: string;
  on_chain_score: number;
  audit_hash: string;
  verification_timestamp: string;
  status: 'VERIFIED' | 'MISMATCH' | 'NOT_FOUND';
}

// NEW: Pre-Trade Predictive Risk Layer (Phase V Strategic Upgrade)
export interface OracleResponse {
  asset_id: string;
  ci_width_percentage: number;
  is_high_risk: boolean;
  timestamp: string;
}

export type MitigationType = 'StandardLock' | 'StagedSettlement' | 'ParameterizedHaircut';

export interface SmartContractState {
  transaction_id: string;
  asset_id: string;
  initial_lock_duration_days: number;
  final_lock_duration_days: number;
  risk_check_passed: boolean; // Did it proceed (even if modified)?
  mitigation_triggered: boolean;
  mitigation_type: MitigationType;
  applied_penalty: string; // Description of penalty e.g., "+24h" or "-5% Haircut"
  status: 'PENDING' | 'EXECUTED' | 'REVERTED';
  market_paused: boolean;
  pause_reason?: string;
}

// V4.3.0 Systemic Constraints
export interface SystemicConstraint {
    id: string;
    metric_name: string;
    current_limit: number;
    description: string;
    last_updated: string;
}

// V6.0.0 Code Audit Engine State
export interface CodeAuditState {
  scan_id: string;
  target_contract: string;
  status: 'IDLE' | 'SCANNING' | 'COMPLETED';
  detected_warning: string | null;
  is_critical: boolean;
  btlf_enforcement_active: boolean; // Is the market halted due to this warning?
  timestamp: string;
}

// V8.0.0 Moat 5 Diagnostic Types
export type OracleNodeStatus = 'ACTIVE' | 'TIMEOUT' | 'OFFLINE' | 'SYNCING';

export interface OracleNode {
  id: string;
  provider: string;
  status: OracleNodeStatus;
  latency_ms: number;
  attestation_valid: boolean;
}

export interface Moat5Diagnostic {
  timestamp: string;
  aggregate_confidence: number;
  system_status: 'SECURE' | 'AT_RISK' | 'CRITICAL_FAILURE';
  nodes: OracleNode[];
  weighted_logic_active: boolean;
  fallback_mode_active: boolean;
}

// V9.0.0 Parameter Governance ("Living Law")
export interface GovernanceParameter {
    key: string;
    value: number;
    unit: string;
    description: string;
    last_updated: string;
    solidity_type: 'uint256';
}

export interface GovernanceHistoryEvent {
    id: string;
    key: string;
    oldValue: number;
    newValue: number;
    timestamp: string;
    user: string; // e.g., "0xGov...Admin"
}

// V9.0.0 Liquidity Resilience
export interface LiquidityPoolStatus {
    total_capacity: number;
    currently_locked: number;
    available_reserves: number;
    reserve_health_pct: number;
    status: 'HEALTHY' | 'STRAINED' | 'CRITICAL';
    last_injection: string | null;
}

// V9.0.0 Statutory Proof (Legal Evidence)
export interface DecisionBrief {
    id: string;
    asset_ref: string;
    timestamp: string;
    decision_type: 'AUTOMATED_MITIGATION' | 'GOVERNANCE_INTERVENTION' | 'LIQUIDITY_INJECTION';
    narrative: string;
    statutory_citation: string; // e.g., "NBE Directive 5.4"
    digital_signature: string;
}

// V9.1.0 E-PSM Orchestration (Simulation Types)
export enum AuctionState {
    PREPARATION = 'PREPARATION',
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    FINALIZED = 'FINALIZED'
}

export interface Bid {
    investorId: string;
    volume: number;
    price: number;
    timestamp: number; // Time Priority for tie-breaking
}

export interface AuctionWindow {
    auctionId: number;
    startTimestamp: number;
    endTimestamp: number;
    supply: number;
    state: AuctionState;
    bids: Bid[];
    clearingPrice?: number;
    allocations?: any[];
    settlementHash?: string; // V9.1.0 Finality Proof
    version?: number; // Concurrency sequence version
    lastModified?: number; // Concurrency timestamp
    lastModifiedByTab?: string; // Tab / client identity
}