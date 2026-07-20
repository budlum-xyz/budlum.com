import type {
  SearchResult,
  TransactionPage,
  WalletGraph,
  WalletSummary,
} from "../types";
import { api } from "../api/client";
import { ADDRESSES } from "./fixtures";

/**
 * Veri erişim katmanı — Rust backend (budlum-explorer-api) üzerinden fetch.
 * Bileşenler bu imzalara bağlı kalır; mock dönemi kapandı.
 *
 * Budlum ağı için: backend, Budlum node JSON-RPC'ye bağlı explorer API'sidir
 * (DATA_SOURCE=node -> gerçek zincir verisi: bakiye, işlem geçmişi, BNS).
 * Sunucu tarafında doğrudan backend (BUDLUM_API_URL), istemcide next.config
 * rewrites üzerinden aynı-köken /api.
 */

/** Arama sınıflandırması — backend /api/search (Budlum BNS .bud çözümleme dahil). */
export async function classifyQuery(q: string): Promise<SearchResult> {
  return (await api.search(q)) ?? null;
}

export async function getWalletSummary(
  address: string,
): Promise<WalletSummary | null> {
  return api.walletSummary(address);
}

export async function getWalletRelations(
  address: string,
): Promise<WalletGraph> {
  return api.walletRelations(address);
}

export async function getTokenDistribution(
  tokenId: string,
): Promise<WalletGraph> {
  return api.tokenDistribution(tokenId);
}

export async function getTransactions(opts: {
  address?: string;
  counterparty?: string;
  page?: number;
}): Promise<TransactionPage> {
  return api.transactions(opts);
}

export { ADDRESSES };
