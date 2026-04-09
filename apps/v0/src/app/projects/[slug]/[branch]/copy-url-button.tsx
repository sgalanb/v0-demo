"use client"

import { Button } from "@workspace/ui/components/button"
import { Check, Link } from "lucide-react"
import { useCallback, useState } from "react"

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  return (
    <Button size="icon" variant="outline" onClick={handleCopy}>
      {copied ? <Check /> : <Link />}
    </Button>
  )
}
