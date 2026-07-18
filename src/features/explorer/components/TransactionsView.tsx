import Link from "next/link";
import { COPY } from "../copy";
import type { TransactionPage } from "../types";
import { formatTxTime, shortAddress } from "../utils/format";
import { Sparkle, TransferArrow } from "./glyphs";

/**
 * İşlem tablosu — Figma 3099:1056. 7 kolon, sticky header,
 * adres filtresi breadcrumb'ı, block göstergesi + sayfalama.
 */
export function TransactionsView({
  data,
  filterAddress,
  filterCounterparty,
}: {
  data: TransactionPage;
  filterAddress?: string;
  filterCounterparty?: string;
}) {
  const { items, block, page, totalPages } = data;
  const qs = (p: number) => {
    const params = new URLSearchParams();
    if (filterAddress) params.set("address", filterAddress);
    if (filterCounterparty) params.set("counterparty", filterCounterparty);
    if (p > 0) params.set("page", String(p));
    const s = params.toString();
    return s ? `/transactions?${s}` : "/transactions";
  };
  const c = COPY.transactions.columns;

  return (
    <div className="flex h-full flex-col px-[12.5vw] pt-[160px]">
      {/* Başlık + block/sayfalama */}
      <div className="flex items-center gap-3">
        <Sparkle filled className="size-6 text-sage" />
        <h1 className="text-2xl">{COPY.transactions.title}</h1>
        <span className="ml-4 flex items-center gap-2 font-data text-base text-ink">
          {COPY.transactions.block(block)}
          <Link
            href={qs(Math.max(0, page - 1))}
            aria-label="önceki sayfa"
            aria-disabled={page === 0}
            className={page === 0 ? "pointer-events-none opacity-30" : "hover:opacity-70"}
          >
            ‹
          </Link>
          <span className="font-data text-sm text-muted">
            {page + 1}/{totalPages}
          </span>
          <Link
            href={qs(Math.min(totalPages - 1, page + 1))}
            aria-label="sonraki sayfa"
            aria-disabled={page >= totalPages - 1}
            className={page >= totalPages - 1 ? "pointer-events-none opacity-30" : "hover:opacity-70"}
          >
            ›
          </Link>
        </span>
      </div>

      {/* Adres filtresi breadcrumb'ı — transferleri aç'tan gelindiyse */}
      {filterAddress ? (
        <div className="mt-4 flex gap-10 font-data text-lg">
          <span title={filterAddress}>{shortAddress(filterAddress)}</span>
          {filterCounterparty ? (
            <span title={filterCounterparty}>{shortAddress(filterCounterparty)}</span>
          ) : null}
        </div>
      ) : null}

      {/* Tablo */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-8">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border text-left text-base font-normal">
              {[c.signature, c.time, c.instructions, c.by, c.value, c.fee, c.smartContracts].map(
                (h) => (
                  <th key={h} className="bg-canvas py-3 pr-4 font-normal first:pl-9">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-muted">
                  {COPY.states.empty}
                </td>
              </tr>
            ) : (
              items.map((tx, i) => (
                <tr key={`${tx.signature}-${i}`} className="font-data text-base">
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`size-6 shrink-0 border border-border-soft ${
                          tx.variant === "purple" ? "bg-token-purple" : "bg-sage"
                        }`}
                      />
                      <span className="max-w-44 truncate text-sage-dark" title={tx.signature}>
                        {tx.signature}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4">{formatTxTime(tx.time)}</td>
                  <td className="py-3 pr-4 font-ui">{tx.instruction}</td>
                  <td className="py-3 pr-4" title={tx.by}>
                    {shortAddress(tx.by)}
                  </td>
                  <td className="py-3 pr-4">{tx.value}</td>
                  <td className="py-3 pr-4">{tx.fee}</td>
                  <td className="py-3">
                    {tx.contract ? <TransferArrow className="size-5 text-sage" /> : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
