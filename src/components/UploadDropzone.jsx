import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { MAX_UPLOAD_MB } from "../services/api.js";

export default function UploadDropzone({ onFiles, disabled = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <UploadCloud className="h-6 w-6" />
      </span>
      <p className="text-base font-semibold text-slate-900">Upload your PDF documents</p>
      <p className="mt-1 text-sm text-slate-500">Drag and drop files here or click to browse</p>
      <span className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
        Choose PDFs
      </span>
      <p className="mt-3 text-xs text-slate-400">PDF only · up to {MAX_UPLOAD_MB} MB per file · text-based PDFs</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
