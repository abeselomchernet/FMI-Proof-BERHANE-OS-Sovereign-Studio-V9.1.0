import { 
  RawLoan, AssetLedgerItem, RegulatoryChunk, MarketData, 
  SimulationResult, ConflictAlert, VerificationResult, 
  SmartContractState, SystemicConstraint, CodeAuditState, 
  GovernanceParameter, LiquidityPoolStatus, DecisionBrief, 
  GovernanceHistoryEvent, AuctionState, AuctionWindow, Bid 
} from '../types';
import { TARGET_BERHANE_SCORE } from '../constants';

// --- State Stores (In-Memory for Demo) ---

let CURRENT_AUCTION: AuctionWindow = {
    auctionId: 101,
    startTimestamp: Date.now(),
    endTimestamp: Date.now() + 172800000, // +48h
    supply: 50000,
    state: AuctionState.PREPARATION,
    bids: []
};

let LEGAL_BRIEFS_STORE: DecisionBrief[] = [
    {
        id: 'DB-MSME-1004',
        asset_ref: 'MSME-1004-REF',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        decision_type: 'LIQUIDITY_INJECTION',
        narrative: "Asset failing settlement due to counterparty delay. Automatic injection triggered under Directive 5.4 to preserve T+1 finality.",
        statutory_citation: "NBE Directive 5.4 / Art 9",
        digital_signature: "0x8f7...e21"
    }
];

let GOVERNANCE_PARAMS: GovernanceParameter[] = [
    { key: 'MIN_CR_SCORE', value: 9.0, unit: 'pts', description: 'Minimum credit score for securitization eligibility.', last_updated: new Date().toISOString(), solidity_type: 'uint256' },
    { key: 'LCR_BUFFER', value: 15.0, unit: '%', description: 'Liquidity Coverage Ratio buffer requirement.', last_updated: new Date().toISOString(), solidity_type: 'uint256' },
    { key: 'HAIRCUT_BASE', value: 5.0, unit: '%', description: 'Base haircut for distressed asset collateralization.', last_updated: new Date().toISOString(), solidity_type: 'uint256' }
];

let GOVERNANCE_HISTORY: GovernanceHistoryEvent[] = [];

let LIQUIDITY_STATUS: LiquidityPoolStatus = {
    total_capacity: 15000000, // 15M
    currently_locked: 4500000, // 4.5M
    available_reserves: 10500000, // 10.5M
    reserve_health_pct: 70,
    status: 'HEALTHY',
    last_injection: null
};

let MARKET_PAUSED = false;
let AUDIT_STATE: CodeAuditState | null = null;
let SYSTEMIC_CONSTRAINTS: SystemicConstraint[] = [
    { id: 'SC-01', metric_name: 'Total Value Locked (TVL)', current_limit: 45, description: 'Percentage of total reserves currently locked in active settlements.', last_updated: new Date().toISOString() },
    { id: 'SC-02', metric_name: 'Volatility Exposure', current_limit: 12, description: 'Maximum allowable exposure to high-volatility assets.', last_updated: new Date().toISOString() }
];

// Helper for UUID
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// --- Mock Data Generators ---

export function generateMockRawLoans(count: number): RawLoan[] {
    const loans: RawLoan[] = [];
    for (let i = 0; i < count; i++) {
        loans.push({
            loan_id: `LN-${Math.floor(Math.random() * 10000)}`,
            value_etb: Math.floor(Math.random() * 5000000) + 100000,
            trad_score: Math.floor(Math.random() * 5) + 3, // 3-8
            uploaded_at: new Date().toISOString(),
            source_file_name: 'batch_upload_v1.csv',
            applicant_name: `Applicant ${Math.floor(Math.random() * 100)}`
        });
    }
    return loans;
}

export function generateMockRegulatoryChunks(): RegulatoryChunk[] {
    return [
        {
            chunk_id: 'REG-001',
            content: 'The National Bank of Ethiopia (NBE) hereby mandates that all securitized assets must maintain a minimum Liquidity Coverage Ratio (LCR) of 115% during periods of high volatility.',
            source_institution: 'NBE',
            reference_number: 'NBE/DIR/2025/001',
            date_of_issuance: new Date().toISOString(),
            access_level: 'PUBLIC',
            regulatory_causality: 'DIR-2024-99',
            is_redacted: false,
            extraction_method: 'NER_MODEL_V4',
            cache_status: 'HIT_TTL_24H',
            cache_ttl_remaining: '12h 30m'
        },
        {
            chunk_id: 'REG-002',
            content: 'Confidential: [REDACTED_SENSITIVE_DATA] strategy for foreign exchange allocation impacting Grade A securitization vehicles.',
            source_institution: 'NBE',
            reference_number: 'NBE/INT/2025/042',
            date_of_issuance: new Date().toISOString(),
            access_level: 'CONFIDENTIAL',
            regulatory_causality: null,
            is_redacted: true,
            extraction_method: 'REGEX_SPLIT',
            cache_status: 'MISS'
        }
    ];
}

