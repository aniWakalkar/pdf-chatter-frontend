import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";

export const PROCESSING_STATUSES = ["uploaded", "extracting", "indexing"];

export function useDocuments({ pollMs = 3000 } = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await api.listDocuments();
      setDocuments(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasProcessing = documents.some((d) => PROCESSING_STATUSES.includes(d.status));

  useEffect(() => {
    if (!hasProcessing) return undefined;
    const timer = setInterval(refresh, pollMs);
    return () => clearInterval(timer);
  }, [hasProcessing, pollMs, refresh]);

  return { documents, setDocuments, loading, error, refresh };
}
