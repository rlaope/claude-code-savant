import { Persona, AnalysisResult, TermEntry } from "./types.js";

/**
 * SayNo persona - analyzes code from a business/monetization perspective
 */
export class SayNoPersona implements Persona {
  name = "sayno";
  displayName = "The Strategist";

  analyze(instruction: string, code: string): AnalysisResult {
    const lines = code.split("\n").filter((line) => line.trim());
    const codeFeatures = this.analyzeCodeFeatures(code);

    const summary = this.generateSummary(instruction, {
      lineCount: lines.length,
      ...codeFeatures,
    });

    const mainContent = this.generateAnalysis(instruction, code, codeFeatures);
    const terminology = this.generateTerminology(codeFeatures);

    return {
      summary,
      mainContent,
      terminology,
    };
  }

  private analyzeCodeFeatures(code: string): {
    hasAPI: boolean;
    hasAuth: boolean;
    hasPayment: boolean;
    hasDatabase: boolean;
    hasSubscription: boolean;
    hasAnalytics: boolean;
    hasRateLimit: boolean;
    hasPricing: boolean;
  } {
    return {
      hasAPI: /api|endpoint|route|express|fastify|fetch|axios/i.test(code),
      hasAuth: /auth|login|signup|jwt|token|session|password|oauth/i.test(code),
      hasPayment: /payment|stripe|billing|invoice|charge|subscription|price/i.test(code),
      hasDatabase: /database|db|sql|mongo|prisma|sequelize|typeorm|model|schema/i.test(code),
      hasSubscription: /subscription|plan|tier|freemium|premium|upgrade/i.test(code),
      hasAnalytics: /analytics|tracking|metric|event|log|monitor/i.test(code),
      hasRateLimit: /rate.?limit|throttle|quota/i.test(code),
      hasPricing: /price|cost|fee|margin|revenue|profit/i.test(code),
    };
  }

  private generateSummary(
    instruction: string,
    features: {
      lineCount: number;
      hasAPI: boolean;
      hasAuth: boolean;
      hasPayment: boolean;
      hasDatabase: boolean;
      hasSubscription: boolean;
    }
  ): string {
    const businessSignals: string[] = [];

    if (features.hasPayment || features.hasSubscription) {
      businessSignals.push("monetization infrastructure");
    }
    if (features.hasAuth) businessSignals.push("user management");
    if (features.hasAPI) businessSignals.push("API endpoints");
    if (features.hasDatabase) businessSignals.push("data persistence");

    const signalText =
      businessSignals.length > 0
        ? `I see ${businessSignals.join(", ")} — let's evaluate the business viability.`
        : "Let me assess the revenue potential of this codebase.";

    return `Looking at ${features.lineCount} lines for "${instruction}". ${signalText} The math doesn't lie.`;
  }

