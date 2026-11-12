import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import AuthShell from "../components/AuthShell.jsx";
import FormField from "../components/FormField.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function validate({ fullName, password, confirm }) {
  if (!fullName.trim()) return "Please enter your name.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return "Password must contain a letter and a number.";
  if (password !== confirm) return "Passwords do not match.";
  return "";
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const problem = validate(form);
    if (problem) return setError(problem);
    setError("");
    setSubmitting(true);
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password);
      navigate("/documents", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Upload PDFs and start asking questions in minutes.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <FormField label="Full name" autoComplete="name" required value={form.fullName} onChange={update("fullName")} />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={update("password")}
          hint="At least 8 characters, including a letter and a number."
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={update("confirm")}
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting && <Spinner />}
          Create account
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
