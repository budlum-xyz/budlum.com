import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { TransactionsView } from "@/features/explorer/components/TransactionsView";
import { getTransactions } from "@/features/explorer/queries";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string; counterparty?: string; page?: string }>;
}) {
  const { address, counterparty, page } = await searchParams;
  const data = await getTransactions({
    address,
    counterparty,
    page: page ? Number.parseInt(page, 10) || 0 : 0,
  });

  return (
    <ExplorerShell hideNav>
      <main className="absolute inset-0" aria-label="işlemler">
        <TransactionsView
          data={data}
          filterAddress={address}
          filterCounterparty={counterparty}
        />
      </main>
    </ExplorerShell>
  );
}
