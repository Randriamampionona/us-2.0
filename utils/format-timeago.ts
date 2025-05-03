import { formatDistanceToNowStrict, format } from "date-fns";

export const formatTimeAgo = (
  timestamp: { seconds: number; nanoseconds: number } | null | undefined,
  isEdited: boolean = false
) => {
  if (!timestamp || !timestamp.seconds) return "Just now";

  const prefix = isEdited ? "Edit" : "Sent";

  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  if (diffInMs < twentyFourHoursInMs) {
    return `${prefix} ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
  }

  // Format like "April 29, 2025 | 08:45"
  return `${isEdited ? "Edit on " : ""} ${format(
    date,
    "MMMM d, yyyy | hh:mm a"
  )}`;
};
