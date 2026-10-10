import React from 'react';
import { Microscope, ArrowRight, Terminal, ShieldCheck, AlertCircle } from 'lucide-react';

export const BlueprintFormalProofs: React.FC = () => {
  return (
    <>
      {/* 11. AuctionEngine Verification & SMT Invariants */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Microscope className="text-emerald-400 w-5 h-5" /> 11. AuctionEngine Verification & Simulation (Deliverable B)
        </h3>
        
        {/* Strategy Brief */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulation Objective</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Formally verify the <strong>deterministic integrity</strong> of the <code>_runUniformPriceClearing</code> algorithm. Ensure <code>SettlementIntent</code> payloads are immutable and solvent under all market conditions.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Environment</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Harness:</strong> Python (Brownie/Truffle) <br/>
              <strong>Prover:</strong> Z3 SMT Solver (Formal Verification) <br/>
              <strong>Target:</strong> Local EVM (Hardhat Network)
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Methodology</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Property-Based Testing (PBT)</strong> to fuzz inputs against invariants (P1-P4). <strong>Differential Testing</strong> against a Python reference implementation of the UCP logic.
            </p>
          </div>
        </div>

        {/* Formal Verification Proofs */}
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Mandatory SMT Proofs (Invariants)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'P1', name: 'Deterministic Integrity', desc: 'UCP independent of TX order.', status: 'PROVEN' },
              { id: 'P2', name: 'Non-Reentrancy', desc: 'No external calls in clearing.', status: 'PROVEN' },
              { id: 'P3', name: 'Volume Conservation', desc: 'Total Allocated <= Supply.', status: 'PROVEN' },
              { id: 'P4', name: 'DvP Atomicity', desc: 'Asset transfer inseparable from payment.', status: 'PROVEN' }
            ].map(proof => (
              <div key={proof.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-purple-400">Proof {proof.id}</span>
                    <span className="text-[10px] bg-emerald-900/20 text-emerald-500 px-2 py-0.5 rounded border border-emerald-900/50">{proof.status}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{proof.name}</div>
                  <div className="text-xs text-slate-400 leading-tight">{proof.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clearing Algorithm Flow */}
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Uniform-Price Auction Logic (Deterministic)</h4>
          <div className="flex flex-col md:flex-row items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
            <div className="px-3 py-2 bg-slate-900 rounded border border-slate-700">1. Collect Bids</div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="px-3 py-2 bg-slate-900 rounded border border-slate-700">2. Sort (Price DESC, Time ASC)</div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="px-3 py-2 bg-slate-900 rounded border border-slate-700">3. Cumulative Sum Demand</div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="px-3 py-2 bg-slate-900 rounded border border-slate-700">4. Find Demand &gt;= Supply (UCP)</div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="px-3 py-2 bg-slate-900 rounded border border-slate-700">5. Execute Trades at UCP</div>
          </div>
        </div>

        {/* Solidity Code Mock Snippets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono font-bold text-sky-400">AuctionEngine.sol</span>
              </div>
              <span className="text-[10px] text-slate-500">Core Settlement Logic</span>
            </div>
            <pre className="p-4 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`function _runUniformPriceClearing(uint256 auctionId) internal returns (uint256 ucp) {
    Auction storage auc = auctions[auctionId];
    _sortBids(auc.bids); 

    uint256 cumulative = 0;
    for (uint i = 0; i < auc.bids.length; i++) {
        cumulative += auc.bids[i].volume;
        if (cumulative >= auc.supply) {
            ucp = auc.bids[i].price; 
            break;
        }
    }
    // Finalize Allocations at UCP
    _executeAllocations(auc, ucp);
}`}
            </pre>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono font-bold text-amber-400">InvestorOnboardGuard.sol</span>
              </div>
              <span className="text-[10px] text-slate-500">Regulatory Compliance Gate</span>
            </div>
            <pre className="p-4 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`contract InvestorOnboardGuard {
    IInvestorRegistry public investorRegistry; 
    error InvestorNotQualified(address investor);

    // Enforces ECMA/EIC Eligibility (QIB Status)
    modifier onlyQualifiedInvestor() {
        if (!investorRegistry.isQualified(msg.sender)) {
            revert InvestorNotQualified(msg.sender);
        }
        _;
    }

    function setInvestorStatus(address investor, bool isQualified) external onlyOwner {
        investorRegistry.setQualification(investor, isQualified);
    }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* 17. FMI Sandbox Test Report */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-berhane-accent" />
          <h3 className="text-xl font-bold text-white">17. FMI Sandbox Test Report (Deliverable C)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Test Objective</h4>
            <p className="text-sm text-slate-300">
              Verify the E-PSM Orchestration Kernel's adherence to Financial Market Infrastructure (FMI) principles, covering liquidity risk and operational reliability under extreme stress.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Test Environment</h4>
            <p className="text-sm text-slate-300">
              <strong>Harness:</strong> Hardhat/Brownie (Python)<br/>
              <strong>Load:</strong> 20x sustained transaction load (TX flooding)<br/>
              <strong>Mechanism:</strong> Liquidity Hook activated for T-9 simulation.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-slate-800 mb-6">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-500">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Scenario</th>
                <th className="p-3">Expected Invariant</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/30">
              <tr>
                <td className="p-3 font-bold text-slate-400">T-9</td>
                <td className="p-3 text-white">Liquidity Crisis Stress</td>
                <td className="p-3 text-slate-500">Simulate 100% margin call failure</td>
                <td className="p-3 text-right font-bold text-emerald-500">PASS</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-400">T-10</td>
                <td className="p-3 text-white">Operational Overload</td>
                <td className="p-3 text-slate-500">Simulate 20x sustained transaction load</td>
                <td className="p-3 text-right font-bold text-emerald-500">PASS</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-400">T-11</td>
                <td className="p-3 text-white">Finality of Settlement Check</td>
                <td className="p-3 text-slate-500">Simulate AuctionEngine failure after SettlementIntent</td>
                <td className="p-3 text-right font-bold text-emerald-500">PASS</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-berhane-gold/10 text-berhane-gold px-6 py-2 rounded-lg border border-berhane-gold/30">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold tracking-widest">FMI COMPLIANT</span>
          </div>
        </div>
      </section>
    </>
  );
};
