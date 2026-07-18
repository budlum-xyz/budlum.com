import type {
  GraphNode,
  TransactionRow,
  WalletGraph,
  WalletSummary,
} from "../types";

/**
 * Figma mock'larındaki verilerle birebir hazırlanmış fixtures.
 * Gerçek indexer/API hazır olduğunda yalnızca queries/ katmanı değişecek.
 */

export const ADDRESSES = {
  beyza: "0243a86yu4Fq9tR2vLm8sK1pWdhtA6opA",
  ayaz: "04533a8ru7Kp2mN9cX4vB6qJs1htA64ep",
  user232393: "0699a86u3Tz8wQ5rY2nM7kL4pDhtplopA",
  counterpartyA: "05redft5g8Hj3kL6mN9pQ2rS5tfeA6ytQ",
} as const;

export const WALLETS: Record<string, WalletSummary> = {
  [ADDRESSES.beyza]: {
    address: ADDRESSES.beyza,
    displayName: "Beyza adıgüzel",
    avatarUrl: "/assets/avatars/avatar-6.png",
    coordinate: { x: 1233, y: -1234 },
    primaryBalance: { amount: "2M", symbol: "LUM", variant: "sage" },
    tokenCount: 26,
    tokenTotal: { amount: "7.81M", symbol: "LUM" },
    nftCount: 102,
    recentTransfers: [
      {
        id: "t1",
        amount: "100.3K",
        symbol: "LUM",
        variant: "sage",
        counterparty: ADDRESSES.counterpartyA,
      },
      {
        id: "t2",
        amount: "90.3K",
        symbol: "MUL",
        variant: "ink",
        counterparty: ADDRESSES.user232393,
      },
      {
        id: "t3",
        amount: "107",
        symbol: "LUM",
        variant: "sage",
        counterparty: ADDRESSES.ayaz,
      },
      {
        id: "t4",
        amount: "107",
        symbol: "LUM",
        variant: "sage",
        counterparty: ADDRESSES.counterpartyA,
        counterpartyAsset: { amount: "107", symbol: "BUDL", variant: "tan" },
      },
    ],
    recentApps: [
      { id: "a1", name: "Lum", category: "Defi", icon: "lum" },
      { id: "a2", name: "Lubo vs Fiction", category: "Gamefi", icon: "fiction" },
      { id: "a3", name: "Bud", category: "Socialfi", icon: "bud" },
    ],
  },
  [ADDRESSES.ayaz]: {
    address: ADDRESSES.ayaz,
    displayName: "Ayaz adıgüzel",
    avatarUrl: "/assets/avatars/avatar-2.png",
    coordinate: { x: -420, y: 866 },
    primaryBalance: { amount: "2M", symbol: "LUM", variant: "sage" },
    tokenCount: 26,
    tokenTotal: { amount: "7.81M", symbol: "BUD" },
    nftCount: 102,
    recentTransfers: [
      {
        id: "t1",
        amount: "100.3K",
        symbol: "LUM",
        variant: "sage",
        counterparty: ADDRESSES.beyza,
      },
      {
        id: "t2",
        amount: "90.3K",
        symbol: "MUL",
        variant: "ink",
        counterparty: ADDRESSES.user232393,
      },
    ],
    recentApps: [
      { id: "a1", name: "Lum", category: "Defi", icon: "lum" },
      { id: "a2", name: "Bud", category: "Socialfi", icon: "bud" },
    ],
  },
  [ADDRESSES.user232393]: {
    address: ADDRESSES.user232393,
    displayName: "user232393",
    coordinate: { x: 87, y: 3010 },
    primaryBalance: { amount: "0.00005M", symbol: "LUM", variant: "sage" },
    tokenCount: 2,
    tokenTotal: { amount: "0.081M", symbol: "BUD" },
    nftCount: 0,
    recentTransfers: [
      {
        id: "t1",
        amount: "107",
        symbol: "LUM",
        variant: "sage",
        counterparty: ADDRESSES.beyza,
      },
    ],
    recentApps: [{ id: "a1", name: "Lum", category: "Defi", icon: "lum" }],
  },
};

/** Diskte var olan taş asset indeksleri (daş 9 Figma'da yok). */
const STONE_INDICES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14];
const pickStone = (r: number) => STONE_INDICES[Math.floor(r * STONE_INDICES.length)];

