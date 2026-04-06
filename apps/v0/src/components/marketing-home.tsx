import type { ReactNode } from "react";

export function MarketingHome({
  landingExtra,
}: {
  /** Shown only on `/` (signed out), e.g. Get started. `/home` omits this. */
  landingExtra?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <div>{landingExtra}</div>
      <p>v0.app</p>
    </main>
  );
}
