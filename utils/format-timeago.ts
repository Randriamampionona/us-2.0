import { formatDistanceToNowStrict, format } from "date-fns";

export const formatTimeAgo = (
  timestamp: { seconds: number; nanoseconds: number } | null | undefined
) => {
  if (!timestamp || !timestamp.seconds) return "Just now";

  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  if (diffInMs < twentyFourHoursInMs) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }

  // Show formatted date like "April 29, 2025"
  return `on ${format(date, "MMMM d, yyyy")}`;
};
