import type { ReactNode } from "react"

export function MarketingHome({
  landingExtra,
}: {
  /** Shown only on `/` (signed out), e.g. Get started. `/home` omits this. */
  landingExtra?: ReactNode
}) {
  return (
    <main className="flex h-screen flex-1 flex-col items-center justify-center">
      <div>{landingExtra}</div>
    </main>
  )
}
