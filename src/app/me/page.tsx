import { notFound } from "next/navigation";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { MeCanvas } from "@/features/explorer/components/me/MeCanvas";
import { MePanel } from "@/features/explorer/components/me/MePanel";
import { getOwnAccount } from "@/features/explorer/queries/fixtures";

/** Kendi cüzdanım — Figma "kullanıcı kendi cüzdanını açtı" ekranları. */
export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; panel?: string }>;
}) {
  const { account: accountId = "you", panel } = await searchParams;
  const account = getOwnAccount(accountId);
  if (!account) notFound();

  return (
    <ExplorerShell
      inspector={<MePanel account={account} panel={panel === "keys" ? "keys" : "portfolio"} />}
    >
      <main className="absolute inset-0" aria-label="cüzdanım">
        <MeCanvas />
      </main>
    </ExplorerShell>
  );
}
