# @stockkit/sdk

TypeScript client for the [StockKit API](https://api.stockkit.dev): tokenized stocks on [Robinhood Chain](https://robinhoodchain.blockscout.com).

StockKit gives developers one layer for discovering tokenized assets, reading live prices, valuing portfolios, getting executable DEX quotes, and building trades. It is non-custodial: the API returns unsigned transactions, and you sign with your own wallet. StockKit never holds keys and never executes trades.

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
| `portfolio.get(address)` | `GET /v1/portfolio/:address` |
| `corporateActions.list()` | `GET /v1/corporate-actions` |
| `trade.quote(params)` | `GET /v1/quote` |
| `trade.build(params)` | `POST /v1/trade/build` |

All responses are fully typed. Errors throw `StockKitError` with `status` and `code`.

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
