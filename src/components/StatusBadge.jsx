import { AlertCircle, CheckCircle2 } from "lucide-react";
import Spinner from "./Spinner.jsx";

const STATUS = {
  uploaded: { label: "Uploaded", className: "bg-slate-100 text-slate-700", spinning: true },
  extracting: { label: "Extracting text", className: "bg-amber-50 text-amber-700", spinning: true },
  indexing: { label: "Indexing", className: "bg-blue-50 text-blue-700", spinning: true },
  ready: { label: "Ready", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700" },
};

export default function StatusBadge({ status }) {
  const config = STATUS[status] || STATUS.uploaded;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.spinning && <Spinner className="h-3 w-3" />}
      {status === "ready" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "failed" && <AlertCircle className="h-3.5 w-3.5" />}
      {config.label}
    </span>
  );
}