  private generateAnalysis(
    instruction: string,
    code: string,
    features: {
      hasAPI: boolean;
      hasAuth: boolean;
      hasPayment: boolean;
      hasDatabase: boolean;
      hasSubscription: boolean;
      hasAnalytics: boolean;
      hasRateLimit: boolean;
      hasPricing: boolean;
    }
  ): string {
    const sections: string[] = [];

    sections.push(
      `## Business Assessment\n\nLet's look at the numbers. "${instruction}" — before we write another line of code, does this make business sense?`
    );

    // Revenue readiness
    const revenueSignals: string[] = [];
    const revenueMissing: string[] = [];

    if (features.hasPayment) revenueSignals.push("Payment processing");
    else revenueMissing.push("Payment processing — no way to collect money");

    if (features.hasSubscription) revenueSignals.push("Subscription/tier system");
    else revenueMissing.push("Subscription model — recurring revenue is king");

    if (features.hasAuth) revenueSignals.push("User authentication");
    else revenueMissing.push("User auth — can't monetize anonymous users");

    if (features.hasAnalytics) revenueSignals.push("Analytics/tracking");
    else revenueMissing.push("Analytics — you can't optimize what you don't measure");

    if (features.hasRateLimit) revenueSignals.push("Rate limiting");
    else revenueMissing.push("Rate limiting — free tier abuse protection");

    sections.push(
      `## Revenue Readiness Score\n\n**Present**: ${revenueSignals.length > 0 ? revenueSignals.join(", ") : "None"}\n\n**Missing**: ${revenueMissing.length > 0 ? revenueMissing.join("; ") : "All covered!"}`
    );

    // Monetization models
    sections.push(
      `## Monetization Model Options\n\n| Model | Fit | Effort | Monthly Revenue Potential |\n|-------|-----|--------|-------------------------|\n| Freemium | ${features.hasAuth ? "High" : "Medium"} | ${features.hasSubscription ? "Low (exists)" : "Medium"} | Depends on conversion rate |\n| Usage-based | ${features.hasAPI ? "High" : "Low"} | ${features.hasRateLimit ? "Low" : "High"} | Scales with usage |\n| Subscription | ${features.hasSubscription ? "Ready" : "Medium"} | ${features.hasPayment ? "Low" : "High"} | Predictable MRR |\n| Enterprise/Custom | ${features.hasAuth ? "Medium" : "Low"} | High | High per-deal |`
    );

    // Unit economics
    sections.push(
      `## Unit Economics Framework\n\nBefore scaling, validate these:\n\n- **CAC (Customer Acquisition Cost)**: How much to acquire one paying user?\n- **LTV (Lifetime Value)**: How much does one user pay over their lifetime?\n- **LTV:CAC Ratio**: Must be >3:1 to be viable\n- **Payback Period**: How quickly do you recover CAC?\n- **Gross Margin**: Revenue minus direct costs — target >60% for software\n\nThe math must work at unit level before scaling makes sense.`
    );

    // Recommendations
    if (features.hasPayment || features.hasSubscription) {
      sections.push(
        `## The Verdict\n\nYou have monetization infrastructure in place. Good. Now the question is: are you charging enough? Most founders underprice by 2-3x. Run a willingness-to-pay survey before your next pricing change.\n\n**Next step**: Instrument conversion funnel tracking. You need to know: visitor → signup → activation → payment → retention.`
      );
    } else {
      sections.push(
        `## The Verdict\n\nSay no to shipping more features. Say yes to shipping revenue. You have a product without a business model. That's a hobby, not a business.\n\n**Priority 1**: Add payment processing (Stripe takes 30 minutes)\n**Priority 2**: Define your pricing tiers\n**Priority 3**: Add usage tracking to validate demand\n\nRevenue is the ultimate feature. Build it first, optimize later.`
      );
    }

    return sections.join("\n\n");
  }

  private generateTerminology(features: {
    hasPayment: boolean;
    hasSubscription: boolean;
    hasAnalytics: boolean;
    hasAPI: boolean;
  }): TermEntry[] {
    const terms: TermEntry[] = [
      {
        term: "Unit Economics",
        definition:
          "The revenue and costs associated with a single customer — if this doesn't work, nothing else matters",
      },
      {
        term: "LTV:CAC Ratio",
        definition:
          "Lifetime Value divided by Customer Acquisition Cost — must be >3:1 for a viable business",
      },
    ];

    if (features.hasSubscription) {
      terms.push({
        term: "MRR (Monthly Recurring Revenue)",
        definition:
          "Predictable monthly revenue from subscriptions — the heartbeat of a SaaS business",
      });
      terms.push({
        term: "Churn Rate",
        definition:
          "Percentage of customers who cancel per period — the silent killer of subscription businesses",
      });
    }

    if (features.hasPayment) {
      terms.push({
        term: "Conversion Rate",
        definition:
          "Percentage of users who become paying customers — typically 2-5% for freemium models",
      });
    }

    if (features.hasAPI) {
      terms.push({
        term: "API Monetization",
        definition:
          "Charging for API access, typically per-call or per-tier — usage-based revenue at its finest",
      });
    }

    terms.push({
      term: "Break-Even Point",
      definition:
        "The moment revenue covers all costs — every business must reach this or die trying",
    });

    return terms;
  }
}
