import { Check, ChevronDown, Copy, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { formatTime } from "../utils/format.js";

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
  );
}

function uniqueCitations(citations) {
  const seen = new Set();
  return citations.filter((c) => {
    const key = `${c.document_id || c.filename}-${c.page_number}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MessageBubble({ message, onOpenCitation }) {
  const [copied, setCopied] = useState(false);
  const [showExcerpts, setShowExcerpts] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const citations = uniqueCitations(message.citations || []);
  const notFound = citations.length === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 max-w-[85%]">
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl rounded-tl-md border px-4 py-3 text-sm leading-relaxed shadow-sm ${
            notFound ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          {renderInline(message.content)}
        </div>

        {citations.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Sources:</span>
            {citations.map((citation) => (
              <button
                key={`${citation.document_id || citation.filename}-${citation.page_number}`}
                type="button"
                disabled={!citation.document_id}
                onClick={() => onOpenCitation(citation)}
                title={citation.document_id ? citation.snippet : "This document has been deleted"}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span className="truncate">{citation.filename}</span>
                <span className="shrink-0 text-slate-400">· Page {citation.page_number}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowExcerpts((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showExcerpts ? "Hide" : "Show"} excerpts
              <ChevronDown className={`h-3.5 w-3.5 transition ${showExcerpts ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}

        {showExcerpts && (
          <div className="mt-2 space-y-2">
            {(message.citations || []).map((citation, index) => (
              <blockquote
                key={`${citation.chunk_id || index}`}
                className="rounded-lg border-l-4 border-indigo-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600"
              >
                <p className="mb-1 font-medium text-slate-700">
                  {citation.filename} · Page {citation.page_number}
                </p>
                {citation.snippet}
                {citation.snippet.length >= 400 ? "…" : ""}
              </blockquote>
            ))}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
          <span>AI-generated · {formatTime(message.created_at)}</span>
          <button type="button" onClick={copy} className="inline-flex items-center gap-1 hover:text-slate-700">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
