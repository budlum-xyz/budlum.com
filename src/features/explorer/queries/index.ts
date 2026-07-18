import type {
  SearchResult,
  TransactionPage,
  WalletGraph,
  WalletSummary,
} from "../types";
import {
  ADDRESSES,
  TOKENS,
  WALLETS,
  buildTokenDistribution,
  buildTransactions,
  buildWalletGraph,
} from "./fixtures";

/**
 * Mock servis katmanı — gerçek zincir API'si hazır olduğunda SADECE bu dosya
 * gerçek fetch çağrılarıyla değişecek; bileşenler bu imzalara bağlı kalacak.
 */

const LATENCY_MS = 350;
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS));

/** Arama sınıflandırması (spec §2): token adı → token; aksi halde cüzdan. */
export function classifyQuery(q: string): SearchResult {
  const query = q.trim();
  if (!query) return null;
  const token = TOKENS[query.toLowerCase()];
  if (token) return { kind: "token", tokenId: token.id };
  const byName = Object.values(WALLETS).find(
    (w) => w.displayName?.toLowerCase() === query.toLowerCase(),
  );
  if (byName) return { kind: "wallet", address: byName.address };
  return { kind: "wallet", address: query };
}

export async function getWalletSummary(
  address: string,
): Promise<WalletSummary | null> {
  await delay();
  const known = WALLETS[address];
  if (known) return known;
  // Bilinmeyen adres: anonim cüzdan (avatar yok, düşük veri) — boş durum değil
  if (address.length < 8) return null;
  return {
    address,
    primaryBalance: { amount: "0M", symbol: "LUM", variant: "sage" },
    tokenCount: 0,
    tokenTotal: { amount: "0M", symbol: "LUM" },
    nftCount: 0,
    recentTransfers: [],
    recentApps: [],
  };
}

export async function getWalletRelations(address: string): Promise<WalletGraph> {
  await delay();
  return buildWalletGraph(address);
}

export async function getTokenDistribution(tokenId: string): Promise<WalletGraph> {
  await delay();
  return buildTokenDistribution(tokenId);
}

const ALL_TX = buildTransactions();
const PAGE_SIZE = 13;

export async function getTransactions(opts: {
  address?: string;
  counterparty?: string;
  page?: number;
}): Promise<TransactionPage> {
  await delay();
  const page = Math.max(0, opts.page ?? 0);
  const start = page * PAGE_SIZE;
  return {
    items: ALL_TX.slice(start, start + PAGE_SIZE),
    block: "456789",
    totalPages: Math.ceil(ALL_TX.length / PAGE_SIZE),
    page,
  };
}

export { ADDRESSES };
