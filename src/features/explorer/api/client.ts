/**
 * Explorer API istemcisi — Rust backend'e (budlum-explorer-api) fetch.
 *
 * Budlum ağı için: backend, Budlum node JSON-RPC'ye bağlı explorer API'sidir
 * (DATA_SOURCE=node modunda gerçek zincir verisi; aksi halde tohum veri).
 *
 * Çalışma bağlamı:
 *  - Sunucu (Next.js server components): doğrudan backend iç URL'i
 *    (BUDLUM_API_URL, örn. http://localhost:8080 veya prod'da http://backend:8080).
 *  - İstemci (browser): aynı-köken /api/* — next.config.ts rewrites bunu
 *    backend'e proxiler (CORS'u prod'da kaldırır).
 */
import type {
  SearchResult,
  TransactionPage,
  WalletGraph,
  WalletSummary,
} from "../types";

const API_BASE =
  typeof window === "undefined"
    ? (process.env.BUDLUM_API_URL ?? "http://localhost:8080")
    : "";

/** 404 -> null (bilinmeyen adres/hesap boş durum); diğer hatalar fırlatılır. */
async function getJsonAllow404<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`explorer API ${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`explorer API ${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export interface TxQuery {
  address?: string;
  counterparty?: string;
  page?: number;
}

export const api = {
  walletSummary: (address: string) =>
    getJsonAllow404<WalletSummary>(
      `/api/wallet/${encodeURIComponent(address)}/summary`,
    ),
  walletRelations: (address: string) =>
    getJson<WalletGraph>(`/api/wallet/${encodeURIComponent(address)}/relations`),
  tokenDistribution: (tokenId: string) =>
    getJson<WalletGraph>(`/api/token/${encodeURIComponent(tokenId)}/distribution`),
  transactions: (opts: TxQuery = {}) => {
    const q = new URLSearchParams();
    if (opts.page != null) q.set("page", String(opts.page));
    if (opts.address) q.set("address", opts.address);
    if (opts.counterparty) q.set("counterparty", opts.counterparty);
    const qs = q.toString();
    return getJson<TransactionPage>(`/api/transactions${qs ? `?${qs}` : ""}`);
  },
  search: (q: string) =>
    getJson<SearchResult | null>(`/api/search?q=${encodeURIComponent(q)}`),
};
