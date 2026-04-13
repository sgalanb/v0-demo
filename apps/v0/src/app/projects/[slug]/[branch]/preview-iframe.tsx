"use client"

import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from "@/components/ai/web-preview"
import { Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { heartbeatSandbox } from "./actions"

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes
const POLL_INTERVAL_MS = 500

export function PreviewIFrame({ name, src }: { name: string; src: string }) {
  const [ready, setReady] = useState(false)

  // Poll the sandbox URL until the dev server is responding
  useEffect(() => {
    const controller = new AbortController()

    async function poll() {
      while (!controller.signal.aborted) {
        try {
          await fetch(src, { mode: "no-cors", signal: controller.signal })
          setReady(true)
          return
        } catch {
          if (controller.signal.aborted) {
            return
          }
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      }
    }

    poll()

    return () => controller.abort()
  }, [src])

  // add 2 minutes to the sandbox timeout every 2 minutes
  // the default timeout is 5 minutes so it supports 1 retry
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    const beat = () => {
      heartbeatSandbox(name).catch(() => {
        // ignore error, will retry on next interval
      })
    }

    const start = () => {
      if (intervalId !== null) {
        return
      }

      beat()
      intervalId = setInterval(beat, HEARTBEAT_INTERVAL_MS)
    }

    const stop = () => {
      if (intervalId === null) {
        return
      }

      clearInterval(intervalId)
      intervalId = null
    }

    if (!document.hidden) {
      start()
    }

    // only beat if tab is visible
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop()
      } else {
        start()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      stop()
    }
  }, [name])

  return (
    <div className="mb-4 flex w-full flex-1 flex-col">
      {ready ? (
        <WebPreview defaultUrl={src}>
          <WebPreviewNavigation>
            <WebPreviewUrl />
          </WebPreviewNavigation>
          <WebPreviewBody src={src} />
        </WebPreview>
      ) : (
        <div className="flex w-full flex-1 items-center justify-center text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Loader2Icon className="animate-spin" />
            <span>Loading preview</span>
          </div>
        </div>
      )}
    </div>
  )
}
