import React from 'react';
import { BlueprintAuctionEngine } from './blueprint/BlueprintAuctionEngine';
import { BlueprintFormalProofs } from './blueprint/BlueprintFormalProofs';
import { BlueprintRegulatoryPackage } from './blueprint/BlueprintRegulatoryPackage';
import { BlueprintPitchDeck } from './blueprint/BlueprintPitchDeck';

export const SystemBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          System Blueprint
        </h2>
        <p className="text-slate-400 text-sm">
          Architecture, Verification Matrices & Live Simulation
        </p>
      </div>

      {/* 11. AuctionEngine Formal Verification & Test Environment */}
      <BlueprintFormalProofs />

      {/* 15. Live Auction Simulation Console (V9.1.0 Kernel) */}
      <BlueprintAuctionEngine />

      {/* 18. Regulatory Audit Package (External Submission) */}
      <BlueprintRegulatoryPackage />

      {/* 19. Strategic Pitch Deck Structure (Module 6) */}
      <BlueprintPitchDeck />
    </div>
  );
};

export default SystemBlueprint;