// --- Business Logic & Transformations ---

export function runAlphaGateTransformation(raw: RawLoan): AssetLedgerItem {
    const imm_uplift = parseFloat((Math.random() * 2.0).toFixed(2)); // 0.0 - 2.0 uplift
    const berhane_score = raw.trad_score + imm_uplift;
    const is_compliant = berhane_score >= TARGET_BERHANE_SCORE;

    return {
        asset_uuid: uuidv4(),
        loan_id: raw.loan_id,
        imm_uplift,
        berhane_score,
        is_alpha_compliant: is_compliant,
        is_sfdr_article9_ready: is_compliant && Math.random() > 0.3,
        provisioning_cost_reduction_pct: 0.35,
        securitization_denomination: 'USD',
        dlt_mint_status: is_compliant ? 'MINTED' : 'REJECTED_ALPHA_GATE_FAIL',
        dlt_txn_hash: is_compliant ? `0x${uuidv4().replace(/-/g, '')}` : null,
        settlement_status: is_compliant ? (Math.random() > 0.8 ? 'SETTLED' : 'PENDING') : 'NOT_APPLICABLE',
        processed_timestamp: new Date().toISOString()
    };
}

export function processBatch(loans: RawLoan[]): AssetLedgerItem[] {
    return loans.map(runAlphaGateTransformation);
}

// --- Market Data ---

export function fetchRealTimeMarketData(): MarketData {
    return {
        pair: 'ETB/USD',
        rate: 120.5 + (Math.random() * 2 - 1), // 119.5 - 121.5
        change_24h: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        volatility_index: 45.2 + (Math.random() * 2 - 1),
        trust_level: 'HIGH',
        last_updated: new Date().toISOString()
    };
}

// --- Causal Engine ---

export function runCausalSimulation(scenarioId: string): SimulationResult {
    // Mock simulation logic
    const baseMean = 8.5;
    let impact = 0;
    let distribution: {x: number, y: number}[] = [];
    
    if (scenarioId === 'capital_reserve_hike') {
        impact = -0.45;
    } else if (scenarioId === 'etb_devaluation') {
        impact = -1.2;
    } else if (scenarioId === 'esx_volatility_stabilization') {
        impact = 0.8;
    }

    const mean = baseMean + impact;
    
    // Generate Gaussian-ish distribution
    for (let i = 0; i < 20; i++) {
        const x = mean - 2 + (i * 0.2);
        const y = Math.exp(-0.5 * Math.pow((x - mean) / 0.5, 2));
        distribution.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    }

    return {
        scenario_id: scenarioId,
        target_metric_name: 'Projected CR-Score',
        predicted_mean: parseFloat(mean.toFixed(2)),
        confidence_interval_lower: parseFloat((mean - 0.4).toFixed(2)),
        confidence_interval_upper: parseFloat((mean + 0.4).toFixed(2)),
        distribution_data: distribution,
        parsed_variables: [
            { name: 'NBE_Reserve_Ratio', original_value: '15%', shock_value: scenarioId === 'capital_reserve_hike' ? '20%' : '15%', description: 'Capital Reserve Requirement' },
            { name: 'Market_Volatility', original_value: 'High', shock_value: scenarioId === 'esx_volatility_stabilization' ? 'Low' : 'High', description: 'ESX Volatility Index' }
        ],
        cr_score_impact: impact,
        optimization_advice: impact < 0 
            ? 'Recommend increasing collateralization ratio by 5% to offset policy shock.'
            : 'Conditions favorable for aggressive securitization. Consider expanding asset pool.',
        source_moat: scenarioId.includes('esx') || scenarioId.includes('etb') ? 'MOAT 5 (Market)' : 'MOAT 1 (Policy)'
    };
}

// --- Conflict Monitor ---

