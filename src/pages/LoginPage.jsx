import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import AuthShell from "../components/AuthShell.jsx";
import FormField from "../components/FormField.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to your documents.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting && <Spinner />}
          Sign in
        </button>
        <p className="text-center text-sm text-slate-500">
          New to DocuMind?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
