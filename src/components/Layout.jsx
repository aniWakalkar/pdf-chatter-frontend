import { FileStack, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "My Documents", icon: FileStack },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const initials = (user?.full_name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="shrink-0">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-slate-900">{user?.full_name}</p>
              <p className="text-xs leading-tight text-slate-500">{user?.email}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
