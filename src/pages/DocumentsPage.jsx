import { Eye, FileText, MessageSquare, RotateCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import UploadDropzone from "../components/UploadDropzone.jsx";
import { useDocuments } from "../hooks/useDocuments.js";
import { api, MAX_UPLOAD_MB } from "../services/api.js";
import { formatBytes, formatDate } from "../utils/format.js";

let uploadCounter = 0;

function validateFile(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are accepted.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `File is larger than ${MAX_UPLOAD_MB} MB.`;
  return "";
}

function IconButton({ title, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "text-slate-500 hover:bg-red-50 hover:text-red-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function DocumentsPage() {
  const { documents, setDocuments, loading, error, refresh } = useDocuments();
  const [uploads, setUploads] = useState([]);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const updateUpload = (id, patch) => setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const handleFiles = async (files) => {
    const queued = files.map((file) => ({
      id: ++uploadCounter,
      file,
      name: file.name,
      progress: 0,
      error: validateFile(file),
    }));
    setUploads((prev) => [...queued, ...prev]);
    for (const item of queued) {
      if (item.error) continue;
      try {
        const doc = await api.uploadDocument(item.file, (progress) => updateUpload(item.id, { progress }));
        setUploads((prev) => prev.filter((u) => u.id !== item.id));
        setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
      } catch (err) {
        updateUpload(item.id, { error: err.message });
      }
    }
    refresh();
  };

  const runAction = async (id, action) => {
    setBusyId(id);
    setActionError("");
    try {
      await action();
      await refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (doc) => {
    if (!window.confirm(`Delete "${doc.filename}"? Its indexed content will be removed too.`)) return;
    runAction(doc.id, async () => {
      await api.deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    });
  };

  const handleView = (doc) => api.openDocumentFile(doc.id).catch((err) => setActionError(err.message));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My documents</h1>
        <p className="mt-1 text-sm text-slate-500">Upload PDFs, track processing and manage your library.</p>
      </div>

      <UploadDropzone onFiles={handleFiles} />

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((upload) => (
            <li key={upload.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className={`h-5 w-5 shrink-0 ${upload.error ? "text-red-500" : "text-indigo-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-900">{upload.name}</p>
                    {!upload.error && <span className="text-xs text-slate-500">{upload.progress}%</span>}
                  </div>
                  {upload.error ? (
                    <p className="mt-0.5 text-xs text-red-600">{upload.error}</p>
                  ) : (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${upload.progress}%` }} />
                    </div>
                  )}
                </div>
                {upload.error && (
                  <IconButton title="Dismiss" onClick={() => setUploads((prev) => prev.filter((u) => u.id !== upload.id))}>
                    <X className="h-4 w-4" />
                  </IconButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {(error || actionError) && <Alert onClose={() => setActionError("")}>{actionError || error}</Alert>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Library</h2>
          <span className="text-sm text-slate-500">
            {documents.length} file{documents.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6 text-indigo-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-900">No documents yet</p>
            <p className="mt-1 text-sm text-slate-500">Upload a PDF to start asking questions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="hidden px-5 py-3 md:table-cell">Size</th>
                  <th className="hidden px-5 py-3 md:table-cell">Pages</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Uploaded</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="align-top hover:bg-slate-50/60">
                    <td className="max-w-xs px-5 py-4">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900" title={doc.filename}>
                            {doc.filename}
                          </p>
                          <p className="text-xs text-slate-500 md:hidden">
                            {formatBytes(doc.size_bytes)}
                            {doc.page_count ? ` · ${doc.page_count} pages` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-4 text-slate-600 md:table-cell">
                      {formatBytes(doc.size_bytes)}
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 md:table-cell">{doc.page_count ?? "—"}</td>
                    <td className="hidden whitespace-nowrap px-5 py-4 text-slate-600 lg:table-cell">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={doc.status} />
                      {doc.status === "failed" && doc.error_message && (
                        <p className="mt-1.5 max-w-xs text-xs text-red-600">{doc.error_message}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {busyId === doc.id ? (
                          <Spinner className="m-2 h-4 w-4 text-slate-400" />
                        ) : (
                          <>
                            {doc.status === "ready" && (
                              <Link
                                to={`/chat?doc=${doc.id}`}
                                title="Ask questions"
                                className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Link>
                            )}
                            {doc.status === "failed" && (
                              <IconButton title="Retry processing" onClick={() => runAction(doc.id, () => api.retryDocument(doc.id))}>
                                <RotateCw className="h-4 w-4" />
                              </IconButton>
                            )}
                            <IconButton title="View PDF" onClick={() => handleView(doc)}>
                              <Eye className="h-4 w-4" />
                            </IconButton>
                            <IconButton title="Delete" danger onClick={() => handleDelete(doc)}>
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
