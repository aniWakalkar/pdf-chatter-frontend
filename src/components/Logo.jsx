import { FileText } from "lucide-react";

export default function Logo({ inverted = false }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <FileText className="h-4.5 w-4.5" />
      </span>
      <span className={`text-lg font-semibold tracking-tight ${inverted ? "text-white" : "text-slate-900"}`}>
        DocuMind <span className={inverted ? "text-indigo-300" : "text-indigo-600"}>AI</span>
      </span>
    </div>
  );
}
