// StockKit SDK: thin typed client for api.stockkit.dev.
// Read data, get DEX quotes, and build unsigned transactions for tokenized
// stocks on Robinhood Chain. StockKit never holds keys or executes trades.

export type Asset = {
  symbol: string;
  name: string;
  address: string;
  chainId: number;
  decimals: number;
  multiplier: string;
  pendingMultiplier: string | null;
  status: string;
  logoUrl: string;
  tradingCapabilities: unknown;
  isin: string;
};

export type Price = {
  symbol: string;
  currency: string;
  underlying: { bid: string; ask: string; mid: string };
  token: { bid: string; ask: string; mid: string; multiplier: string };
  dailyHigh: string;
  dailyLow: string;
  dailyTradingVolume: string;
  halted: boolean;
  asOf: string;
};

export type Position = {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
  usdPrice: string | null;
  usdValue: string | null;
};

export type Portfolio = {
  address: string;
  chainId: number;
  positions: Position[];
  totalUsdValue: string;
  asOf: string;
};

export type Quote = {
  symbol: string;
  tokenAddress: string;
  side: "buy" | "sell";
  mode: "exactIn" | "exactOut";
  feeTier: number;
  usdAmount: string;
  tokenAmount: string;
  effectivePricePerToken: string | null;
  gasEstimate: string;
  venue: string;
  pair: string;
  asOf: string;
};

export type ResearchFact = {
  value: number;
  unit: string;
  periodStart: string | null;
  periodEnd: string;
  fiscalYear: number | null;
  form: string | null;
};

export type Research = {
  symbol: string;
  underlying: {
    ticker: string;
    companyName: string;
    cik: string;
    exchange: string | null;
    industry: string | null;
    sic: string | null;
    stateOfIncorporation: string | null;
    fiscalYearEnd: string | null;
    isin: string;
  } | null;
  facts: {
    revenue: ResearchFact | null;
    netIncome: ResearchFact | null;
    sharesOutstanding: { value: number; unit: string; asOf: string } | null;
    marketCap: { value: number; unit: string; basis: string } | null;
  };
  token: Asset & {
    price: {
      underlyingMid: string;
      tokenMid: string;
      currency: string;
      asOf: string;
    } | null;
  };
  sources: string[];
  note: string | null;
};

export type TransactionStep = {
  description: string;
  to: string;
  data: string;
  value: string;
};

export type BuiltTrade = {
  symbol: string;
  tokenAddress: string;
  chainId: number;
  quote: Omit<Quote, "symbol" | "tokenAddress" | "asOf">;
  slippageBps: number;
  deadline: number;
  steps: TransactionStep[];
  note: string;
};

export type QuoteParams = {
  ticker: string;
  side?: "buy" | "sell";
  amount: number | string;
  denom?: "usd" | "token";
};

export type BuildParams = QuoteParams & {
  recipient: string;
  slippageBps?: number;
};

export class StockKitError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = "StockKitError";
  }
}

export type StockKitOptions = {
  baseUrl?: string;
  /** Reserved for future authenticated endpoints. */
  apiKey?: string;
  fetch?: typeof fetch;
};

export class StockKit {
  private baseUrl: string;
  private fetchFn: typeof fetch;
  private apiKey?: string;

  constructor(options: StockKitOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://api.stockkit.dev").replace(/\/$/, "");
    this.fetchFn = options.fetch ?? fetch;
    this.apiKey = options.apiKey;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = { accept: "application/json" };
    if (init?.body) headers["content-type"] = "application/json";
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;
    const res = await this.fetchFn(`${this.baseUrl}${path}`, { ...init, headers });
    const body = (await res.json()) as any;
    if (!res.ok) {
      throw new StockKitError(
        body?.error?.message ?? `Request failed with ${res.status}`,
        res.status,
        body?.error?.code ?? "unknown"
      );
    }
    return body as T;
  }

  assets = {
    list: () => this.request<{ assets: Asset[]; count: number }>("/v1/assets"),
    get: (symbol: string) => this.request<Asset>(`/v1/assets/${encodeURIComponent(symbol)}`),
  };

  prices = {
    get: (symbol: string) => this.request<Price>(`/v1/prices/${encodeURIComponent(symbol)}`),
  };

  research = {
    get: (symbol: string) => this.request<Research>(`/v1/research/${encodeURIComponent(symbol)}`),
  };

  portfolio = {
    get: (address: string) =>
      this.request<Portfolio>(`/v1/portfolio/${encodeURIComponent(address)}`),
  };

  corporateActions = {
    list: () => this.request<{ corpActions: unknown[] }>("/v1/corporate-actions"),
  };

  trade = {
    quote: (params: QuoteParams) => {
      const search = new URLSearchParams({
        symbol: params.ticker,
        side: params.side ?? "buy",
        amount: String(params.amount),
        denom: params.denom ?? "usd",
      });
      return this.request<Quote>(`/v1/quote?${search}`);
    },
    /**
     * Builds unsigned transactions for the swap. Sign and submit them with
     * your own wallet (viem, ethers, etc.); StockKit never touches keys.
     */
    build: (params: BuildParams) =>
      this.request<BuiltTrade>("/v1/trade/build", {
        method: "POST",
        body: JSON.stringify({
          symbol: params.ticker,
          side: params.side ?? "buy",
          amount: String(params.amount),
          denom: params.denom ?? "usd",
          recipient: params.recipient,
          slippageBps: params.slippageBps,
        }),
      }),
  };
}

export default StockKit;
