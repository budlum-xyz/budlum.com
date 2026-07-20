import type { NextConfig } from "next";

/**
 * Next.js yapılandırması.
 *
 * `/api/:path*` → Rust backend (budlum-explorer-api). İstemci-tarafı fetch'leri
 * (örn. UniversalSearch araması) aynı-köken /api/* üzerinden backend'e proxilenir
 * (prod'da CORS ihtiyacını kaldırır). Sunucu componentleri doğrudan BUDLUM_API_URL
 * kullanır (api/client.ts).
 *
 * Budlum ağı: backend Budlum node JSON-RPC'ye bağlıdır.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    const backend =
      process.env.BUDLUM_API_URL ?? "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
