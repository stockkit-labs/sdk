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

export type HistoryInterval = "5m" | "15m" | "1h" | "4h" | "1d";

export type Candle = {
  /** Bucket start, ISO 8601. */
  t: string;
  open: number;
  high: number;
  low: number;
  close: number;
  ticks: number;
};

export type History = {
  symbol: string;
  interval: HistoryInterval;
  source: string;
  /** First recorded tick for the symbol; null until sampling has started. */
  historySince: string | null;
  candles: Candle[];
};

export type HistoryParams = {
  interval?: HistoryInterval;
  /** 1 to 300 candles, default 100. */
  limit?: number;
};

export type PoolStats = {
  pool: string;
  feeTier: number;
  price: string | null;
  usdgLiquidity: string;
  tokenLiquidity: string;
  tvlUsd: string;
};

export type Stats = {
  symbol: string;
  name: string;
  tokenAddress: string;
  chainId: number;
  supply: { totalTokens: string; valueUsd: string | null };
  price: {
    dexUsd: string | null;
    equityTokenUsd: string | null;
    underlyingMidUsd: string | null;
    multiplier: string;
    /** DEX price vs the multiplier-adjusted equity quote, percent. */
    dexPremiumPct: string | null;
    /** Null until a day of price history exists. */
    change24hPct: string | null;
  };
  pools: PoolStats[];
  asOf: string;
};

export type Alert = {
  id: string;
  symbol: string;
  condition: "above" | "below";
  price: number;
  webhookUrl: string;
  status: "active" | "fired" | "expired";
  createdAt: string;
  expiresAt: string;
  firedAt: string | null;
  firedPrice: number | null;
  webhookDeliveryStatus: number | null;
};

export type CreatedAlert = Alert & {
  /** Reads and deletes this alert. Returned once; store it. */
  secret: string;
  note: string;
};

export type CreateAlertParams = {
  ticker: string;
  condition: "above" | "below";
  /** USD per token. */
  price: number;
  /** Public https endpoint that receives the one-shot POST. */
  webhookUrl: string;
};

export type VoteEvent = {
  id: string;
  source: "corporate-actions";
  symbol: string;
  type: string;
  status: string;
  processDate: string | null;
  details: unknown;
};

export type Votes = {
  events: VoteEvent[];
  upstreamVotes: unknown;
  voting: { live: boolean; status: string };
  note: string;
  asOf: string;
};

export type VotingPosition = {
  symbol: string;
  name: string;
  address: string;
  tokenBalance: string;
  multiplier: string;
  /** tokenBalance x multiplier: the underlying shares the tokens represent. */
  shareEquivalent: string;
};

export type VotingPower = {
  address: string;
  chainId: number;
  positions: VotingPosition[];
  totalShareEquivalent: string;
  note: string;
  asOf: string;
};

export type Market = {
  token: string;
  symbol: string | null;
  name: string | null;
  pairToken: string;
  pairSymbol: string | null;
  pool: string;
  deployer: string;
  launchedAtBlock: number;
  graduated: boolean | null;
  venue: string;
};

export type Markets = {
  source: string;
  factory: string;
  chainId: number;
  launchesFound: number;
  scannedFromBlock: number;
  count: number;
  markets: Market[];
  asOf: string;
};

export type MarketsParams = {
  /** Only "pons" is supported right now. */
  venue?: "pons";
  /** 1 to 200, default 50. */
  limit?: number;
  offset?: number;
  /** Only tokens that graduated from the launch curve. */
  graduated?: boolean;
};

export type EarnOverview = {
  token: { symbol: string; address: string; chainId: number };
  thresholdTokens: string;
  payoutAsset: { symbol: string; address: string; chainId: number };
  schedule: {
    snapshotUtc: string;
    claimWindowUtc: string;
    nextSnapshotAt: string;
    nextClaimOpenAt: string;
  };
  accruing: { revenueUsd: string; calls: number };
  epoch: {
    id: number;
    poolUsd: string;
    revenueUsd: string;
    rolloverUsd: string;
    eligibleWallets: number;
    claimOpenAt: string;
    claimCloseAt: string;
    claimOpen: boolean;
    claimedWallets: number;
    claimedUsd: string;
  } | null;
};

