import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  BarChart3,
  Briefcase,
  Home,
  Inbox,
  LogOut,
  Menu,
  Palmtree,
  PlaneTakeoff,
  Settings,
  Ticket,
  Users,
  Wallet,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hydrate, logout, useSession } from "@/lib/store";
import { ROLE_LABELS, type Role } from "@/lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/my-requests", label: "My Requests", icon: Briefcase },
  { to: "/dependants", label: "Dependants", icon: Users },
  { to: "/approvals", label: "Approvals Inbox", icon: Inbox, roles: ["manager", "officer", "hr", "finance"] },
  { to: "/travel-desk", label: "Travel Desk", icon: Ticket, roles: ["traveldesk"] },
  { to: "/commercial", label: "Standby Board", icon: PlaneTakeoff, roles: ["commercial"] },
  { to: "/hr", label: "HR Console", icon: BadgeCheck, roles: ["hr"] },
  { to: "/finance", label: "Finance Console", icon: Wallet, roles: ["finance"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["hr", "finance", "admin", "officer"] },
  { to: "/admin", label: "Admin", icon: Settings, roles: ["admin"] },
  { to: "/how-to-demo", label: "How to demo", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
  }, [ready, user, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready || !user || !role) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const items = NAV.filter((n) => !n.roles || n.roles.includes(role));

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-foreground">
        LIAT Staff Travel Tracker — Demo (no Factorial connection)
      </div>
      <div className="flex min-h-[calc(100vh-30px)]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto bg-sidebar px-3 py-4 text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Link to="/home" className="mb-6 flex items-center gap-2 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <PlaneTakeoff className="h-5 w-5" />
            </span>
            <span className="font-display text-sm leading-tight font-semibold">
              LIAT Staff Travel
              <span className="block text-[11px] font-normal opacity-70">Tracker &amp; Ledger</span>
            </span>
          </Link>
          <nav className="space-y-0.5">
            {items.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 space-y-2 rounded-lg bg-sidebar-accent p-3 text-xs">
            <div className="flex items-center gap-2">
              <Palmtree className="h-4 w-4 opacity-70" />
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="opacity-70">{ROLE_LABELS[role]}</div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Switch user
            </Button>
          </div>
        </aside>

        {open && (
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1">
          <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
            <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
            <span className="font-display font-semibold">LIAT Staff Travel</span>
          </header>
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</div>
          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground lg:px-8">
            Configured from LIAT Staff Travel Policy v3 concepts for demo tracking.
          </footer>
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
