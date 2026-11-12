const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "documind_token";

export const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 20);

let unauthorizedHandler = null;

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      return;
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      return;
    }
  },
};

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function readError(data, status) {
  if (data && typeof data.detail === "string") return data.detail;
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
        const msg = String(item.msg || "").replace(/^Value error, /, "");
        return field && !["body", "query"].includes(field) ? `${field}: ${msg}` : msg;
      })
      .join(". ");
  }
  if (status === 429) return "Too many requests. Please wait a moment.";
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  return `Request failed (${status})`;
}

async function request(path, { method = "GET", body, raw = false } = {}) {
  const token = tokenStore.get();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const init = { method, headers };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running.", 0);
  }

  if (response.status === 401 && token) unauthorizedHandler?.();
  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new ApiError(readError(data, response.status), response.status);
  }
  if (raw) return response;
  if (response.status === 204) return null;
  return response.json();
}

function uploadDocument(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    xhr.open("POST", `${BASE_URL}/api/documents`);
    const token = tokenStore.get();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data);
      if (xhr.status === 401) unauthorizedHandler?.();
      reject(new ApiError(readError(data, xhr.status), xhr.status));
    };
    xhr.onerror = () => reject(new ApiError("Upload failed. Check your connection.", 0));
    xhr.send(form);
  });
}

async function openDocumentFile(documentId, page) {
  const popup = window.open("", "_blank");
  try {
    const response = await request(`/api/documents/${documentId}/file`, { raw: true });
    const blob = await response.blob();
    const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    const target = page ? `${url}#page=${page}` : url;
    if (popup) popup.location.href = target;
    else window.open(target, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  } catch (error) {
    popup?.close();
    throw error;
  }
}

export const api = {
  register: (data) => request("/api/auth/register", { method: "POST", body: data }),
  login: (data) => request("/api/auth/login", { method: "POST", body: data }),
  me: () => request("/api/auth/me"),

  listDocuments: () => request("/api/documents"),
  getDocument: (id) => request(`/api/documents/${id}`),
  deleteDocument: (id) => request(`/api/documents/${id}`, { method: "DELETE" }),
  retryDocument: (id) => request(`/api/documents/${id}/retry`, { method: "POST" }),
  uploadDocument,
  openDocumentFile,

  listConversations: () => request("/api/conversations"),
  getConversation: (id) => request(`/api/conversations/${id}`),
  deleteConversation: (id) => request(`/api/conversations/${id}`, { method: "DELETE" }),
  listMessages: (id) => request(`/api/conversations/${id}/messages`),
  sendChat: (data) => request("/api/chat", { method: "POST", body: data }),
};
