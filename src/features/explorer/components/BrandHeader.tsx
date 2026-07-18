import Image from "next/image";
import Link from "next/link";
import { COPY } from "../copy";
import { ThemeToggle } from "./ThemeToggle";
import { UniversalSearch } from "./UniversalSearch";

/** Üst merkez: logo + universal search. Figma: logo y≈22, search y:89 (1920 tabanı). */
export function BrandHeader({ initialQuery }: { initialQuery?: string }) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center gap-[18px] pt-[22px]">
      <ThemeToggle />
      <Link href="/" className="pointer-events-auto" aria-label={COPY.brand}>
        <Image
          src="/assets/brand/budlum-logo.svg"
          alt={COPY.brand}
          width={128}
          height={29}
          priority
          unoptimized
        />
      </Link>
      <div className="pointer-events-auto">
        <UniversalSearch initialQuery={initialQuery} />
      </div>
    </header>
  );
}
