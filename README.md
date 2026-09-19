![StockKit SDK](https://raw.githubusercontent.com/stockkit-labs/sdk/main/.github/banner.png)

# @stockkit/sdk

TypeScript client for the [StockKit API](https://api.stockkit.dev): tokenized stocks on [Robinhood Chain](https://robinhoodchain.blockscout.com).

StockKit gives developers one layer for discovering tokenized assets, reading live prices and price history, valuing portfolios, getting executable DEX quotes, building trades, and setting webhook price alerts. It is non-custodial: the API returns unsigned transactions, and you sign with your own wallet. StockKit never holds keys and never executes trades.

Docs: https://docs.stockkit.dev

## Install

```bash
npm install @stockkit/sdk
```

## Usage

```ts
import { StockKit } from "@stockkit/sdk"

const stockkit = new StockKit()

// All tokenized assets on Robinhood Chain, with onchain addresses
const { assets } = await stockkit.assets.list()

// Live price (raw underlying and multiplier-adjusted per-token values)
const price = await stockkit.prices.get("NVDA")

// Any wallet's tokenized-stock positions, valued in USD
const portfolio = await stockkit.portfolio.get("0xYourWalletAddress")

// Executable quote from Uniswap v3 pools on Robinhood Chain
const quote = await stockkit.trade.quote({ ticker: "NVDA", amount: 100 })

// Unsigned approve + swap transactions; sign with your own wallet
const tx = await stockkit.trade.build({
  ticker: "NVDA",
  amount: 100,
  recipient: "0xYourWalletAddress",
  slippageBps: 50,
})

// OHLC candles from the onchain pool price (5m, 15m, 1h, 4h, 1d)
const { candles } = await stockkit.history.get("NVDA", { interval: "1h", limit: 24 })

// Supply, pool TVL, DEX premium vs the equity quote, 24h change
const stats = await stockkit.stats.get("NVDA")

// One-shot price alert delivered to your webhook
const alert = await stockkit.alerts.create({
  ticker: "NVDA",
  condition: "above",
  price: 250,
  webhookUrl: "https://example.com/hooks/stockkit",
})
```

Signing and submitting the built steps is up to you, for example with viem:

```ts
for (const step of tx.steps) {
  await walletClient.sendTransaction({
    to: step.to as `0x${string}`,
    data: step.data as `0x${string}`,
    value: BigInt(step.value),
  })
}
```

## API surface

| Method | Endpoint |
| --- | --- |
| `assets.list()` | `GET /v1/assets` |
| `assets.get(symbol)` | `GET /v1/assets/:symbol` |
| `prices.get(symbol)` | `GET /v1/prices/:symbol` |
| `research.get(symbol)` | `GET /v1/research/:symbol` |
| `portfolio.get(address)` | `GET /v1/portfolio/:address` |
| `corporateActions.list()` | `GET /v1/corporate-actions` |
| `trade.quote(params)` | `GET /v1/quote` |
| `trade.build(params)` | `POST /v1/trade/build` |
| `history.get(symbol, { interval, limit })` | `GET /v1/history/:symbol` |
| `stats.get(symbol)` | `GET /v1/stats/:symbol` |
| `alerts.create(params)` | `POST /v1/alerts` |
| `alerts.get(id, secret)` | `GET /v1/alerts/:id` |
| `alerts.delete(id, secret)` | `DELETE /v1/alerts/:id` |
| `votes.list()` | `GET /v1/votes` |
| `votes.power(address, symbol?)` | `GET /v1/votes/power/:address` |
| `markets.list({ limit, offset, graduated })` | `GET /v1/markets` |
| `earn.overview()` | `GET /v1/earn` |
| `earn.status(address)` | `GET /v1/earn/status/:address` |
| `earn.claim({ address, epoch, signature })` | `POST /v1/earn/claim` |

All responses are fully typed. Errors throw `StockKitError` with `status` and `code`.

## Alerts

`alerts.create` returns a `secret` exactly once. Store it: it is the only way
to read or delete the alert. Alerts are evaluated every 5 minutes against the
onchain DEX price, fire once, and expire after 30 days.

```ts
const status = await stockkit.alerts.get(alert.id, alert.secret)
await stockkit.alerts.delete(alert.id, alert.secret)
```

## Earn

`earn.claim` needs a `personal_sign` signature over the message returned by
`earn.status`. The SDK never signs; use your own wallet:

```ts
const status = await stockkit.earn.status(account.address)

if (status.epoch?.claimOpen && status.epoch.message) {
  const signature = await walletClient.signMessage({ message: status.epoch.message })
  await stockkit.earn.claim({ address: account.address, epoch: status.epoch.id, signature })
}
```

## Options

```ts
new StockKit({
  baseUrl: "https://api.stockkit.dev", // default
  fetch: customFetch,                  // optional fetch implementation
})
```

The API is open during the beta; no API key is required.

## Disclaimer

StockKit provides software infrastructure only. Nothing in this package is investment advice, and tokenized assets carry risk. Review every transaction before signing.

## License

MIT