export function runConflictScan(): Promise<ConflictAlert[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (Math.random() > 0.5) {
                resolve([]);
            } else {
                resolve([{
                    id: `CONF-${Date.now()}`,
                    severity: 'CRITICAL',
                    category: 'REGULATORY',
                    source_directive: 'NBE Directive 5.4 (New)',
                    conflicting_contract_var: 'BTLF_Protocol.sol: LOCK_DURATION',
                    description: 'Directive 5.4 requires 45-day lock for Grade B assets. Contract currently set to 30 days.',
                    detected_at: new Date().toISOString(),
                    status: 'OPEN'
                }]);
            }
        }, 1500);
    });
}

// --- Asset Verification ---

export function verifyAssetOnChain(uuid: string): Promise<VerificationResult> {
    return new Promise(resolve => {
        setTimeout(() => {
            const exists = Math.random() > 0.2;
            resolve({
                asset_uuid: uuid,
                on_chain_score: exists ? 9.2 : 0,
                audit_hash: exists ? `0x${uuidv4().replace(/-/g,'')}` : '',
                verification_timestamp: new Date().toISOString(),
                status: exists ? 'VERIFIED' : 'NOT_FOUND'
            });
        }, 1000);
    });
}

// --- BTLF Simulator ---

export function simulateBTLFTransaction(assetId: string): Promise<SmartContractState> {
    return new Promise(resolve => {
        setTimeout(() => {
            const paused = MARKET_PAUSED;
            if (paused) {
                resolve({
                    transaction_id: `TX-${uuidv4().substring(0,8)}`,
                    asset_id: assetId,
                    initial_lock_duration_days: 30,
                    final_lock_duration_days: 30,
                    risk_check_passed: false,
                    mitigation_triggered: false,
                    mitigation_type: 'StandardLock',
                    applied_penalty: 'None',
                    status: 'REVERTED',
                    market_paused: true,
                    pause_reason: 'Circuit Breaker Active (Audit Enforcement)'
                });
                return;
            }

            const risky = Math.random() > 0.5;
            resolve({
                transaction_id: `TX-${uuidv4().substring(0,8)}`,
                asset_id: assetId,
                initial_lock_duration_days: 30,
                final_lock_duration_days: risky ? 45 : 30,
                risk_check_passed: true,
                mitigation_triggered: risky,
                mitigation_type: risky ? 'StagedSettlement' : 'StandardLock',
                applied_penalty: risky ? '+15 Days Lock' : 'None',
                status: 'EXECUTED',
                market_paused: false
            });
        }, 1500);
    });
}

export function toggleMarketPause(state: boolean): void {
    MARKET_PAUSED = state;
}

export function clearEmergencyHalt(): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => {
            MARKET_PAUSED = false;
            AUDIT_STATE = null;
            resolve(true);
        }, 2000);
    });
}

// --- Systemic Constraints ---

export function getSystemicConstraints(): Promise<SystemicConstraint[]> {
    return Promise.resolve(SYSTEMIC_CONSTRAINTS);
}

// --- Autonomous Code Audit ---

export function runAutonomousCodeAudit(): Promise<CodeAuditState> {
    return new Promise(resolve => {
        setTimeout(() => {
            const critical = true; // For demo purpose
            const auditResult: CodeAuditState = {
                scan_id: `SCAN-${Date.now()}`,
                target_contract: 'BTLF_Protocol.sol',
                status: 'COMPLETED',
                detected_warning: critical ? 'Invariant Violation: Solvency Ratio < 110% under Stress Test T-5' : null,
                is_critical: critical,
                btlf_enforcement_active: critical,
                timestamp: new Date().toISOString()
            };
            AUDIT_STATE = auditResult;
            if (critical) MARKET_PAUSED = true;
            resolve(auditResult);
        }, 3000);
    });
}

export function deployV801Patch(): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}

// --- KPI & SIPA ---

export function calculateLiveKPIs(): Promise<{lcr: number, distribution: Record<string, number>}> {
    return Promise.resolve({
        lcr: 125.5,
        distribution: { 'Grade A': 45, 'Grade B': 35, 'Distressed': 20 }
    });
}

export function runSystemIntegrityAudit(logCallback: (line: string) => void): Promise<void> {
    return new Promise(resolve => {
        const steps = [
            "Initializing SIPA Diagnostic Kernel...",
            "Connecting to Oracle Node [0x4a...9f]...",
            "Verifying Merkle Roots for Block 19,204,112...",
            "Checking Moat 4 Ingress Gateways...",
            "Latency: 14ms | Jitter: 2ms | Packet Loss: 0%",
            "WARNING: Elevated volatility detected in Asset Class B...",
            "Validating Liquidity Reserves (NBE Account)...",
            "SIPA Audit Complete. System Status: GREEN."
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(interval);
                resolve();
            } else {
                logCallback(steps[i]);
                i++;
            }
        }, 800);
    });
}

