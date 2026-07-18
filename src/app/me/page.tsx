import { notFound } from "next/navigation";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { MeCanvas } from "@/features/explorer/components/me/MeCanvas";
import { MePanel, type MePanelState } from "@/features/explorer/components/me/MePanel";
import { getOwnAccount } from "@/features/explorer/queries/fixtures";

const PANELS: MePanelState[] = ["portfolio", "keys", "tokens", "nfts"];

/** Kendi cüzdanım — Figma "kullanıcı kendi cüzdanını açtı" ekranları + drawer'lar. */
export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; panel?: string }>;
}) {
  const { account: accountId = "you", panel } = await searchParams;
  const account = getOwnAccount(accountId);
  if (!account) notFound();
  const activePanel: MePanelState = PANELS.includes(panel as MePanelState)
    ? (panel as MePanelState)
    : "portfolio";

  return (
    <ExplorerShell
      inspector={<MePanel account={account} panel={activePanel} />}
    >
      <main className="absolute inset-0" aria-label="cüzdanım">
        <MeCanvas />
      </main>
    </ExplorerShell>
  );
}
