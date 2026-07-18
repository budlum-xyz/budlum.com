import type { ReactNode } from "react";

/**
 * Onboarding ekranları tasarım gereği HEP koyu açılır (kullanıcı kararı);
 * data-theme sarmalayıcıda zorlanır, global toggle'ı etkilemez.
 */
export default function WalletLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="dark" className="themed-surface fixed inset-0">
      {children}
    </div>
  );
}
