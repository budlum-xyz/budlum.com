import Image from "next/image";
import Link from "next/link";
import { COPY } from "../../copy";
import { OWN_ACCOUNTS } from "../../queries/fixtures";
import { shortAddress } from "../../utils/format";

/**
 * Hesap değiştirici — Figma: aktif hesap en üstte, altında "Hesap ekle",
 * sonra diğer hesaplar; her satır avatar + ad + kısa adres + ok.
 */
export function AccountSwitcher({ activeId }: { activeId: string }) {
  const active = OWN_ACCOUNTS.find((a) => a.id === activeId) ?? OWN_ACCOUNTS[0];
  const others = OWN_ACCOUNTS.filter((a) => a.id !== active.id);

  return (
    <div className="flex flex-col gap-4 p-8">
      <AccountRow account={active} active />
      <Link
        href="/accounts/new"
        className="w-fit self-start border border-border px-5 py-1 text-base hover:bg-surface"
      >
        {COPY.me.addAccount}
      </Link>
      <ul className="flex flex-col gap-4">
        {others.map((a) => (
          <li key={a.id}>
            <AccountRow account={a} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccountRow({
  account,
  active = false,
}: {
  account: (typeof OWN_ACCOUNTS)[number];
  active?: boolean;
}) {
  return (
    <Link
      href={`/me?account=${account.id}`}
      className="group flex items-center gap-4"
      aria-current={active ? "true" : undefined}
    >
      {account.avatarUrl ? (
        <Image
          src={account.avatarUrl}
          alt=""
          width={64}
          height={64}
          className="shrink-0 border border-border-soft object-cover"
        />
      ) : (
        <span aria-hidden className="size-16 shrink-0 bg-sage" />
      )}
      <span className="flex flex-col leading-tight">
        <span className="text-xl">{account.name}</span>
        <span className="font-data text-base text-sage-dark" title={account.address}>
          {shortAddress(account.address)}
        </span>
      </span>
      <span className="ml-auto text-ink opacity-0 transition-opacity group-hover:opacity-70">
        ›
      </span>
    </Link>
  );
}
