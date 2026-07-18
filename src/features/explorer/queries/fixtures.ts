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
    // Anlamlı eşik üstü edge'ler: KISA komşu zincirleri (Figma'daki siyah node çiftleri)
    if (i > 0 && rand() < 0.22) {
      const me = nodes[nodes.length - 1];
      let nearest: (typeof nodes)[number] | null = null;
      let best = Infinity;
      for (const other of nodes.slice(0, -1)) {
        const d = (other.x - me.x) ** 2 + (other.y - me.y) ** 2;
        if (d < best) {
          best = d;
          nearest = other;
        }
      }
      if (nearest && best < 120 ** 2) {
        edges.push({
          id: `d${i}`,
          source: nearest.id,
          target: address,
          relation: "distribution" as const,
        });
      }
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

/* ------------------------- Faz 1b: kullanıcının kendi hesapları ------------------------- */

export interface OwnAccount {
  id: string;
  name: string;
  address: string;
  coordinate: { x: number; y: number };
  avatarUrl?: string; // yoksa düz sage kare (anonim kuralı)
  summary: WalletSummary;
}

/** Figma mock'undaki anahtar/seed değerleri — sadece gösterim, gerçek değil. */
export const MOCK_PRIVATE_KEY =
  "64898921wyesbguxovyubzuyvzbwyw8997nwh7w92jw8jw2190w12zwbh2199wz7k91zjwzb2wy912yhz1872zeez27h";
export const MOCK_SEED_PHRASE =
  "course digital budlum heart bee book button melody sponge paw frozen cheese";

function ownSummary(
  address: string,
  name: string,
  avatarUrl?: string,
  coordinate: { x: number; y: number } = { x: 1233, y: -1234 },
): WalletSummary {
  // Figma "You" portföy kartı verisi: 2 tokens (0.81M LUM), 2 NFT, 200K $BUD, tek transfer
  return {
    address,
    displayName: name,
    avatarUrl,
    coordinate,
    primaryBalance: { amount: "200K", symbol: "BUD", variant: "sage" },
    tokenCount: 2,
    tokenTotal: { amount: "0.81M", symbol: "LUM" },
    nftCount: 2,
    recentTransfers: [
      {
        id: "t1",
        amount: "100.3K",
        symbol: "BUD",
        variant: "sage",
        counterparty: ADDRESSES.beyza,
      },
    ],
    recentApps: [
      { id: "a1", name: "Lum", category: "Defi", icon: "lum" },
      { id: "a2", name: "Bud", category: "Socialfi", icon: "bud" },
    ],
  };
}

export const OWN_ACCOUNTS: OwnAccount[] = [
  {
    id: "you",
    name: "You",
    address: "0543a86L07Gp4rT8bN2mV6cX1sDptA90pA",
    coordinate: { x: 1233, y: -1234 },
    summary: ownSummary("0543a86L07Gp4rT8bN2mV6cX1sDptA90pA", "You"),
  },
  {
    id: "eurymede",
    name: "Eurymede",
    address: "0983z65Pm4Kj8nQ2wR6tY1uIojfB17hS",
    coordinate: { x: -210, y: 540 },
    avatarUrl: "/assets/avatars/avatar-4.png",
    summary: ownSummary(
      "0983z65Pm4Kj8nQ2wR6tY1uIojfB17hS",
      "Eurymede",
      "/assets/avatars/avatar-4.png",
    ),
  },
  {
    id: "ayaz",
    name: "Ayaz",
    address: "0763a86Ly2Wd5sF9gH3jK7lZ4xCptA20ps",
    coordinate: { x: 98, y: -77 },
    avatarUrl: "/assets/avatars/avatar-3.png",
    summary: ownSummary(
      "0763a86Ly2Wd5sF9gH3jK7lZ4xCptA20ps",
      "Ayaz",
      "/assets/avatars/avatar-3.png",
    ),
  },
  {
    id: "bugra",
    name: "Buğra",
    address: "02s3a86L1t5Vb8nM4kJ9hG2fDsYtA90pA",
    coordinate: { x: 4040, y: 12 },
    avatarUrl: "/assets/avatars/avatar-5.png",
    summary: ownSummary(
      "02s3a86L1t5Vb8nM4kJ9hG2fDsYtA90pA",
      "Buğra",
      "/assets/avatars/avatar-5.png",
    ),
  },
  {
    id: "cheesecake",
    name: "Cheesecake",
    address: "0g43GH9kP6mB3vC8xZ5nQ1wEsJh7325Y",
    coordinate: { x: -1500, y: -320 },
    avatarUrl: "/assets/avatars/avatar-1.png",
    summary: ownSummary(
      "0g43GH9kP6mB3vC8xZ5nQ1wEsJh7325Y",
      "Cheesecake",
      "/assets/avatars/avatar-1.png",
    ),
  },
  {
    id: "avocado",
    name: "Avocado",
    address: "0mv61hi0v9Rt2yU7iO4pL6kJsbe040tR",
    coordinate: { x: 730, y: 2205 },
    avatarUrl: "/assets/avatars/avatar-6.png",
    summary: ownSummary(
      "0mv61hi0v9Rt2yU7iO4pL6kJsbe040tR",
      "Avocado",
      "/assets/avatars/avatar-6.png",
    ),
  },
];

export function getOwnAccount(id: string): OwnAccount | undefined {
  return OWN_ACCOUNTS.find((a) => a.id === id);
}
