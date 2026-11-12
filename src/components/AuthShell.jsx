import { BookOpenCheck, FileSearch, ShieldCheck } from "lucide-react";
import Logo from "./Logo.jsx";

const POINTS = [
  { icon: FileSearch, title: "Ask in plain English", text: "Get answers from your PDFs in seconds." },
  { icon: BookOpenCheck, title: "Answers with sources", text: "Every answer cites the document and page." },
  { icon: ShieldCheck, title: "Private by design", text: "Your documents are visible only to you." },
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-12 lg:flex">
        <Logo inverted />
        <div className="space-y-8">
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-white">
            Chat with your documents and get answers you can verify.
          </h2>
          <ul className="space-y-5">
            {POINTS.map(({ icon: Icon, title: pointTitle, text }) => (
              <li key={pointTitle} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-300">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-medium text-white">{pointTitle}</p>
                  <p className="text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">AI answers can be wrong. Always check the cited source.</p>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
