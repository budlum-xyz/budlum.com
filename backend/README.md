# budlum-explorer-api

budlum.xyz websitenin (Next.js explorer/wallet dApp) **Rust backend'i**.

Frontend'in mock veri katmanı (`src/features/explorer/queries/index.ts` +
`fixtures.ts`) hazır bir değişim noktasıdır; bu backend, `types/index.ts`
sözleşmesine birebir uyan bir JSON API sağlar. Frontend `queries/index.ts`
`fetch()` çağrılarına çevrildiğinde uçtan uca çalışır.

## Mimari (seeded şimdi → indexer'a hazırlık)

```
HTTP (axum)            veri kaynağı soyutlaması
routes/* ───────────►  trait ExplorerRepository  ──►  SeededRepository  (şimdi: Figma tohum veri)
                      (veri kaynağını gizler)         IndexerRepository  (sonra: node + DB)
```

- `routes/` — HTTP handler'ları, `queries/index.ts` imzalarına birebir.
- `repo.rs` — `ExplorerRepository` trait'i + `SeededRepository` impl.
- `seed.rs` / `graph.rs` — tohum veri + deterministik grafik üretimi
  (fixtures.ts + mulberry32 PRNG portu).
- `types.rs` — `types/index.ts` Rust portu; tüm struct'lar `camelCase`
  serialize eder (frontend TS tipleriyle uyum).

Gerçek indexer hazır olunca, yeni bir `ExplorerRepository` impl (örn. node
JSON-RPC + sled/Postgres) `main.rs`/`app()` içinde değiştirilir — **API ve
tipler sabit kalır.**

## Endpoint'ler

| Method | Yol | Frontend imzası |
|---|---|---|
| GET | `/api/health` | — |
| GET | `/api/wallet/{address}/summary` | `getWalletSummary` |
| GET | `/api/wallet/{address}/relations` | `getWalletRelations` |
| GET | `/api/token/{id}/distribution` | `getTokenDistribution` |
| GET | `/api/token/{id}` | token metadata |
| GET | `/api/transactions?page=&address=&counterparty=` | `getTransactions` |
| GET | `/api/search?q=` | `classifyQuery` |
| GET | `/api/market` · `/api/market/categories` · `/api/trending` | fixtures satır tipleri |
| GET | `/api/accounts` · `/api/accounts/{id}` | `OWN_ACCOUNTS` |
| GET | `/api/accounts/{id}/holdings/tokens` · `.../nfts` | `OWN_TOKEN_HOLDINGS` / `OWN_NFTS` |

## Çalıştırma

```bash
cd backend
cargo run            # http://0.0.0.0:8080
# PORT=3001 cargo run   # özel port
```

Sağlık: `curl http://localhost:8080/api/health`

## Doğrulama

```bash
cargo fmt && cargo clippy --all-targets -- -D warnings && cargo test
```

## Frontend'e bağlama (bu branch'te yapıldı)

`src/features/explorer/queries/index.ts` artık Rust backend'e `fetch` ile
bağlı (`src/features/explorer/api/client.ts`). `next.config.ts` `/api/:path*`
rewrite'ı istemci-tarafı çağrıları backend'e proxiler. Sunucu componentleri
`BUDLUM_API_URL` üzerinden doğrudan backend'e gider.

Çalıştırma (uçtan uca):
```bash
# 1) backend
cd backend && cargo run            # http://localhost:8080  (DATA_SOURCE=node + BUDLUM_RPC_URL=node:8545 => gerçek zincir)
# 2) frontend
cd .. && npm run dev               # http://localhost:3000
```

> Veri kaynağı şimdilik **tohum** (Figma mock'ları). Gerçek zincir verisi
> `IndexerRepository` ile gelir; HTTP sözleşmesi değişmez.
