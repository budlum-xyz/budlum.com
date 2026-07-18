/**
 * Veri sözleşmeleri — PDF spec §12 birebir.
 * Parasal değerler decimal STRING taşınır; JS number precision kaybı yasak.
 */
export type DecimalString = string;

export type TokenVariant = "sage" | "ink" | "purple" | "tan" | "rose";

export interface AssetAmount {
  amount: DecimalString; // "2M", "100.3K" gibi formatlanmış VEYA ham decimal
  symbol: string; // LUM, BUD, MUL, BUDL — zincir metadata'sından gelir
  variant?: TokenVariant; // ikon rengi
}

export interface TransferPreview {
  id: string;
  amount: DecimalString;
  symbol: string;
  variant?: TokenVariant;
  counterparty: string; // tam adres; UI'da kısaltılır
  counterpartyAsset?: AssetAmount; // "107 $LUM → 107 $BUDL" satırı için
}

export type AppCategory = "Defi" | "Gamefi" | "Socialfi";

export interface AppUsage {
  id: string;
  name: string;
  category: AppCategory;
  icon: "lum" | "fiction" | "bud";
}

export interface WalletSummary {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  coordinate?: { x: number; y: number };
  primaryBalance: AssetAmount;
  tokenCount: number;
  tokenTotal: AssetAmount; // "26 tokens (7.81M LUM)" içindeki toplam
  nftCount: number;
  recentTransfers: TransferPreview[];
  recentApps: AppUsage[];
}

export interface GraphNode {
  id: string;
  kind: "wallet" | "token" | "holder";
  label?: string;
  address?: string;
  sharePct?: number; // token grafiğinde arz payı
  x: number; // fixture koordinatı — layout runtime'da hesaplanmaz
  y: number;
  size: number; // px taban boyutu (1920 referans)
  visualVariant: "stone" | "star";
  stoneIndex?: number; // stone-01..14 asset seçimi
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: "transfer" | "distribution";
}

export interface WalletGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TransactionRow {
  signature: string;
  time: string; // UTC ISO 8601
  instruction: string; // normalize edilmiş etiket: swap, burn...
  by: string; // tam adres
  value: DecimalString;
  fee: DecimalString;
  contract: boolean; // smart contract ikonu
  variant: TokenVariant;
}

export interface TransactionPage {
  items: TransactionRow[];
  cursor?: string;
  block: string;
  totalPages: number;
  page: number;
}

export type SearchResult =
  | { kind: "wallet"; address: string }
  | { kind: "token"; tokenId: string }
  | null;
