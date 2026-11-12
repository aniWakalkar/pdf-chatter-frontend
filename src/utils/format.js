export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatRelative(value) {
  if (!value) return "";
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value);
}

export function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