/** Deterministik PRNG — layout her render'da aynı kalsın (kabul kriteri). */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cüzdan ilişki grafiği — TEK HOP outgoing, dallandırılmaz (tasarımcı notu). */
export function buildWalletGraph(address: string): WalletGraph {
  const rand = mulberry32(hashCode(address));
  const satelliteCount = address === ADDRESSES.user232393 ? 5 : 10;
  const nodes: GraphNode[] = [
    {
      id: address,
      kind: "wallet",
      address,
      x: 0,
      y: 0,
      size: 100,
      visualVariant: "star",
    },
  ];
  const edges = [];
  for (let i = 0; i < satelliteCount; i++) {
    // Figma B ekranındaki gibi: merkez etrafında düzensiz halka (r 140-260px)
    const angle = (i / satelliteCount) * Math.PI * 2 + rand() * 0.5;
    const r = 150 + rand() * 110;
    const target =
      i === 2 && address === ADDRESSES.beyza
        ? ADDRESSES.ayaz // Beyza'nın bir taşı Ayaz'a gider (ok anotasyonu)
        : `0${Math.floor(rand() * 1e15).toString(36)}QmR${i}pXhtA6o${i}A`;
    nodes.push({
      id: target,
      kind: "wallet",
      address: target,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r * 0.75,
      size: 52 + rand() * 38,
      visualVariant: "stone",
      stoneIndex: pickStone(rand()),
    });
    edges.push({
      id: `e${i}`,
      source: address,
      target,
      relation: "transfer" as const,
    });
  }
  return { nodes, edges };
}

/** Token arz dağılımı — yoğun holder bulutu (Figma C ekranı, ~80 taş). */
export function buildTokenDistribution(tokenId: string): WalletGraph {
  const rand = mulberry32(hashCode(tokenId) + 7);
  const nodes: GraphNode[] = [];
  const edges = [];
  const count = 80;
  for (let i = 0; i < count; i++) {
    // Dairesel bulut: merkezden dışa doğru seyrekleşen dağılım
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 330;
    const sharePct =
      i === 0 ? 5 : i < 4 ? +(2 + rand() * 1.5).toFixed(1) : +(rand() * 0.9).toFixed(2);
    const address =
      i === 0
        ? ADDRESSES.beyza
        : i === 1
          ? ADDRESSES.user232393
          : `0${Math.floor(rand() * 1e15).toString(36)}Hl${i}dRhtA6o${i % 10}A`;
    nodes.push({
      id: address,
      kind: "holder",
      address,
      sharePct,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r * 0.8,
      size: 22 + Math.sqrt(sharePct) * 24, // sqrt scale — whale ekranı yutmasın
      visualVariant: i === 5 ? "star" : "stone",
      stoneIndex: pickStone(rand()),
    });
    // Anlamlı eşik üstü edge'ler: küçük zincirler (Figma'daki siyah node çiftleri)
    if (i > 0 && rand() < 0.18) {
      edges.push({
        id: `d${i}`,
        source: nodes[Math.floor(rand() * (i - 1))].id,
        target: address,
        relation: "distribution" as const,
      });
    }
  }
  return { nodes, edges };
}

/** İşlem satırları — Figma E ekranı deseni. */
export function buildTransactions(count = 40): TransactionRow[] {
  const rand = mulberry32(42);
  const rows: TransactionRow[] = [];
  for (let i = 0; i < count; i++) {
    const burn = i % 11 === 5;
    rows.push({
      signature: `5xC456Yuh123derJ${Math.floor(rand() * 1e12).toString(36)}Kp`,
      time: new Date(Date.UTC(2026, 3, 19, 17, 51, 32) - i * 47_000).toISOString(),
      instruction: burn ? "burn" : "swap",
      by: ADDRESSES.beyza,
      value: "230000",
      fee: "0.46",
      contract: !burn,
      variant: i % 6 === 5 ? "purple" : "sage",
    });
  }
  return rows;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const TOKENS: Record<string, { id: string; symbol: string; name: string }> = {
  lum: { id: "lum", symbol: "LUM", name: "budlum" },
  bud: { id: "bud", symbol: "BUD", name: "bud" },
};
