import { ArrowRight, CheckCircle2, FileStack, Loader, MessageSquare, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PROCESSING_STATUSES, useDocuments } from "../hooks/useDocuments.js";
import { api } from "../services/api.js";
import { formatBytes, formatRelative } from "../utils/format.js";

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const STEPS = [
  { title: "Upload a PDF", text: "Drop one or more text-based PDF files." },
  { title: "Wait for indexing", text: "We extract text, split it into passages and index it." },
  { title: "Ask questions", text: "Get answers with the document name and page number." },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { documents, loading, error } = useDocuments();
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  useEffect(() => {
    api
      .listConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setConversationsLoading(false));
  }, []);

  const ready = documents.filter((d) => d.status === "ready").length;
  const processing = documents.filter((d) => PROCESSING_STATUSES.includes(d.status)).length;
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const isEmpty = !loading && documents.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hello, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">Here is what is happening with your documents.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" /> Upload
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            <MessageSquare className="h-4 w-4" /> New chat
          </Link>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FileStack} label="Documents" value={documents.length} tone="bg-indigo-50 text-indigo-600" />
        <StatCard icon={CheckCircle2} label="Ready" value={ready} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Loader} label="Processing" value={processing} tone="bg-amber-50 text-amber-600" />
        <StatCard
          icon={MessageSquare}
          label="Conversations"
          value={conversations.length}
          tone="bg-sky-50 text-sky-600"
        />
      </div>

      {isEmpty ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Get started in three steps</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{step.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            to="/documents"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Upload your first PDF <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Recent documents"
            action={
              <Link to="/documents" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            }
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-6 w-6 text-indigo-600" />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {documents.slice(0, 5).map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{doc.filename}</p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(doc.size_bytes)}
                        {doc.page_count ? ` · ${doc.page_count} pages` : ""} · {formatRelative(doc.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel
            title="Recent conversations"
            action={
              <Link to="/chat" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Open chat
              </Link>
            }
          >
            {conversationsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-6 w-6 text-indigo-600" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No conversations yet. Ask your first question in Chat.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {conversations.slice(0, 5).map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      to={`/chat/${conversation.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{conversation.title}</p>
                        <p className="text-xs text-slate-500">
                          {conversation.document_ids.length} document
                          {conversation.document_ids.length === 1 ? "" : "s"} · {formatRelative(conversation.updated_at)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
