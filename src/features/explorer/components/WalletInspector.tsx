import Image from "next/image";
import Link from "next/link";
import { COPY } from "../copy";
import type { WalletSummary } from "../types";
import { formatCoordinate, shortAddress } from "../utils/format";
import { AppIcon, TokenIcon, TransferArrow } from "./glyphs";

/**
 * Sağ inspector paneli — Figma 2870:3749 sağ sütunu.
 * Veri sırası (spec §8): kimlik → token/NFT → bakiye → transferler → CTA → uygulamalar.
 */
export function WalletInspector({ wallet }: { wallet: WalletSummary }) {
  const {
    address,
    displayName,
    avatarUrl,
    coordinate,
    primaryBalance,
    tokenCount,
    tokenTotal,
    nftCount,
    recentTransfers,
    recentApps,
  } = wallet;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Kimlik */}
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={88}
            height={88}
            className="shrink-0 border border-border-soft object-cover"
          />
        ) : (
          <span aria-hidden className="size-[88px] shrink-0 bg-sage" />
        )}
        <div className="flex flex-col gap-1 pt-1">
          {displayName ? (
            <span className="text-xl leading-tight">{displayName}</span>
          ) : null}
          <span
            className="font-data text-xl leading-tight"
            title={address}
          >
            {shortAddress(address)}
          </span>
          {coordinate ? (
            <span className="text-xl leading-tight text-sage-dark">
              {formatCoordinate(coordinate)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Token / NFT toplamları */}
      <div className="flex items-center gap-4">
        <TransferArrow className="size-6 text-sage" />
        <div className="flex flex-col gap-1 font-data text-xl">
          <button type="button" className="w-fit underline underline-offset-4 hover:opacity-70">
            {COPY.inspector.tokens(tokenCount, tokenTotal.amount, tokenTotal.symbol)}
          </button>
          <button type="button" className="w-fit underline underline-offset-4 hover:opacity-70">
            {COPY.inspector.nft(nftCount)}
          </button>
        </div>
      </div>

      {/* Ana bakiye */}
      <div className="flex items-center gap-3">
        <TokenIcon variant={primaryBalance.variant} className="size-8" />
        <span className="font-data text-xl">
          {primaryBalance.amount} ${primaryBalance.symbol}
        </span>
      </div>

      {/* Son transferler */}
      <div className="flex flex-col gap-3">
        <span className="text-base">{COPY.inspector.recentTransfers}</span>
        {recentTransfers.length === 0 ? (
          <span className="font-data text-base text-muted">veri yok</span>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentTransfers.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <TokenIcon variant={t.variant} />
                <span className="whitespace-nowrap font-data text-base">
                  {t.amount} ${t.symbol}
                </span>
                <TransferArrow className="mx-auto size-4 shrink-0 text-sage" />
                {t.counterpartyAsset ? (
                  <span className="flex items-center gap-2 whitespace-nowrap font-data text-base">
                    <TokenIcon variant={t.counterpartyAsset.variant} />
                    {t.counterpartyAsset.amount} ${t.counterpartyAsset.symbol}
                  </span>
                ) : (
                  <Link
                    href={`/address/${encodeURIComponent(t.counterparty)}`}
                    className="whitespace-nowrap font-data text-base hover:opacity-70"
                    title={t.counterparty}
                  >
                    {shortAddress(t.counterparty)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/transactions?address=${encodeURIComponent(address)}`}
          className="mt-1 w-fit self-center border border-border px-5 py-1 text-base hover:bg-surface"
        >
          {COPY.inspector.openTransfers}
        </Link>
      </div>

      {/* Son kullandığı uygulamalar */}
      <div className="flex flex-col gap-3">
        <span className="text-base">{COPY.inspector.recentApps}</span>
        {recentApps.length === 0 ? (
          <span className="font-data text-base text-muted">veri yok</span>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentApps.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <AppIcon icon={a.icon} />
                <span className="flex flex-col text-base leading-tight">
                  {a.name}
                  <span className="text-sage-dark">{a.category}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Panel skeleton — layout zıplamasın (kabul kriteri). */
export function WalletInspectorSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6 p-8" aria-busy>
      <div className="flex items-start gap-4">
        <span className="size-[88px] bg-border-soft" />
        <div className="flex flex-col gap-2 pt-1">
          <span className="h-5 w-36 bg-border-soft" />
          <span className="h-5 w-44 bg-border-soft" />
          <span className="h-5 w-24 bg-border-soft" />
        </div>
      </div>
      <span className="h-12 w-52 bg-border-soft" />
      <span className="h-8 w-32 bg-border-soft" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-7 w-full bg-border-soft" />
        ))}
      </div>
    </div>
  );
}
