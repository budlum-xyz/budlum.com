/**
 * Tüm UI metinleri tek yerde — Figma mock'larındaki tutarsızlıklar
 * (Revaştakiler ↔ Top ranks, son transfer ↔ son transferler) buradan yönetilir.
 */
export const COPY = {
  brand: "budlum",
  searchPlaceholder: "Adres, kullanıcı ismi veya uygulama aratın",
  nav: {
    transactions: "Transactions",
    market: "Market",
    topRanks: "Top ranks", // Figma'da "Revaştakiler" varyantı da var; spec "Top ranks" diyor
  },
  inspector: {
    recentTransfers: "son transferler",
    recentApps: "son kullandığı uygulamalar",
    openTransfers: "transferleri aç",
    tokens: (count: number, total: string, symbol: string) =>
      `${count} tokens (${total} ${symbol})`,
    nft: (count: number) => `${count} NFT`,
  },
  transactions: {
    title: "Transactions",
    block: (n: string) => `block: ${n}`,
    columns: {
      signature: "Signature",
      time: "Time",
      instructions: "Instructions",
      by: "By",
      value: "Value(LUM)",
      fee: "Fee(LUM)",
      smartContracts: "Smart Contracts",
    },
  },
  states: {
    loading: "yükleniyor",
    empty: "sonuç bulunamadı",
    error: "bir şeyler ters gitti",
    retry: "tekrar dene",
  },
} as const;
