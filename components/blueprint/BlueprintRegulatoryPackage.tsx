import React, { useState } from 'react';
import { Gavel, ChevronDown, ChevronRight } from 'lucide-react';

export const BlueprintRegulatoryPackage: React.FC = () => {
  const [auditPackageExpanded, setAuditPackageExpanded] = useState(false);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div 
        className="p-6 bg-slate-950 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={() => setAuditPackageExpanded(!auditPackageExpanded)}
      >
        <div className="flex items-center gap-3">
          <Gavel className="w-6 h-6 text-berhane-gold" />
          <div>
            <h3 className="text-xl font-bold text-white">18. Regulatory Audit Package</h3>
            <p className="text-xs text-slate-500">External Submission Artifact (ECMA, NBE)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-emerald-900/20 border border-emerald-900/50 rounded text-emerald-400 text-xs font-bold tracking-wider">
            AUDIT READY
          </div>
          {auditPackageExpanded ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
        </div>
      </div>

      {auditPackageExpanded && (
        <div className="p-6 border-t border-slate-800 animate-in slide-in-from-top-4">
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="p-4 font-bold">Compliance Requirement</th>
                  <th className="p-4 font-bold">Verification Artifact</th>
                  <th className="p-4 font-bold text-right">Certification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">1. Code Determinism</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    AuctionEngine.sol SMT Proofs (P1, P4) <span className="text-slate-600">- Sec 14</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-xs font-bold">PROVEN</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">2. Settlement Finality</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    FMI Test Vector T-11 (Immutability) <span className="text-slate-600">- Sec 17</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-xs font-bold">PASS</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">3. Volume Solvency</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    SMT Proof P3 (Total Allocated ≤ Supply) <span className="text-slate-600">- Sec 11</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-xs font-bold">PROVEN</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">4. Operational Resilience</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    FMI Test Vectors T-9 & T-10 (Crisis/Overload) <span className="text-slate-600">- Sec 17</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-berhane-gold/10 text-berhane-gold rounded border border-berhane-gold/20 text-xs font-bold">FMI COMPLIANT</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">5. QIB Eligibility Gate</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    InvestorOnboardGuard.sol (ECMA Rule) <span className="text-slate-600">- Sec 14</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20 text-xs font-bold">ACTIVE</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">6. Alpha Gate Integrity</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    SMT Proof P6 (Eligible ⇔ Score ≥ 9.0) <span className="text-slate-600">- Sec 16</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-xs font-bold">PROVEN</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-bold text-white">7. Sovereign Guarantee</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    SMT Proof P7 (Atomicity 3-Part Check) <span className="text-slate-600">- Sec 16</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-xs font-bold">PROVEN</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
