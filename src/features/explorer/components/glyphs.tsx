import type { TokenVariant } from "../types";

/** 4 köşeli parıltı — içi dolu/çizgili varyantlar. */
export function Sparkle({
  className,
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2C12 8 8 12 2 12C8 12 12 16 12 22C12 16 16 12 22 12C16 12 12 8 12 2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Marka çiçeği silueti — 4 yaprak, ortada yıldız negatifi (flowermimu). */
export function FlowerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 1C14.5 4 14.5 8 12 11C9.5 8 9.5 4 12 1ZM23 12C20 14.5 16 14.5 13 12C16 9.5 20 9.5 23 12ZM12 23C9.5 20 9.5 16 12 13C14.5 16 14.5 20 12 23ZM1 12C4 9.5 8 9.5 11 12C8 14.5 4 14.5 1 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Transfer yönü oku — sage sparkle-ok (Figma transfer satırları). */
export function TransferArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4 12H17M17 12L13 8M17 12L13 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 9.5C20 11 19 12 17.5 12C19 12 20 13 20 14.5C20 13 21 12 22.5 12C21 12 20 11 20 9.5Z" fill="currentColor" />
    </svg>
  );
}

/** Piksel insan figürü — Gamefi (Lubo vs Fiction) ikonu. */
export function PixelFigure({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="currentColor">
        <rect x="10" y="3" width="4" height="4" />
        <rect x="8" y="8" width="8" height="6" />
        <rect x="4" y="9" width="3" height="2" />
        <rect x="17" y="9" width="3" height="2" />
        <rect x="9" y="15" width="2" height="6" />
        <rect x="13" y="15" width="2" height="6" />
      </g>
    </svg>
  );
}

/** Token ikonu — 28px kare; varyanta göre zemin/glif (Figma transfer satırları). */
export function TokenIcon({
  variant = "sage",
  className = "size-7",
}: {
  variant?: TokenVariant;
  className?: string;
}) {
  const base = `flex shrink-0 items-center justify-center border ${className}`;
  switch (variant) {
    case "ink":
      return (
        <span className={`${base} border-border-soft bg-surface text-ink`}>
          <Sparkle filled className="size-4" />
        </span>
      );
    case "purple":
      return <span className={`${base} border-border-soft bg-token-purple`} />;
    case "tan":
      return (
        <span className={`${base} border-border-soft bg-token-tan text-surface`}>
          <Sparkle filled className="size-4" />
        </span>
      );
    case "rose":
      return <span className={`${base} border-border-soft bg-token-rose`} />;
    default:
      return (
        <span className={`${base} border-border-soft bg-surface text-sage`}>
          <Sparkle filled className="size-4" />
        </span>
      );
  }
}

/** Uygulama ikonu — beyaz kare içinde kategori glifi. */
export function AppIcon({
  icon,
  className = "size-10",
}: {
  icon: "lum" | "fiction" | "bud";
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center border border-border-soft bg-surface ${className}`}
    >
      {icon === "lum" && <Sparkle className="size-5 text-ink" />}
      {icon === "fiction" && <PixelFigure className="size-5 text-ink" />}
      {icon === "bud" && <TransferArrow className="size-5 text-sage" />}
    </span>
  );
}
