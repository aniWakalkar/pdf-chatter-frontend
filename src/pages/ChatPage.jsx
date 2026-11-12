import { FileText, Menu, MessageSquare, Plus, SendHorizonal, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import Spinner from "../components/Spinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useDocuments } from "../hooks/useDocuments.js";
import { api } from "../services/api.js";
import { formatRelative } from "../utils/format.js";

const SUGGESTIONS = [
  "Summarize the key points of this document.",
  "What are the important dates or deadlines?",
  "List the main rules or requirements.",
  "What does the document say about responsibilities?",
];

const PHASE_TEXT = {
  searching: "Searching your documents…",
  preparing: "Preparing answer…",
};

export default function ChatPage() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents, loading: documentsLoading } = useDocuments();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const skipLoadRef = useRef(null);
  const selectionReadyRef = useRef(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    api
      .listConversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    setError("");
    setSidebarOpen(false);
    if (!conversationId) {
      setMessages([]);
      selectionReadyRef.current = false;
      return undefined;
    }
    if (skipLoadRef.current === conversationId) {
      skipLoadRef.current = null;
      return undefined;
    }
    let cancelled = false;
    setLoadingMessages(true);
    Promise.all([api.getConversation(conversationId), api.listMessages(conversationId)])
      .then(([conversation, history]) => {
        if (cancelled) return;
        setMessages(history);
        setSelectedIds(conversation.document_ids);
        selectionReadyRef.current = true;
      })
      .catch((err) => {
        if (cancelled) return;
        setMessages([]);
        setError(err.status === 404 ? "This conversation no longer exists." : err.message);
      })
      .finally(() => !cancelled && setLoadingMessages(false));
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (conversationId || selectionReadyRef.current || documents.length === 0) return;
    const preferred = searchParams.get("doc");
    const ids =
      preferred && documents.some((d) => d.id === preferred)
        ? [preferred]
        : documents.filter((d) => d.status === "ready").map((d) => d.id);
    if (ids.length) {
      setSelectedIds(ids);
      selectionReadyRef.current = true;
    }
  }, [conversationId, documents, searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const existingSelected = selectedIds.filter((id) => documents.some((d) => d.id === id));
  const readySelected = existingSelected.filter((id) => documents.find((d) => d.id === id)?.status === "ready");
  const canSend = !sending && readySelected.length > 0;

  const toggleDocument = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;
    if (readySelected.length === 0) {
      setError("Select at least one ready document to ask a question.");
      return;
    }
    setError("");
    setSending(true);
    setPhase("searching");
    setInput("");
    requestAnimationFrame(resizeTextarea);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: question, created_at: new Date().toISOString(), citations: [] },
    ]);
    const timer = setTimeout(() => setPhase("preparing"), 1500);

    try {
      const result = await api.sendChat({
        conversation_id: conversationId || null,
        document_ids: existingSelected,
        question,
      });
      setMessages((prev) => [...prev.filter((m) => m.id !== tempId), result.user_message, result.assistant_message]);
      setConversations((prev) => [result.conversation, ...prev.filter((c) => c.id !== result.conversation.id)]);
      if (!conversationId) {
        skipLoadRef.current = result.conversation.id;
        navigate(`/chat/${result.conversation.id}`, { replace: true });
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(question);
      setError(err.message);
    } finally {
      clearTimeout(timer);
      setSending(false);
      setPhase("");
      textareaRef.current?.focus();
    }
  };

  const removeConversation = async (conversation) => {
    if (!window.confirm(`Delete "${conversation.title}"?`)) return;
    try {
      await api.deleteConversation(conversation.id);
      setConversations((prev) => prev.filter((c) => c.id !== conversation.id));
      if (conversation.id === conversationId) navigate("/chat");
    } catch (err) {
      setError(err.message);
    }
  };

  const openCitation = (citation) =>
    api.openDocumentFile(citation.document_id, citation.page_number).catch((err) => setError(err.message));

  const activeTitle = conversations.find((c) => c.id === conversationId)?.title || "New conversation";

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`absolute inset-y-0 left-0 z-30 flex w-80 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 p-4">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin max-h-[45%] overflow-y-auto border-b border-slate-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</h3>
            <span className="text-xs text-slate-400">{readySelected.length} selected</span>
          </div>
          {documentsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-5 w-5 text-indigo-600" />
            </div>
          ) : documents.length === 0 ? (
            <Link to="/documents" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500">
              <Upload className="h-4 w-4" /> Upload a PDF first
            </Link>
          ) : (
            <ul className="space-y-1">
              {documents.map((doc) => {
                const ready = doc.status === "ready";
                return (
                  <li key={doc.id}>
                    <label
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                        ready ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!ready}
                        checked={ready && selectedIds.includes(doc.id)}
                        onChange={() => toggleDocument(doc.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                      />
                      <span className="min-w-0 flex-1 truncate text-slate-700" title={doc.filename}>
                        {doc.filename}
                      </span>
                      {!ready && <StatusBadge status={doc.status} />}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">History</h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-400">Your conversations will appear here.</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="group relative">
                  <Link
                    to={`/chat/${conversation.id}`}
                    className={`block rounded-lg px-3 py-2 pr-9 ${
                      conversation.id === conversationId ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{conversation.title}</p>
                    <p className="text-xs text-slate-400">{formatRelative(conversation.updated_at)}</p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeConversation(conversation)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-slate-900">{activeTitle}</h1>
            <p className="truncate text-xs text-slate-500">
              {readySelected.length
                ? `Searching ${readySelected.length} document${readySelected.length === 1 ? "" : "s"}`
                : "No documents selected"}
            </p>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
            {loadingMessages ? (
              <div className="flex justify-center py-20">
                <Spinner className="h-6 w-6 text-indigo-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <MessageSquare className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Ask a question about your documents</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Answers come only from the selected PDFs and include the source page so you can verify them.
                </p>
                {documents.length === 0 && !documentsLoading ? (
                  <Link
                    to="/documents"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    <Upload className="h-4 w-4" /> Upload a PDF
                  </Link>
                ) : (
                  <div className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={!canSend}
                        onClick={() => send(suggestion)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} onOpenCitation={openCitation} />
              ))
            )}

            {sending && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Spinner className="h-4 w-4" />
                </span>
                {PHASE_TEXT[phase] || PHASE_TEXT.searching}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-3">
            {error && <Alert onClose={() => setError("")}>{error}</Alert>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                maxLength={2000}
                onChange={(e) => {
                  setInput(e.target.value);
                  resizeTextarea();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={readySelected.length ? "Ask a question about your documents…" : "Select a ready document to start"}
                className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!canSend || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send"
              >
                {sending ? <Spinner /> : <SendHorizonal className="h-4 w-4" />}
              </button>
            </form>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              Answers are AI-generated from your documents. Check the cited page before relying on them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
