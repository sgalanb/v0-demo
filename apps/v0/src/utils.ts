import { formatDistanceStrict, formatDistanceToNowStrict } from "date-fns"

export function formatRelativeTime(
  date: Date | number,
  now?: Date | number,
): string {
  if (now !== undefined) {
    return formatDistanceStrict(date, now, { addSuffix: true })
  }
  return formatDistanceToNowStrict(date, { addSuffix: true })
}
