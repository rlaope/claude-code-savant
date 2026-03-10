# Business Domain Agents

SayNo is the gateway to specialized business domain agents. Each agent has deep domain knowledge including Korean market specifics.

## Gateway

### SayNo - Business Strategy & Monetization

- **Command**: `/savant-biz`
- **Style**: Data-driven, numbers-first analysis
- **Strength**: Revenue modeling, P&L projections, market sizing
- **Output**: Financial tables, unit economics, break-even analysis
- SayNo is always active as the general business strategist and entry point

## Domain Agents

| Agent | Command | Domain | Specialization |
|-------|---------|--------|---------------|
| **Finance PM** | `/savant-biz-finance` | Investment & Finance | Fundraising, valuation, cap tables, financial modeling |
| **Growth PM** | `/savant-biz-growth` | Marketing & Growth | User acquisition, retention, funnels, A/B testing |
| **Legal Advisor** | `/savant-biz-legal` | Business Law | Entity formation, contracts, IP, regulatory compliance |
| **Fashion PM** | `/savant-biz-fashion` | Fashion & Retail | Brand positioning, seasonal planning, margin structures |
| **Logistics Manager** | `/savant-biz-logistics` | Supply Chain & Ops | Fulfillment, inventory, delivery, cost optimization |
| **F&B PM** | `/savant-biz-fnb` | Food & Beverage | Food costs, kitchen ops, delivery platforms, menu engineering |
| **SaaS PM** | `/savant-biz-saas` | Software Business | MRR, churn, pricing tiers, PLG strategy, ARR growth |
| **E-commerce PM** | `/savant-biz-ecommerce` | Online Retail & Marketplace | GMV, seller economics, fulfillment, platform strategy |
| **Real Estate PM** | `/savant-biz-realestate` | Property & PropTech | Cap rates, rental yield, development feasibility, proptech |
| **Healthcare PM** | `/savant-biz-healthcare` | HealthTech & Medical | Reimbursement models, clinical workflows, regulatory (FDA/MFDS) |
| **Content PM** | `/savant-biz-content` | Media & Creator Economy | Creator monetization, content funnels, IP licensing |
| **HR PM** | `/savant-biz-hr` | People Operations & HRTech | Compensation modeling, org design, recruitment ROI |
| **Education PM** | `/savant-biz-education` | EdTech & Learning | Course economics, institutional sales, learning analytics |
| **Travel PM** | `/savant-biz-travel` | Tourism & Hospitality | OTA economics, yield management, seasonal revenue |

## How It Works

### In Claude Code

Use slash commands to access any business agent directly:

```bash
# General business strategy (SayNo gateway)
/savant-biz How should I monetize my app?

# Specific domain agent
/savant-biz-finance What valuation method should I use for Series A?
/savant-biz-saas How do I reduce churn for my B2B SaaS?
/savant-biz-fnb What's the ideal food cost ratio for a delivery-only kitchen?
```

### In Savant Chat (Web UI)

1. **SayNo is always on** — the general business strategist and gateway
2. **Toggle domain agents** on/off in the Savant Chat sidebar → "Manage" button
3. **Biz Team Chat** — activated business agents discuss your question together
4. Each agent provides analysis with Korean market context (한국 시장)
5. **Dynamic Benchmarks** — when specific numbers are needed, agents search the web for the latest data with source citations

### Activation

In the Web UI, click **"Manage"** in the Biz Agents sidebar section to open the activation panel. Toggle agents on/off — only activated agents appear in the sidebar and participate in Biz Team Chat.

## Examples

```bash
# Startup fundraising strategy
/savant-biz-finance I'm raising a seed round for my AI startup. Revenue is $10K MRR.

# Growth hacking
/savant-biz-growth How do I get my first 1000 users for a developer tool?

# Legal setup
/savant-biz-legal Should I incorporate as LLC or C-Corp for a SaaS with Korean co-founders?

# Fashion brand launch
/savant-biz-fashion I want to launch a streetwear brand targeting Gen Z in Korea.

# E-commerce marketplace
/savant-biz-ecommerce How do I structure seller commissions for a vertical marketplace?

# Healthcare compliance
/savant-biz-healthcare What regulatory path should I take for a wellness app with health claims?

# Content creator platform
/savant-biz-content How should I structure revenue sharing for a creator platform?

# Real estate investment
/savant-biz-realestate Is this rental property worth investing in? Cap rate is 5.2%.

# HR & hiring
/savant-biz-hr How should I structure compensation for a 20-person startup?

# EdTech pricing
/savant-biz-education What's the right pricing model for an online coding bootcamp?

# Travel platform
/savant-biz-travel How do I optimize RevPAR for a boutique hotel chain?

# Restaurant operations
/savant-biz-fnb What delivery platform mix maximizes margin for a cloud kitchen?

# Supply chain
/savant-biz-logistics How do I reduce last-mile delivery costs in Seoul?

# SaaS metrics
/savant-biz-saas My monthly churn is 8%. How do I get it under 3%?
```
