# BERHANE OS Sovereign Studio V9.1.0-beta
### Institutional Proof-of-Concept & Financial Anti-Fragility Simulation Engine

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js: 22](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React: 19](https://img.shields.io/badge/React-19.x-cyan.svg)](https://react.dev/)
[![Status: Prototype / Demo](https://img.shields.io/badge/Status-Simulation%20Demo-orange.svg)]()
[![Build: Passing](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

---

> ### ⚠️ PUBLIC DEMONSTRATION & CRITICAL DISCLAIMER
> **This software is an experimental prototype and demonstration sandbox.**
> 
> * **SYNTHETIC MOCK DATA ONLY**: All loan books, applicant identities, credit risk scores (CR-Scores), National Bank of Ethiopia (NBE) regulatory citations, currency exchange pairs, and auction orders displayed in this studio are computer-generated synthetic mock data.
> * **SIMULATED BLOCKCHAIN & CRYPTOGRAPHY**: All distributed ledger transaction hashes (`0x...`), Merkle roots, and settlement intent proofs are pseudo-random mathematical mock strings. No live blockchain, EVM network, Central Securities Depository (CSD), or central bank core system is connected.
> * **NOT PRODUCTION READY**: This codebase does not provide production-grade security, live financial custody, regulatory compliance enforcement, or persistent ACID database storage. **Do not execute real-world financial transactions or rely on these simulations for capital allocation or statutory filings.**

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Theoretical Foundation & Problem Statement](#2-theoretical-foundation--problem-statement)
3. [Architecture Overview (The 5 Moats)](#3-architecture-overview-the-5-moats)
4. [Component & Subsystem Inventory](#4-component--subsystem-inventory)
5. [Installation & Setup Instructions](#5-installation--setup-instructions)
6. [Gemini AI Copilot Configuration](#6-gemini-ai-copilot-configuration)
7. [Known Gaps for Production Readiness](#7-known-gaps-for-production-readiness)
8. [Production Readiness Roadmap](#8-production-readiness-roadmap)
9. [Sprint History & Development Milestones](#9-sprint-history--development-milestones)
10. [Version Changelog](#10-version-changelog)
11. [Contributing & Open Source Governance](#11-contributing--open-source-governance)

---

## 1. Project Overview

**BERHANE OS Sovereign Studio** is an architectural prototype designed to demonstrate how an emerging market sovereign financial system can withstand macroeconomic shocks, currency volatility, and credit illiquidity.

In emerging economies, micro, small, and medium enterprise (MSME) debt is frequently trapped on commercial bank balance sheets due to punitive capital provisioning mandates, lack of standardized credit assessment, and absent secondary market liquidity. 

The studio demonstrates an end-to-end institutional workflow:
- **Phase I**: Multi-modal ingestion of unstandardized raw credit books (CSV) and unstructured regulatory directives (PDF).
- **Phase II**: Causal Mapping Engine (CME) running Monte Carlo stress simulations against regulatory and exchange rate shocks.
- **Phase III**: AI Alpha Gate applying quantifiable Immutable Mitigation Mechanism (IMM) uplift to elevate loans to an institutional Credit Rating threshold (**CR-Score $\ge$ 9.0**).
- **Phase IV**: Securitization Asset Ledger and Data Mart partitioning with simulated Central Securities Depository (CSD) readiness.
- **Phase V**: Electronic Primary Settlement Mechanism (E-PSM) auction clearing and "Living Law" programmatic governance.
- **AI Layer**: Full-stack conversational copilot powered by Google Gemini models (`gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`) and local knowledge fallback.

---

## 2. Theoretical Foundation & Problem Statement

### The Dual-Sided Failure in Emerging Market Credit
1. **Lenders' Dilemma**: Banks face steep provisioning penalties (often 100% risk-weighted) on small business loans, locking up liquid reserves that could otherwise fund economic growth.
2. **Investors' Dilemma**: Foreign institutional and qualified institutional buyers (QIBs) have surplus capital but cannot invest in local MSME assets due to lack of transparent, verifiable credit scores and absence of secondary market exit liquidity.

### The BERHANE OS Anti-Fragility Hypothesis
BERHANE OS models a system where assets become stronger under stress by enforcing automated covenants:
$$\text{CR-Score} = \text{Traditional Score} + \text{IMM Uplift}$$
$$\text{Provisioning Cost Reduction} = 35\% \quad \text{when } \text{CR-Score} \ge 9.0$$

When macroeconomic shocks occur (e.g., currency devaluations or capital reserve hikes), automated circuit breakers and staged settlements preserve sovereign bank balance sheets without triggering contagion runs.

---

## 3. Architecture Overview (The 5 Moats)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    BERHANE OS SOVEREIGN ARCHITECTURE                         │
├──────────────────────┬──────────────────────┬────────────────────────────────┤
│ MOAT 1: POLICY       │ MOAT 2: WAREHOUSE    │ MOAT 3: TRANSFORMATION         │
│ Smart Learner (PDF)  │ Asset Ledger & Marts │ AI Alpha Gate Logic            │
│ • NBE Directives     │ • Raw Loan Book      │ • IMM Uplift Calculator        │
│ • SFDR Article 9 ESG │ • Partitioned Marts  │ • CR-Score Thresholding (≥9.0) │
├──────────────────────┼──────────────────────┼────────────────────────────────┤
│ MOAT 4: CAUSAL       │ MOAT 5: ORACLES      │ E-PSM AUCTION SYSTEM           │
│ Causal Mapping (CME) │ Market Intelligence  │ Uniform Price Clearing (UCP)   │
│ • Monte Carlo Runs   │ • ETB/USD Rates      │ • Deterministic FIFO Priority  │
│ • Shock Distributions│ • Volatility Index   │ • Bytes32 Settlement Intent    │
├──────────────────────┴──────────────────────┴────────────────────────────────┤
│ GOVERNANCE & LIVING LAW (PHASE V)                                            │
│ • Bank-Treasury Liquidity Facility (BTLF) Circuit Breakers                   │
│ • Autonomous Solvency Invariant Code Audit                                   │
│ • Statutory Legal Brief Evidence Logging                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Subsystem Architecture Details

#### Moat 1: Policy Indexing (Smart Learner)
Models automated ingestion of central bank circulars (e.g., National Bank of Ethiopia Directive SBB/95/2025) and international sustainability standards (SFDR Article 9). In this demo, chunking, redaction, and NER classification are simulated.

#### Moat 2: Data Warehouse Architecture
Reflects two core table structures:
- `raw_loan_book`: Unprocessed bank records containing loan ID, face value in Ethiopian Birr (ETB), traditional score (3–8), and borrower metadata.
- `securitization_asset_ledger`: Enriched institutional records containing asset UUID, IMM uplift, CR-Score, DLT mint status, and settlement state.

#### Moat 3: AI Alpha Gate Transformation
Processes raw batches sequentially. Evaluates risk factors and awards verifiable uplift (+0.0 to +2.0). Loans achieving a CR-Score $\ge 9.0$ are minted into the asset pool; failing assets can receive issuer remediation commitments (+1.0 uplift).

#### Moat 4: Causal Mapping Engine (CME)
Evaluates policy shock queries (e.g., *"What-if NBE raises minimum capital reserves from 15% to 20%?"*). Calculates impact on CR-Scores and plots a 20-point Gaussian probability density curve over 10,000 simulated Monte Carlo iterations.

#### Moat 5: External Market Intelligence
Simulates a multi-node oracle network streaming real-time ETB/USD spot rates, 24-hour delta volatility, and node health attestation.

#### E-PSM Auction Engine
Executes a deterministic primary market clearing auction:
1. Aggregates bids from qualified investors.
2. Orders bids by descending price, resolving ties using timestamp FIFO priority.
3. Computes the Uniform Clearing Price (UCP) where cumulative volume meets supply.
4. Generates a deterministic `bytes32` hash representing settlement finality.

---

## 4. Component & Subsystem Inventory

| Subsystem | Source Path | Description | Demo Simulation Scope |
| :--- | :--- | :--- | :--- |
| **Studio Dashboard** | `components/Dashboard.tsx` | Overview cards, CR-Score distribution, and live ticker. | Simulated state using Recharts. |
| **System Blueprint** | `components/SystemBlueprint.tsx` | System diagrams, pitch deck slide navigator, and E-PSM visualizer. | Static UI and in-memory auction engine. |
| **Ingestion Pipeline** | `components/IngestionSimulator.tsx` | Batch CSV and regulatory PDF ingestion simulator. | Generates synthetic loans and mock chunks. |
| **Causal Engine** | `components/CausalEngine.tsx` | Monte Carlo probability curve visualizer for policy shocks. | Mathematical Gaussian density generator. |
| **Alpha Gate** | `components/AlphaGateLogic.tsx` | Loan evaluation pipeline with animated batch executor. | Local transformation and state update. |
| **Asset Ledger** | `components/LedgerView.tsx` | Searchable data table with settlement filters. | Client-side search over in-memory items. |
| **Governance Console** | `components/GovernanceConsole.tsx` | SIPA diagnostics, Living Law parameter registry, decision briefs. | In-memory event array and timer simulation. |
| **Gemini Copilot** | `components/GeminiChatbot.tsx` | Multi-turn AI assistant with localStorage key management. | Server-side `@google/genai` with fallback engine. |
| **Backend Server** | `server.ts` | Express server hosting `/api/chat` and serving Vite SPA. | Full-stack server with CORS/JSON proxy. |
| **Data Service** | `services/dataService.ts` | Central in-memory state store and algorithmic routines. | Pure in-memory arrays and synthetic generators. |

---

## 5. Installation & Setup Instructions

### Prerequisites
- **Node.js**: Version 20.x or 22.x LTS (Node.js 22 is recommended).
- **npm**: Version 10.x or higher.
- **Git**: For source version control.

### Step 1: Clone the Repository
```bash
git clone https://github.com/abeselomchernet/FMI-Proof-BERHANE-OS-Sovereign-Studio-V9.1.0.git
cd FMI-Proof-BERHANE-OS-Sovereign-Studio-V9.1.0
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the template file:
```bash
cp .env.example .env
```
Open `.env` in any text editor and optionally supply your Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```
*(Note: If you leave `GEMINI_API_KEY` blank, the application automatically runs using its built-in Free Sovereign Domain Knowledge Engine).*

### Step 4: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Step 5: Build for Production Distribution
```bash
npm run build
npm start
```

### Step 6: Verify TypeScript Code Quality
```bash
npx tsc --noEmit
```

---

## 6. Gemini AI Copilot Configuration

The studio includes an institutional AI copilot that assists users with risk assessments, regulatory compliance questions, and counterfactual query explanations.

```
[Browser Client] 
      │
      │  (Header: x-gemini-api-key from localStorage)
      ▼
[Express Server (/api/chat)]
      │
      ├─► Has valid key? ──► [@google/genai SDK] ──► Google Cloud Gemini
      │
      └─► No key / Offline? ──► [Built-in BERHANE Sovereign Domain Engine]
```

### Three Model Personas:
1. **Sovereign Risk Officer** (`gemini-3.5-flash`): General financial analysis, loan pool ratings, provisioning reductions.
2. **Causal & Quants Strategist** (`gemini-3.1-pro-preview`): Complex counterfactual reasoning, auction theory, Monte Carlo distributions.
3. **Regulatory Fast-Checker** (`gemini-3.1-flash-lite`): Ultra-low latency statutory checks (Directive 5.4, circuit breakers).

### Persistent Frontend Key Settings:
- Users can click the **Settings icon (⚙️)** in the Copilot header to input their own Gemini API key.
- The key is saved securely in the browser's `localStorage` (`berhane_gemini_api_key`) and sent via headers to `/api/chat`.
- Testers can click **Test Connection** to verify validity, or **Remove Key** to clear it at any time.
- Direct links are provided to generate a [100% Free Gemini API Key](https://aistudio.google.com/app/apikey) with no credit card required.

---

## 7. Known Gaps for Production Readiness

To ensure transparency for auditors, stakeholders, and open-source contributors, the following architectural gaps exist between this demonstration prototype and an institutional production system:

| Domain | Current Demonstration State | Institutional Production Requirement |
| :--- | :--- | :--- |
| **Data Persistence** | **In-memory JavaScript arrays** (`dataService.ts`). State is ephemeral and resets upon server restart. | Enterprise relational database (Cloud SQL PostgreSQL, CockroachDB) with ACID transactions and point-in-time recovery. |
| **Audit Trails** | Append-only in-memory arrays. | Cryptographically verifiable write-once audit log (e.g., Amazon QLDB, immudb, or Merkle-tree event stores). |
| **Blockchain / DLT** | Synthetic string generation (`0x${uuidv4()}`). | Production distributed ledger testnet/mainnet (Hyperledger Besu, Polygon CDK, or Ethereum L2). |
| **Key Custody (HSM)** | No keys; mock digital signatures. | Cloud KMS (GCP KMS / AWS CloudHSM) or hardware security modules with FIPS 140-2 Level 3 certification. |
| **Oracle Verification** | `Math.random()` price and volatility generation. | Decentralized oracle network (Chainlink, Pyth) with cryptographic attestation and TLSNotary proofs. |
| **Authentication & RBAC**| Unauthenticated client access; all users have full administrative controls. | OpenID Connect / SAML 2.0 with hardware MFA and multi-role RBAC (Central Bank Auditor, Originator, Operator). |
| **Document Intelligence**| Static mock PDF chunks and pre-written regex arrays. | Real multimodal OCR, layout analysis (Google Document AI), and vector RAG (pgvector / Vertex Search). |
| **Smart Contract Safety**| Simulated TypeScript classes and state flags (`MARKET_PAUSED`). | Formally verified Solidity/Vyper smart contracts audited by third-party security firms (Certora, Trail of Bits). |
| **Core Banking Linkage** | None. Synthetic batch generator. | Real-time ISO 20022 message gateways connecting to central bank RTGS and commercial bank core systems. |

---

## 8. Production Readiness Roadmap

```
  ┌──────────────────────────────────────────────────────────────┐
  │                 5-PHASE PRODUCTION ROADMAP                   │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     ▼                                                       ▼
[Phase 1: Persistence]                                  [Phase 2: Cryptography]
• PostgreSQL Cloud SQL                                  • Hyperledger Besu Testnet
• Drizzle ORM Schema Migration                          • Cloud KMS Private Key Custody
• Read/Write Connection Pooling                         • Smart Contract Audits (Foundry)
     │                                                       │
     ├───────────────────────────┬───────────────────────────┤
     ▼                                                       ▼
[Phase 3: Security & Auth]                              [Phase 4: Integrations]
• OAuth2 / OIDC Integration                             • ISO 20022 Financial Messaging
• Role-Based Permissions (RBAC)                         • Decentralized Oracles (Chainlink)
• Strict Zero-Trust Network Boundary                    • Real-Time Core Banking API (CBS)
     │                                                       │
     └───────────────────────────┬───────────────────────────┘
                                 │
                                 ▼
                     [Phase 5: Formal Verification]
                     • Mathematical Invariant Proofs (TLA+ / Coq)
                     • Central Bank Regulatory Certification
                     • Penetration Testing & Bug Bounty
```

---

## 9. Sprint History & Development Milestones

- **Sprint 1 (Architecture & Data Modeling)**: Defined TypeScript domain schemas (`types.ts`), established 5-Moat theoretical model, built raw loan generation routines.
- **Sprint 2 (AI Alpha Gate & Scoring)**: Implemented IMM uplift algorithm, CR-Score threshold evaluation, and provisioning discount calculations (35%).
- **Sprint 3 (Causal Mapping Engine - CME)**: Developed Monte Carlo shock distribution logic, built Recharts area visualizers, implemented policy query parsing.
- **Sprint 4 (Governance & Living Law)**: Built Bank-Treasury Liquidity Facility (BTLF) state machine, automated code invariant auditor, and statutory decision brief registry.
- **Sprint 5 (E-PSM Clearing Engine)**: Designed deterministic Uniform Clearing Price (UCP) auction algorithm and hash-chained settlement intent proofs.
- **Sprint 6 (Copilot Integration & Public Hardening)**: Full-stack server migration (`server.ts`), integrated `@google/genai` multi-turn chatbot with persistent localStorage key management, added CSV export capabilities in LedgerView for financial audit records, built LedgerView Asset & Volume summary tracker and Recharts historical processing volume line chart on Dashboard, fixed CI/CD GitHub Actions pipelines, and added prominent demo disclaimers.

---

## 10. Version Changelog

### `v9.1.0-beta` (Current Release)
- **Feature**: **CSV & JSON Import in IngestionSimulator (Phase I Pipeline)**: Full ingestion support for uploading external synthetic loan records via drag-and-drop or file picker, flexible CSV/JSON schema mapping, data validation, sample downloadable CSV and JSON templates, and immediate staging into `BERHANE_DATA_WAREHOUSE.raw_loan_book`.
- **Feature**: Added full-stack **Gemini Sovereign Copilot** with 3 distinct models (`gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`).
- **Feature**: Persistent frontend API key settings modal with `localStorage` persistence and live connectivity test.
- **Feature**: Built-in Free Sovereign Domain Knowledge Engine fallback when running without cloud API keys.
- **Feature**: **Real-Time Text Search in LedgerView & Securitization Mart**: Live interactive search input filtering synthetic assets by borrower enterprise name, loan ID, or asset UUID, complete with quick reset, result counter, and borrower organization indicators.
- **Feature**: **CSV Export in LedgerView & Securitization Data Mart** enabling downloads of processed financial records (supporting both filtered view and full dataset exports).
- **Feature**: **Historical Synthetic Asset Processing Volume Chart**: Recharts-powered dual-line time series tracking gross volume and Alpha Gate-compliant securitization pool growth over time with interactive batch/cumulative toggles and custom financial tooltips.
- **Feature**: **LedgerView Summary Stats Widget**: Real-time aggregated nominal volume, securitization-ready pools, settled DLT volume, and Basel CAR provisioning relief on the Dashboard.
- **Feature**: E-PSM Uniform Clearing Price auction simulator with time-priority tie-breaking.
- **UI**: Added prominent "DEMO SIMULATION • SYNTHETIC MOCK DATA" notice across sidebar and header bars.
- **Fix**: Resolved Vite SPA entry point script in `index.html`.
- **CI/CD**: Upgraded GitHub Actions workflow to CodeQL Action v3, added `security-events: write` permissions, and generated `package-lock.json`.

### `v9.0.0-alpha`
- Introduced Parameter Governance ("Living Law") and historical parameter change audit trails.
- Added Liquidity Pool health monitoring and simulated automatic liquidity injection under NBE Directive 5.4.
- Implemented Statutory Decision Brief logging with simulated cryptographic signatures.

### `v8.0.0`
- Introduced Moat 5 Oracle diagnostic panels with multi-node health tracking.
- Added SIPA System Integrity Diagnostic terminal stream.

### `v6.0.0`
- Built autonomous code audit simulation detecting protocol invariant violations.
- Implemented Bank-Treasury Liquidity Facility (BTLF) circuit breaker market halt mechanism.

### `v4.3.0`
- Initial implementation of the 5-Moat system architecture.
- Added synthetic loan generation and AI Alpha Gate uplift scoring engine.

---

## 11. Contributing & Open Source Governance

Contributions, issue reports, and architectural reviews are welcomed.

### Guidelines for Contributors
1. **Maintain Demo Boundary**: Do not commit proprietary credentials, live private keys, or non-public financial documents.
2. **Deterministic Code**: Algorithmic simulation logic must remain reproducible and deterministic.
3. **No Overclaiming**: Pull requests adding features must clearly distinguish between conceptual demonstrations and real institutional integrations.
4. **Code Quality**: All submissions must pass `npm run build` and `npx tsc --noEmit`.

---

© 2026 BERHANE OS Sovereign Architecture Contributors. Licensed under the Apache License 2.0.
