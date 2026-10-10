<div align="center">
  <img width="1200" height="475" alt="BERHANE OS Sovereign Studio Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>BERHANE OS Sovereign Studio</h1>
  <p><strong>Anti-Fragile Financial Market Infrastructure (FMI) Proof-of-Concept & Securitization Architecture</strong></p>
  <p>
    <code>Version: V9.1.0-beta</code> &nbsp;|&nbsp; 
    <code>Status: Prototype / Demonstration Only</code> &nbsp;|&nbsp; 
    <code>Runtime: Node.js 22 + React 19 + Vite 6 + Express</code>
  </p>
</div>

---

> ⚠️ **PUBLIC REPOSITORY NOTICE & CRITICAL DISCLAIMER**
> 
> **This project is a Proof-of-Concept (PoC) and simulation prototype.** It is designed for conceptual architecture demonstration, algorithmic simulation, academic modeling, and user interface workflows. 
> 
> **It is NOT production-ready financial software.** It does **not** connect to live banking networks, real central bank systems (e.g., National Bank of Ethiopia), live blockchains, or actual central securities depositories (CSDs). All cryptographic hashes, oracle feeds, settlement proofs, credit scores, and auction clearances are generated synthetically in-memory. **Do not use this software for managing live assets, executing real financial contracts, or making regulatory commitments.**

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture (The 5 Moats)](#-system-architecture-the-5-moats)
- [Feature Breakdown](#-feature-breakdown)
- [Gemini Copilot Architecture](#-gemini-copilot-architecture)
- [Current Production Gaps & Limitations](#-current-production-gaps--limitations)
- [Production Readiness Roadmap](#-production-readiness-roadmap)
- [Version History & Changelog](#-version-history--changelog)
- [Sprint History & Development Milestones](#-sprint-history--development-milestones)
- [Local Development & Setup](#-local-development--setup)
- [CI/CD & Quality Gates](#-cicd--quality-gates)
- [License & Open Source Notice](#-license--open-source-notice)

---

## 🏛️ Executive Summary

**BERHANE OS Sovereign Studio** models a sovereign financial architecture aimed at solving liquidity crunches and risk mispricing in emerging markets. 

In traditional emerging-market credit ecosystems, micro, small, and medium enterprise (MSME) loans suffer from high provisioning costs, lack of secondary-market liquidity, and currency volatility. BERHANE OS demonstrates an anti-fragile financial mechanism:
1. **Raw Loan Book Ingestion:** Ingests unstandardized loan portfolios.
2. **AI Alpha Gate Transformation:** Elevates traditional credit ratings through immutable risk-mitigation covenants to meet target **Credit Rating (CR-Score $\ge$ 9.0)**.
3. **Regulatory Intelligence (Smart Learner):** Ingests and cross-references regulatory mandates (e.g., NBE Directives, SFDR Article 9 ESG criteria).
4. **Causal Mapping Engine (CME):** Runs Monte Carlo counterfactual shock simulations against macroeconomic and regulatory events.
5. **Electronic Primary Settlement Mechanism (E-PSM):** Demonstrates a deterministic Uniform Clearing Price (UCP) auction model with simulated settlement finality.
6. **Governance & Living Law:** Simulates programmatic parameter adaptation, autonomous code invariant auditing, and statutory legal brief generation.

---

## 🔬 System Architecture (The 5 Moats)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BERHANE OS CORE RUNTIME                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│  MOAT 1: POLICY   │  MOAT 2: DATA     │  MOAT 3: TRANSFORMATION        │
│  Regulatory Index │  Warehouse & Mart │  AI Alpha Gate Logic           │
│  - NBE Directives │  - Raw Loan Book  │  - IMM Uplift Model            │
│  - SFDR Art. 9    │  - Asset Ledger   │  - CR-Score $\ge$ 9.0 Gate     │
├───────────────────┼───────────────────┼────────────────────────────────┤
│  MOAT 4: CAUSAL   │  MOAT 5: ORACLE   │  E-PSM AUCTION ENGINE          │
│  Monte Carlo CME  │  Market Intel     │  Deterministic Clearing        │
│  - Shock Analysis │  - ETB/USD Feeds  │  - Uniform Price Discovery     │
│  - Policy Shocks  │  - Volatility Idx │  - Hash-Chained Finality       │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

- **Phase I (Ingestion & Knowledge):** Normalizes financial CSV structures and performs simulated Named Entity Recognition (NER) on regulatory PDFs.
- **Phase II (Causal Engine):** Models macro-shocks (capital reserve ratio increases, currency devaluations) to forecast distribution curves over 10,000 iterations.
- **Phase III (AI Alpha Gate):** Evaluates traditional credit scores (3.0–8.0) and applies quantifiable uplift to classify assets as Securitization-Ready.
- **Phase IV (Asset Ledger & Data Mart):** Maintains partitioned data warehouse representations (`securitization_asset_ledger` and `securitization_ready_pool`).
- **Phase V (Governance & Living Law):** Implements dynamic risk boundaries, circuit breaker market halts, and statutory audit trails.

---

## 💻 Feature Breakdown

| Component | File | Current Implementation (Demo Scope) |
| :--- | :--- | :--- |
| **Studio Overview** | `components/Dashboard.tsx` | Visualizes compliance rates, CR-Score distributions via Recharts, and simulated real-time ETB/USD ticker data. |
| **System Blueprint** | `components/SystemBlueprint.tsx` | Visualizes architecture, pitch deck narrative, and E-PSM auction simulation. |
| **Ingestion Pipeline** | `components/IngestionSimulator.tsx` | Simulated CSV batch upload and mock PDF chunking/redaction viewer. |
| **Causal Engine (CME)** | `components/CausalEngine.tsx` | Interactive "what-if" policy shock runner with area charts displaying Gaussian probability densities. |
| **AI Alpha Gate** | `components/AlphaGateLogic.tsx` | Step-by-step loan processing animation, failure breakdown, and simulated issuer remediation commitments. |
| **Asset Ledger & Mart** | `components/LedgerView.tsx` | Searchable data table with settlement status filters (`SETTLED`, `PENDING`, `LIQUIDITY_CRUNCH`). |
| **Governance & Ops** | `components/GovernanceConsole.tsx` | SIPA integrity audit runner, "Living Law" parameter registry, and statutory decision briefs. |
| **Gemini Copilot** | `components/GeminiChatbot.tsx` | Multi-turn conversational interface with role-based personas and warehouse context injection. |

---

## 🤖 Gemini Copilot Architecture

The studio integrates Google's modern `@google/genai` TypeScript SDK using a server-side proxy pattern:

```
[Browser Client] ──POST /api/chat──> [Express Server (server.ts)] ──Google GenAI SDK──> [Gemini API]
                                      • User-Agent: aistudio-build
                                      • process.env.GEMINI_API_KEY
```

### Pre-Configured Personas & Models:
1. **Sovereign Risk Officer** (`gemini-3.5-flash`):
   - Scope: General financial assessment, CR-Score calculations, provisioning reductions, and balance sheet resilience.
2. **Causal & Quants Strategist** (`gemini-3.1-pro-preview`):
   - Scope: Complex reasoning, counterfactual macroeconomic modeling, auction game theory, and algorithmic settlement analysis.
3. **Regulatory Fast-Checker** (`gemini-3.1-flash-lite`):
   - Scope: Ultra-low latency verification of regulatory directives (NBE Directive 5.4), smart contract invariants, and statutory legal brief criteria.

---

## 🔍 Current Production Gaps & Limitations

Because this repository is public, transparency regarding its prototype nature is paramount. The following areas represent architectural gaps between the current demonstration and a production-grade system:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROTOTYPE DEFICIENCIES                          │
├────────────────────────────────┬───────────────────────────────────────┤
│ Data Persistence               │ In-memory Maps & arrays (resets on    │
│                                │ server restart; no relational DB).    │
├────────────────────────────────┼───────────────────────────────────────┤
│ Cryptographic Settlement       │ Mock string generation (`0x...`).     │
│                                │ No real EVM/DLT node or PKI keystore. │
├────────────────────────────────┼───────────────────────────────────────┤
│ Market Intelligence (Oracles)  │ Math.random() rate generator.         │
│                                │ No Chainlink, Pyth, or signed feeds.  │
├────────────────────────────────┼───────────────────────────────────────┤
│ Authentication & RBAC          │ None. Client has unauthenticated      │
│                                │ administrative access to all panels.  │
├────────────────────────────────┼───────────────────────────────────────┤
│ Document Extraction            │ Static mock regex/NER outputs.        │
│                                │ No real OCR, embeddings, or vector DB.│
├────────────────────────────────┼───────────────────────────────────────┤
│ Smart Contracts                │ Simulated TypeScript state machine.   │
│                                │ Contracts are not compiled or audited.│
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 🚀 Production Readiness Roadmap

To transition this proof-of-concept into an institutional financial market system:

### 1. Persistence & Data Infrastructure
- Replace in-memory stores (`dataService.ts`) with a secure relational database (e.g., **Cloud SQL PostgreSQL** or **CockroachDB**) using an ORM like Drizzle or Prisma.
- Implement immutable write-once ledger tables with cryptographic Merkle verification for loan history.
- Integrate a vector database (e.g., pgvector, Vertex Search, or Pinecone) for actual semantic ingestion and retrieval-augmented generation (RAG) of regulatory directives.

### 2. Cryptographic Security & Settlement
- Integrate a real distributed ledger testnet (e.g., Ethereum Layer 2, Hyperledger Besu, or Polygon CDK).
- Replace pseudo-random hashes with ECDSA-signed transactions executed via institutional custody or Hardware Security Modules (HSMs) with AWS KMS / GCP Cloud KMS.
- Deploy and formally verify smart contracts using Certora, Slither, and Foundry.

### 3. Identity, Access & Role-Based Control (RBAC)
- Implement OpenID Connect (OIDC) or OAuth 2.0 with multi-factor authentication (MFA).
- Establish strict role separation:
  - `CENTRAL_BANK_AUDITOR`: Read-only access to statutory briefs and governance history.
  - `ORIGINATOR`: Submits raw loan batches.
  - `SECURITIZATION_OPERATOR`: Triggers Alpha Gate runs and E-PSM auctions.
  - `GOVERNANCE_COUNCIL`: Multi-sig authority to alter "Living Law" parameters.

### 4. Real-World Oracle & Bank Core Connectivity
- Connect live ISO 20022 messaging pipelines or core banking APIs (e.g., EthSwitch, CBS).
- Integrate decentralized oracles with cryptographic cryptographic attestation (e.g., TLSNotary or Chainlink DECO) for FX rates and inflation indicators.

### 5. Automated Testing & Verification
- Unit test coverage for the deterministic auction clearing math (`finalizeAuction`).
- End-to-end integration test suite verifying API contracts and fault-tolerance under network partitions.

---

## 📦 Version History & Changelog

### `v9.1.0-beta` (Current Release)
- **Feature:** Full integration of multi-turn **Gemini Sovereign Copilot** with 3 distinct models (`gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`).
- **Feature:** E-PSM Auction Engine simulation with deterministic Uniform Clearing Price (UCP) calculation.
- **Fix:** Added missing `<script type="module" src="/index.tsx">` entry point in Vite `index.html`.
- **Fix:** Resolved GitHub Actions CI/CD pipeline issues: generated `package-lock.json`, upgraded CodeQL Action to `v3`, granted `security-events: write` permissions, and enabled Node 24 actions opt-in.
- **Infra:** Configured full-stack Express server (`server.ts`) mounting Vite middleware on port 3000.

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

## 🏃 Sprint History & Development Milestones

```
Sprint 1 (Foundations)      ──► Data model design, TypeScript schema definitions, mock raw loan book.
Sprint 2 (Alpha Gate)       ──► Transformation logic, IMM uplift simulation, CR-Score thresholding.
Sprint 3 (Causal Engine)    ──► Monte Carlo simulation engine, policy shock query parsing, Recharts integration.
Sprint 4 (Governance & Ops) ──► BTLF circuit breaker, living law parameter updates, decision briefs.
Sprint 5 (E-PSM Auctions)   ──► Auction state machine, uniform price clearing, deterministic settlement hashes.
Sprint 6 (AI Copilot & CI)  ──► Server-side Gemini SDK integration, CI/CD pipeline repair, public repo hardening.
```

---

## 🛠️ Local Development & Setup

### Prerequisites
- **Node.js**: Version 20 or higher (Node.js 22 recommended)
- **npm**: Version 10 or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### 🔑 How Testers Can Input Their Own Gemini API Key

Testers and open-source contributors can supply their own Gemini API key using one of the methods below, depending on how they run the application:

#### Method 1: Local Development (Cloned from GitHub)
1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Copy the template environment file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and paste your key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
   The server (`server.ts`) will automatically load `process.env.GEMINI_API_KEY` to authenticate requests.

#### Method 2: Testing Inside Google AI Studio
If testing or running the app inside the Google AI Studio platform:
1. Open the app in AI Studio.
2. In the left navigation bar, click **Settings** (or the key icon) $\rightarrow$ **Secrets**.
3. Add a secret named `GEMINI_API_KEY` with your key value.
4. AI Studio automatically injects this secret into the server environment at runtime.

#### Method 3: Testing via Docker / Container Environments
Pass the key as an environment variable when launching the container:
```bash
docker run -p 3000:3000 -e GEMINI_API_KEY="AIzaSyYourActualKeyHere" your-image-name
```

---

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abeselomchernet/FMI-Proof-BERHANE-OS-Sovereign-Studio-V9.1.0.git
   cd FMI-Proof-BERHANE-OS-Sovereign-Studio-V9.1.0
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root (see `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Run production build:**
   ```bash
   npm run build
   ```

6. **Validate TypeScript types:**
   ```bash
   npx tsc --noEmit
   ```

---

## 🛡️ CI/CD & Quality Gates

The repository is equipped with an automated GitHub Actions pipeline located at `.github/workflows/ci-cd.yml`:

- **Job 1: Build & Type Check:** Runs `npm ci`, verifies TypeScript types (`tsc --noEmit`), and builds production assets with Vite.
- **Job 2: Financial Anti-Fragility Validation:** Simulates validation checkpoints across warehouse layers and Alpha Gate components.
- **Job 3: Security Scan:** Executes `npm audit` and static security scanning via Trivy with CodeQL v3 SARIF upload.
- **Job 4: Automated Deploy Step:** Conditional deployment hook triggered on `main` branch pushes.

---

## 📄 License & Open Source Notice

This project is licensed under the Apache License 2.0 (or MIT License as specified in repo root). 

Please review the [Critical Disclaimer](#-public-repository-notice--critical-disclaimer) before utilizing or referencing any architectural models, mathematical formulas, or simulation logic found in this codebase.
