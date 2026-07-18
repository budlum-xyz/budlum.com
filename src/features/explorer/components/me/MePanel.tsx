import Image from "next/image";
import Link from "next/link";
import { COPY } from "../../copy";
import type { OwnAccount } from "../../queries/fixtures";
import { MOCK_PRIVATE_KEY, MOCK_SEED_PHRASE } from "../../queries/fixtures";
import { formatCoordinate, shortAddress } from "../../utils/format";
import { TokenIcon, TransferArrow } from "../glyphs";
import { LogoutButton } from "./LogoutButton";
import { SecretField } from "./SecretField";

/**
 * Kendi cüzdan paneli — iki durum (Figma "kullanıcı kendi cüzdanını açtı"):
 * - portfolio: dişli ikon + varlıklar + son transfer + transferleri aç
 * - keys: Özel anahtar / Tohum tümceciği (göz toggle) + iki aşamalı çıkış
 */
export function MePanel({
  account,
  panel,
}: {
  account: OwnAccount;
  panel: "portfolio" | "keys";
}) {
  const s = account.summary;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Kimlik + dişli */}
      <div className="flex items-start gap-4">
        {account.avatarUrl ? (
          <Image
            src={account.avatarUrl}
            alt=""
            width={88}
            height={88}
            className="shrink-0 border border-border-soft object-cover"
          />
        ) : (
          <span aria-hidden className="size-[88px] shrink-0 bg-sage" />
        )}
        <div className="flex flex-col gap-1 pt-1">
          <span className="text-xl leading-tight">{account.name}</span>
          <span className="font-data text-xl leading-tight" title={account.address}>
            {shortAddress(account.address)}
          </span>
          <span className="text-xl leading-tight text-sage-dark">
            {formatCoordinate(account.coordinate)}
          </span>
        </div>
        <Link
          href="/accounts"
          aria-label="hesap değiştir"
          className="ml-auto text-ink transition-opacity hover:opacity-70"
        >
          <GearGlyph className="size-6" />
        </Link>
      </div>

      {panel === "portfolio" ? (
        <>
          {/* Varlıklar */}
          <div className="flex items-center gap-4">
            <TransferArrow className="size-6 text-sage" />
            <div className="flex flex-col gap-1 font-data text-xl">
              <span className="w-fit underline underline-offset-4">
                {COPY.inspector.tokens(s.tokenCount, s.tokenTotal.amount, s.tokenTotal.symbol)}
              </span>
              <span className="w-fit underline underline-offset-4">
                {COPY.inspector.nft(s.nftCount)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TokenIcon variant={s.primaryBalance.variant} className="size-8" />
            <span className="font-data text-xl">
              {s.primaryBalance.amount} ${s.primaryBalance.symbol}
            </span>
          </div>

          {/* Son transfer */}
          <div className="flex flex-col gap-3">
            <span className="text-base">{COPY.me.lastTransfer}</span>
            <ul className="flex flex-col gap-2">
              {s.recentTransfers.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <TokenIcon variant={t.variant} />
                  <span className="whitespace-nowrap font-data text-base">
                    {t.amount} ${t.symbol}
                  </span>
                  <TransferArrow className="mx-auto size-4 shrink-0 text-sage" />
                  <Link
                    href={`/address/${encodeURIComponent(t.counterparty)}`}
                    className="whitespace-nowrap font-data text-base hover:opacity-70"
                    title={t.counterparty}
                  >
                    {shortAddress(t.counterparty)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/transactions?address=${encodeURIComponent(account.address)}`}
              className="mt-1 w-fit self-center border border-border px-5 py-1 text-base hover:bg-surface"
            >
              {COPY.inspector.openTransfers}
            </Link>
          </div>

          <Link
            href={`/me?account=${account.id}&panel=keys`}
            className="w-fit text-base text-sage-dark underline underline-offset-4 hover:opacity-70"
          >
            {COPY.me.myKeys}
          </Link>
        </>
      ) : (
        <>
          <SecretField label={COPY.me.privateKey} value={MOCK_PRIVATE_KEY} />
          <SecretField label={COPY.me.seedPhrase} value={MOCK_SEED_PHRASE} />
          <LogoutButton />
          <Link
            href={`/me?account=${account.id}`}
            className="w-fit text-base text-sage-dark underline underline-offset-4 hover:opacity-70"
          >
            {COPY.me.backToWallet}
          </Link>
        </>
      )}
    </div>
  );
}

function GearGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5ZM12 2L13 5.1A7 7 0 0 1 15.5 6.1L18.5 4.7L20.3 7.8L17.9 9.9A7 7 0 0 1 17.9 14.1L20.3 16.2L18.5 19.3L15.5 17.9A7 7 0 0 1 13 18.9L12 22L11 18.9A7 7 0 0 1 8.5 17.9L5.5 19.3L3.7 16.2L6.1 14.1A7 7 0 0 1 6.1 9.9L3.7 7.8L5.5 4.7L8.5 6.1A7 7 0 0 1 11 5.1L12 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
