import Link from "next/link";
import { COPY } from "../copy";
import { BudlumLogo } from "./BudlumLogo";
import { ThemeToggle } from "./ThemeToggle";
import { UniversalSearch } from "./UniversalSearch";

/** Üst merkez: logo + universal search. Figma: logo y≈22, search y:89 (1920 tabanı). */
export function BrandHeader({ initialQuery }: { initialQuery?: string }) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center gap-[18px] pt-[22px]">
      <ThemeToggle />
      <Link href="/" className="pointer-events-auto text-ink" aria-label={COPY.brand}>
        <BudlumLogo className="h-[29px] w-[128px]" />
      </Link>
      <div className="pointer-events-auto">
        <UniversalSearch initialQuery={initialQuery} />
      </div>
    </header>
  );
}
