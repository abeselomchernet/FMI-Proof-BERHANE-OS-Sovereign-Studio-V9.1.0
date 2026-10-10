import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Load local .env if present (Node 20+)
try {
  process.loadEnvFile();
} catch {}

// Function to generate high-fidelity domain response if Gemini API key is missing or invalid
function generateDomainFallbackResponse(userPrompt: string, roleSystemInstruction?: string): string {
  const p = userPrompt.toLowerCase();

  let coreAnswer = "";

  if (p.includes("platform") || p.includes("what is this") || p.includes("what does this") || p.includes("berhane")) {
    coreAnswer = `**BERHANE OS Sovereign Studio V9.1.0-beta** is an institutional-grade demonstration platform for **Anti-Fragile Financial Market Infrastructure (FMI)**. 

It is designed to solve systemic illiquidity in emerging credit markets by modeling:
1. **Raw Loan Book Ingestion (Phase I)**: Standardizing unbanked and MSME credit portfolios.
2. **Causal Mapping Engine (Phase II)**: Simulating macroeconomic policy shocks (NBE reserve ratios, FX devaluations) using Monte Carlo distributions.
3. **AI Alpha Gate (Phase III)**: Elevating traditional credit scores to an institutional **CR-Score $\\ge$ 9.0** via Immutable Mitigation Mechanisms (IMM).
4. **Securitization Asset Ledger (Phase IV)**: Maintaining auditable data warehouse partitions and securitization-ready asset pools.
5. **Electronic Primary Settlement Mechanism (E-PSM)**: Executing deterministic Uniform Clearing Price (UCP) auctions with hash-chained finality proofs.
6. **Living Law Governance (Phase V)**: Implementing automated circuit breakers (BTLF protocol), liquidity injections, and statutory audit briefs.`;
  } else if (p.includes("cr-score") || p.includes("alpha gate") || p.includes("score") || p.includes("uplift")) {
    coreAnswer = `The **AI Alpha Gate** is the core credit enhancement mechanism of BERHANE OS:

- **Baseline Traditional Score**: Conventional emerging-market credit scores typically range from **3.0 to 8.0**, which are insufficient for foreign institutional investors.
- **IMM Uplift**: The algorithm applies quantifiable **Immutable Mitigation Mechanism (IMM)** risk deductions (0.0 to +2.0 uplift) based on collateralization, cash-flow covenants, and regulatory compliance.
- **Eligibility Threshold**: Assets must achieve a **CR-Score $\\ge$ 9.0** to be deemed *Alpha-Compliant* and minted into the \`securitization_ready_pool\`.
- **Provisioning Reduction**: Compliant assets achieve an immediate **35% reduction in bank capital provisioning costs**, freeing sovereign balance sheet reserves.`;
  } else if (p.includes("auction") || p.includes("e-psm") || p.includes("clearing") || p.includes("ucp")) {
    coreAnswer = `The **Electronic Primary Settlement Mechanism (E-PSM)** uses a deterministic **Uniform Clearing Price (UCP)** auction:

1. **Order Book Aggregation**: Institutional bids are sorted in descending order of price; ties are strictly resolved using time priority (FIFO).
2. **UCP Determination**: The market price clears where cumulative investor demand intersects the fixed supply ($50,000 quota).
3. **Pro-Rata Allocation**: All accepted bidders at or above the clearing price receive allocations at the single uniform clearing price.
4. **Deterministic Settlement Hash**: A unique \`bytes32\` settlement intent hash is generated from \`Hash(AuctionID + UCP + AllocationCount + TotalVolume)\` for tamper-proof handoff to the Central Securities Depository (CSD).`;
  } else if (p.includes("directive") || p.includes("nbe") || p.includes("regulation") || p.includes("lcr") || p.includes("sfdr")) {
    coreAnswer = `**Regulatory Compliance & Statutory Framework:**

- **NBE Directive 5.4**: Mandates strict liquidity coverage ratio (LCR) buffers (minimum 115%) during periods of elevated market volatility.
- **BTLF Protocol**: Enforces automated liquidity lockups (30 to 45 days) for securitized Grade B tranches.
- **SFDR Article 9 Readiness**: Identifies assets with verified green, ESG, or MSME financial-inclusion impacts, enabling them to access European and international sustainability funds.
- **Living Law Governance**: Any regulatory conflict detected between NBE Directives and smart contract variables triggers automated statutory review and circuit breaker protection.`;
  } else if (p.includes("btlf") || p.includes("circuit breaker") || p.includes("halt") || p.includes("invariant")) {
    coreAnswer = `**Bank-Treasury Liquidity Facility (BTLF) Protocol & Safety Invariants:**

- **Autonomous Code Audit**: Continuously checks protocol solvency rules (e.g., \`Solvency Ratio < 110% under Stress Test T-5\`).
- **Circuit Breaker Halt**: If a critical invariant violation is detected, the protocol automatically flips \`MARKET_PAUSED = true\` to prevent catastrophic cascading bank runs.
- **Emergency Clearing**: The Governance Console allows designated authorities to deploy signed patches (e.g., V8.0.1 Patch) or execute emergency liquidity injections to restore equilibrium.`;
  } else {
    coreAnswer = `**BERHANE OS Sovereign Analysis**:

Based on your inquiry regarding *"${userPrompt}"*:
- In sovereign anti-fragility modeling, all asset parameters must align with **NBE Directives** and maintain a minimum **CR-Score of 9.0**.
- The **Causal Engine** forecasts risk distributions across 10,000 Monte Carlo runs to ensure foreign exchange reserves remain protected against sudden currency devaluations.
- You can test this live in the studio by navigating to **AI Alpha Gate (III)** to transform raw loans, or **Causal Engine (II)** to run policy shock simulations.`;
  }

  return `${coreAnswer}\n\n---\n*💡 **Free Mode Notice**: Running on BERHANE Sovereign Built-in Intelligence Engine. You can also generate a **100% Free Gemini API Key** (no credit card required) at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) to connect directly to live Gemini cloud models.*`;
}

// Gemini Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, systemInstruction, model, apiKey: bodyApiKey } = req.body;
  const headerApiKey = req.headers['x-gemini-api-key'] as string | undefined;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const targetModel = model || 'gemini-3.5-flash';

  // Check if we have a valid-looking API key (prefer user-supplied header/body key, then env key)
  const candidateKey = (headerApiKey || bodyApiKey || process.env.GEMINI_API_KEY || '').trim();
  const hasConfiguredKey = candidateKey.length > 10 && candidateKey.startsWith('AIzaSy');

  if (hasConfiguredKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: candidateKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are BERHANE OS Sovereign Copilot, an institutional AI financial advisor and anti-fragility intelligence engine for the BERHANE Operating System. You specialize in sovereign asset securitization, credit risk scoring (CR-Scores), causal mapping, NBE and international regulatory compliance (e.g., SFDR Article 9), and liquidity resilience protocols.',
        },
      });

      const reply = response.text ?? '';
      res.json({ reply, model: targetModel, isLiveGemini: true });
      return;
    } catch (apiError: any) {
      console.warn('[Gemini Live API call failed, falling back to sovereign domain engine]:', apiError?.message || apiError);
      // Fall through to domain fallback engine below
    }
  }

  // Graceful Free Mode Fallback:
  const fallbackReply = generateDomainFallbackResponse(latestUserMessage, systemInstruction);
  res.json({ 
    reply: fallbackReply, 
    model: `BERHANE Domain Engine (${targetModel})`, 
    isFreeFallback: true 
  });
});

// Vite middleware in dev or static dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BERHANE OS Sovereign Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
