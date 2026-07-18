"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "../copy";

const LINKS = [
  { href: "/transactions", label: COPY.nav.transactions },
  { href: "/market", label: COPY.nav.market },
  { href: "/top-ranks", label: COPY.nav.topRanks },
] as const;

/** Sol-alt dikey navigasyon. Figma: x:90, ilk öğe y:809, 60px aralık, Dosis 24px. */
export function ExplorerNav() {
  const pathname = usePathname();
  return (
    <nav className="absolute bottom-[121px] left-[90px] z-20 flex flex-col gap-[30px]">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-2xl leading-none transition-opacity hover:opacity-70 ${
            pathname === href ? "underline underline-offset-4" : ""
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