export type EarnStatus = {
  address: string;
  balanceTokens: string;
  eligibleNow: boolean;
  epoch: {
    id: number;
    claimOpenAt: string;
    claimCloseAt: string;
    claimOpen: boolean;
    inSnapshot: boolean;
    claimableUsd: string;
    claimed: boolean;
    claimTx: string | null;
    /** Sign this with personal_sign and pass the signature to earn.claim. */
    message: string | null;
  } | null;
};

export type ClaimParams = {
  address: string;
  epoch: number;
  /** personal_sign signature over the status message for this epoch. */
  signature: string;
};

export type ClaimResult = {
  ok: true;
  epochId: number;
  amountUsd: string;
  tx: string;
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
    const headers: Record<string, string> = {
      accept: "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    };
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

  history = {
    /** OHLC candles from the on-chain TOKEN/USDG pool price, sampled every 5 minutes. */
    get: (symbol: string, params: HistoryParams = {}) => {
      const search = new URLSearchParams();
      if (params.interval) search.set("interval", params.interval);
      if (params.limit !== undefined) search.set("limit", String(params.limit));
      const qs = search.toString() ? `?${search}` : "";
      return this.request<History>(`/v1/history/${encodeURIComponent(symbol)}${qs}`);
    },
  };

  stats = {
    /** Supply, pools with TVL, DEX premium vs the equity quote, and 24h change. */
    get: (symbol: string) => this.request<Stats>(`/v1/stats/${encodeURIComponent(symbol)}`),
  };

  alerts = {
    /**
     * One-shot price alert delivered to your webhook. The response carries a
     * secret that reads and deletes the alert; it is only returned here.
     */
    create: (params: CreateAlertParams) =>
      this.request<CreatedAlert>("/v1/alerts", {
        method: "POST",
        body: JSON.stringify({
          symbol: params.ticker,
          condition: params.condition,
          price: params.price,
          webhookUrl: params.webhookUrl,
        }),
      }),
    get: (id: string, secret: string) =>
      this.request<Alert>(`/v1/alerts/${encodeURIComponent(id)}`, {
        headers: { "x-alert-secret": secret },
      }),
    delete: (id: string, secret: string) =>
      this.request<{ id: string; deleted: true }>(`/v1/alerts/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-alert-secret": secret },
      }),
  };

  votes = {
    list: () => this.request<Votes>("/v1/votes"),
    /** Vote weight for a wallet: token balance x multiplier per stock token. */
    power: (address: string, symbol?: string) => {
      const qs = symbol ? `?${new URLSearchParams({ symbol })}` : "";
      return this.request<VotingPower>(`/v1/votes/power/${encodeURIComponent(address)}${qs}`);
    },
  };

  markets = {
    /** Token launches on Pons v2, newest first. */
    list: (params: MarketsParams = {}) => {
      const search = new URLSearchParams();
      if (params.venue) search.set("venue", params.venue);
      if (params.limit !== undefined) search.set("limit", String(params.limit));
      if (params.offset !== undefined) search.set("offset", String(params.offset));
      if (params.graduated) search.set("graduated", "true");
      const qs = search.toString() ? `?${search}` : "";
      return this.request<Markets>(`/v1/markets${qs}`);
    },
  };

  earn = {
    overview: () => this.request<EarnOverview>("/v1/earn"),
    status: (address: string) =>
      this.request<EarnStatus>(`/v1/earn/status/${encodeURIComponent(address)}`),
    /**
     * Claims the epoch reward. Sign `status.epoch.message` with the holder's
     * wallet (personal_sign) and pass the signature; the SDK never signs.
     */
    claim: (params: ClaimParams) =>
      this.request<ClaimResult>("/v1/earn/claim", {
        method: "POST",
        body: JSON.stringify(params),
      }),
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