// --- Governance Parameter Registry ---

export function getGovernanceParameters(): Promise<GovernanceParameter[]> {
    return Promise.resolve([...GOVERNANCE_PARAMS]);
}

export function updateGovernanceParameter(key: string, value: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            const param = GOVERNANCE_PARAMS.find(p => p.key === key);
            if (param) {
                const oldValue = param.value;
                param.value = value;
                param.last_updated = new Date().toISOString();
                
                GOVERNANCE_HISTORY.unshift({
                    id: uuidv4(),
                    key: key,
                    oldValue: oldValue,
                    newValue: value,
                    timestamp: new Date().toISOString(),
                    user: '0xAdmin...882'
                });
            }
            resolve();
        }, 1000);
    });
}

export function getGovernanceHistory(): Promise<GovernanceHistoryEvent[]> {
    return Promise.resolve([...GOVERNANCE_HISTORY]);
}

// --- Liquidity Pool ---

export function getLiquidityPoolStatus(): Promise<LiquidityPoolStatus> {
    return Promise.resolve({...LIQUIDITY_STATUS});
}

export function injectLiquidity(assetUuid: string): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            // Update liquidity status simulation
            LIQUIDITY_STATUS.currently_locked -= 500000;
            LIQUIDITY_STATUS.available_reserves -= 500000;
            LIQUIDITY_STATUS.last_injection = new Date().toISOString();
            
            // Log decision brief
            LEGAL_BRIEFS_STORE.unshift({
                id: `DB-INJ-${Math.floor(Math.random() * 1000)}`,
                asset_ref: assetUuid,
                timestamp: new Date().toISOString(),
                decision_type: 'LIQUIDITY_INJECTION',
                narrative: `Forced settlement injection executed for ${assetUuid} to prevent liquidity crunch.`,
                statutory_citation: 'NBE Directive 5.4 / Art 9',
                digital_signature: `0x${uuidv4().replace(/-/g,'').substring(0,16)}`
            });
            resolve();
        }, 2000);
    });
}

export function getLegalBriefs(): Promise<DecisionBrief[]> {
    return Promise.resolve([...LEGAL_BRIEFS_STORE]);
}

// --- Auction Engine ---

export function getCurrentAuctionState(): Promise<AuctionWindow> {
    return Promise.resolve({...CURRENT_AUCTION});
}

export function advanceAuctionState(): Promise<AuctionWindow> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (CURRENT_AUCTION.state === AuctionState.PREPARATION) {
                CURRENT_AUCTION.state = AuctionState.OPEN;
            } else if (CURRENT_AUCTION.state === AuctionState.OPEN) {
                CURRENT_AUCTION.state = AuctionState.CLOSED;
                // Auto-finalize triggers in real system, here we wait for manual or call it separately?
                // For demo, let's auto-finalize if advancing from CLOSED to FINALIZED manually,
                // but usually the button "Advance Time" might just close it.
                // Let's assume this func moves to next logical state.
                finalizeAuction().catch(() => {}); // Attempt auto-finalize if closing
            } else if (CURRENT_AUCTION.state === AuctionState.CLOSED) {
                // If closed, advancing might mean finalizing? 
                // Usually finalize is separate. Let's say advance does nothing if closed unless finalized.
            }
            resolve({...CURRENT_AUCTION});
        }, 500);
    });
}

export function submitBid(investorId: string, volume: number, price: number): Promise<void> {
    return new Promise((resolve, reject) => {
         if (CURRENT_AUCTION.state !== AuctionState.OPEN) {
             reject(new Error("Auction not OPEN"));
             return;
         }
         CURRENT_AUCTION.bids.push({
             investorId, volume, price, timestamp: Date.now()
         });
         resolve();
    });
}

export function resetAuction(): Promise<void> {
    return new Promise(resolve => {
        CURRENT_AUCTION = {
            auctionId: CURRENT_AUCTION.auctionId + 1,
            startTimestamp: Date.now(),
            endTimestamp: Date.now() + 172800000,
            supply: 50000,
            state: AuctionState.PREPARATION,
            bids: []
        };
        resolve();
    });
}

