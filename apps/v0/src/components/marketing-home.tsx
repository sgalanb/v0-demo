import type { ReactNode } from "react";

/**
 * Single place to edit marketing / landing content. Used by `/` (signed out) and `/home`.
 */
export function MarketingHome({
  landingExtra,
}: {
  /** Shown only on `/` (signed out), e.g. Get started. `/home` omits this. */
  landingExtra?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      {/* Shared marketing — add hero, sections, etc. here once */}
      {landingExtra}
    </main>
  );
}
