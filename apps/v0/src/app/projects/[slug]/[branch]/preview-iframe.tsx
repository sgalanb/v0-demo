"use client"

import { useEffect } from "react"
import { heartbeatSandbox } from "./actions"

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export function PreviewIFrame({ name, src }: { name: string; src: string }) {
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
    <div className="flex w-full flex-1 flex-col bg-v0-blue-900 p-4">
      <iframe
        className="block w-full flex-1 border-0"
        src={src}
        title="Preview"
      />
    </div>
  )
}