// AuctionEngine Logic (Deterministic Clearing)
export function finalizeAuction(): Promise<{ clearingPrice: number, allocations: any[], settlementHash: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Idempotency check: If already finalized, return existing result without error
            if (CURRENT_AUCTION.state === AuctionState.FINALIZED) {
                resolve({
                    clearingPrice: CURRENT_AUCTION.clearingPrice || 0,
                    allocations: CURRENT_AUCTION.allocations || [],
                    settlementHash: CURRENT_AUCTION.settlementHash || ''
                });
                return;
            }

            if (CURRENT_AUCTION.state !== AuctionState.CLOSED) {
                reject(new Error("Auction must be CLOSED to finalize."));
                return;
            }

            // 1. Sort Bids (Highest Price First; Time Priority for ties)
            const sortedBids = [...CURRENT_AUCTION.bids].sort((a, b) => {
                if (b.price !== a.price) {
                    return b.price - a.price; // Descending price
                }
                return a.timestamp - b.timestamp; // Ascending time (Oldest bid wins tie)
            });

            let cumulativeDemand = 0;
            let clearingPrice = 0;
            let tradeAllocations: any[] = [];
            let remainingSupply = CURRENT_AUCTION.supply;

            // 2. Determine Clearing Price (UCP)
            for (const bid of sortedBids) {
                cumulativeDemand += bid.volume;
                if (cumulativeDemand >= CURRENT_AUCTION.supply && clearingPrice === 0) {
                    clearingPrice = bid.price;
                    break;
                }
            }
            
            // Edge Case: If demand < supply
            if (clearingPrice === 0 && sortedBids.length > 0) {
                 clearingPrice = sortedBids[sortedBids.length - 1].price;
            }

            // 3. Trade Execution & Allocation at UCP
            for (const bid of sortedBids) {
                if (bid.price >= clearingPrice) {
                    const allocatedVolume = Math.min(bid.volume, remainingSupply);
                    
                    if (allocatedVolume > 0) {
                        tradeAllocations.push({ 
                            investor: bid.investorId, 
                            volume: allocatedVolume, 
                            price: clearingPrice 
                        });
                        remainingSupply -= allocatedVolume;
                    }
                }
            }
            
            // Deterministic Hash Generation (FMI Requirement)
            // Hash = Hash(AuctionID + UCP + AllocationCount + TotalVolume)
            const inputString = `${CURRENT_AUCTION.auctionId}-${clearingPrice}-${tradeAllocations.length}-${tradeAllocations.reduce((acc, curr) => acc + curr.volume, 0)}`;
            let hashVal = 0;
            for (let i = 0; i < inputString.length; i++) {
                const char = inputString.charCodeAt(i);
                hashVal = ((hashVal << 5) - hashVal) + char;
                hashVal |= 0;
            }
            // Generate a 'hex' string from the deterministic math, padded to simulate a bytes32
            const deterministicPart = Math.abs(hashVal).toString(16).padStart(8, '0');
            const settlementHash = `0x${deterministicPart}0000000000000000000000000000000000000000000000`;

            // Update State with Persistence
            CURRENT_AUCTION = {
                ...CURRENT_AUCTION,
                state: AuctionState.FINALIZED,
                clearingPrice: clearingPrice,
                allocations: tradeAllocations,
                settlementHash: settlementHash 
            };
            
            // Log Statutory Proof (Audit)
            LEGAL_BRIEFS_STORE.unshift({
                id: `DB-AUC-${CURRENT_AUCTION.auctionId}`,
                asset_ref: `AUCTION-${CURRENT_AUCTION.auctionId}`,
                timestamp: new Date().toISOString(),
                decision_type: 'AUTOMATED_MITIGATION',
                narrative: `Auction ${CURRENT_AUCTION.auctionId} cleared at UCP ${clearingPrice}. Total Allocations: ${tradeAllocations.length}. Deterministic logic verified. Settlement Intent Hash: ${settlementHash}`,
                statutory_citation: 'E-PSM Rulebook Art. 4.1',
                digital_signature: `0x${uuidv4().replace(/-/g, '')}`
            });

            // Simulate Event Emission for CSD Adapter
            console.log(`[AuctionEngine] SettlementIntent emitted: ${settlementHash} (Triggering CSD Handoff)`);

            resolve({ clearingPrice, allocations: tradeAllocations, settlementHash });
        }, 1000);
    });
}
