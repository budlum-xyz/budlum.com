import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { AccountSwitcher } from "@/features/explorer/components/me/AccountSwitcher";
import { MeCanvas } from "@/features/explorer/components/me/MeCanvas";

/** Hesap değiştirici — dişli ikonundan gelinir. */
export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ active?: string }>;
}) {
  const { active = "you" } = await searchParams;
  return (
    <ExplorerShell inspector={<AccountSwitcher activeId={active} />}>
      <main className="absolute inset-0" aria-label="hesaplar">
        <MeCanvas />
      </main>
    </ExplorerShell>
  );
}
