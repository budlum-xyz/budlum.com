import Link from "next/link";
import { COPY } from "../../copy";
import { Sparkle } from "../glyphs";

/** Seçilebilir parsel — koyu plot picker'daki dağınık kareler (30px karo gridine hizalı). */
const PLOTS = [
  { x: 450, y: 390, cx: -3200, cy: 880 },
  { x: 780, y: 510, cx: 640, cy: -120 },
  { x: 960, y: 510, cx: 10000, cy: 435 }, // Figma'daki örnek koordinat
  { x: 570, y: 630, cx: -80, cy: 2210 },
  { x: 750, y: 660, cx: 1500, cy: 96 },
  { x: 1080, y: 600, cx: 5230, cy: -740 },
  { x: 420, y: 690, cx: -940, cy: -1830 },
] as const;

const DEFAULT_PLOT = PLOTS[2];

/**
 * /wallet canvas'ı — dağınık parseller; tıklanan parselin koordinatı panele düşer.
 * Durum URL query'de taşınır (yenilemede korunur — spec şartı).
 */
export function WalletPlots({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      {PLOTS.map((p) => {
        const selected = p.cx === cx && p.cy === cy;
        return (
          <Link
            key={`${p.x}-${p.y}`}
            href={`/wallet?x=${p.cx}&y=${p.cy}`}
            replace
            aria-label={`parsel x${p.cx} y${p.cy}`}
            aria-current={selected ? "true" : undefined}
            className={`absolute flex size-[30px] items-center justify-center border bg-surface transition-opacity hover:opacity-80 ${
              selected
                ? "border-sage shadow-[0_0_8px_#98ae89]"
                : "border-border-soft"
            }`}
            style={{ left: p.x, top: p.y }}
          >
            <Sparkle className="size-4 text-sage" />
          </Link>
        );
      })}
    </>
  );
}

/** /wallet sağ paneli — koordinat + "cüzdanı bu alana aç" + "zaten bir cüzdanım var". */
export function WalletEntryPanel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <div className="flex h-full flex-col gap-5 p-8">
      {/* Avatar yer tutucu yığını (Figma: 3 kademeli kare) */}
      <div className="flex flex-col gap-2">
        <span aria-hidden className="size-24 bg-ink" />
        <span aria-hidden className="size-14 bg-ink" />
        <span aria-hidden className="size-8 bg-ink" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <span className="text-base">{COPY.me.coordinates}</span>
        <span className="border border-border bg-surface px-6 py-1.5 font-data text-base">
          x{cx} y{cy}
        </span>
        <Link
          href={`/wallet/create?x=${cx}&y=${cy}`}
          className="mt-2 border border-sage px-4 py-1.5 text-base text-sage-dark hover:opacity-70"
        >
          {COPY.me.openWalletHere}
        </Link>
      </div>

      <Link
        href="/wallet/import"
        className="mt-auto w-fit self-center border border-border px-4 py-1.5 text-base hover:opacity-70"
      >
        {COPY.wallet.haveWallet}
      </Link>
    </div>
  );
}

export { DEFAULT_PLOT };
