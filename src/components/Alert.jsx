import { AlertCircle, X } from "lucide-react";

export default function Alert({ children, onClose, tone = "error" }) {
  const styles = tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${styles}`} role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="rounded p-0.5 opacity-70 hover:opacity-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
