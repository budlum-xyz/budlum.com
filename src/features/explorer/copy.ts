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
  wallet: {
    haveWallet: "zaten bir cüzdanım var",
    securityTitle: "tohum tümceciğin tek kurtarma anahtarındır",
    securityBody:
      "Kaybedersen cüzdanına bir daha erişemezsin; kimseyle paylaşma, ekran görüntüsü alma. Budlum bu kelimeleri asla senden istemez ve hiçbir sunucuya göndermez.",
    securityAck: "Anladım, kelimeleri güvenle kaydedeceğim",
    seedTitle: "Tohum tümceciği",
    noted: "Not aldım ilerle",
    verifyTitle: "kelimeleri doğrula",
    verifyHint: (nums: string) => `${nums}. kelimeleri sırasıyla yaz`,
    verifyError: "kelimeler eşleşmedi, tekrar dene",
    done: "Tamamdır",
    login: "Giriş yap",
    seedLengthError: "Tohum tümceciği 12, 18 veya 24 kelime olmalı",
    keyFormatError: "Anahtar formatı doğrulanamadı",
    walletVerified: "Cüzdan doğrulandı",
  },
  me: {
    openInLum: "Lum'da aç",
    openInBud: "Bud'da aç",
    privateKey: "Özel anahtar",
    seedPhrase: "Tohum tümceciği",
    revealHint: "göstermek için göze tıklayınız",
    logout: "çıkış yap",
    logoutConfirm: "çıkmak için tekrar tıkla",
    lastTransfer: "son transfer",
    myKeys: "anahtarlarım",
    backToWallet: "cüzdanıma dön",
    addAccount: "Hesap ekle",
    importPlaceholder: "Buraya metni giriniz",
    or: "ya da",
    continue: "devam",
    coordinates: "koordinatlar",
    openWalletHere: "cüzdanı bu alana aç",
  },
} as const;
