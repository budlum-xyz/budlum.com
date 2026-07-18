import Link from "next/link";
import { OWN_ACCOUNTS } from "../../queries/fixtures";
import { formatCoordinate, shortAddress } from "../../utils/format";

/**
 * Ana ekrandaki kompakt You kartı — Figma 2856:4578 sağ üst köşe:
 * avatar + You (altı çizili) + adres + koordinat (altı çizili) + sage dişli.
 */
export function HomeYouCard() {
  const you = OWN_ACCOUNTS[0];
  return (
    <div className="absolute right-[14px] top-[110px] z-10 flex w-[480px] items-start gap-4 bg-canvas p-4">
      <Link href="/me" aria-label="cüzdanım">
        <span aria-hidden className="block size-[72px] bg-sage transition-opacity hover:opacity-80" />
      </Link>
      <div className="flex flex-col gap-0.5 pt-0.5">
        <Link href="/me" className="w-fit text-lg leading-tight underline underline-offset-4 hover:opacity-70">
          {you.name}
        </Link>
        <span className="font-data text-lg leading-tight" title={you.address}>
          {shortAddress(you.address)}
        </span>
        <Link
          href="/me"
          className="w-fit text-lg leading-tight text-sage-dark underline underline-offset-4 hover:opacity-70"
        >
          {formatCoordinate(you.coordinate)}
        </Link>
      </div>
      <Link
        href="/accounts"
        aria-label="hesap değiştir"
        className="ml-auto text-sage transition-opacity hover:opacity-70"
      >
        <GearOutline className="size-6" />
      </Link>
    </div>
  );
}

function GearOutline({ className }: { className?: string }) {
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
