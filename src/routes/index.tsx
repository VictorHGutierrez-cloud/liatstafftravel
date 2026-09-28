import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hydrate, login, useAppState } from "@/lib/store";
import { ROLE_LABELS, type Role } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · LIAT Staff Travel Tracker" },
      {
        name: "description",
        content: "Pick a seeded LIAT employee and role to demo duty and leisure staff travel workflows.",
      },
      { property: "og:title", content: "Sign in · LIAT Staff Travel Tracker" },
      {
        property: "og:description",
        content: "Pick a seeded LIAT employee and role to demo duty and leisure staff travel workflows.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const state = useAppState();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, []);

  function signIn(userId: string, role: Role) {
    login(userId, role);
    navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-foreground">
        LIAT Staff Travel Tracker — Demo (no Factorial connection)
      </div>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PlaneTakeoff className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">LIAT Staff Travel Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Liat (2020) Limited · VC Bird International Airport, Antigua &amp; Barbuda
            </p>
          </div>
        </div>

        <h2 className="mb-3 font-display text-lg font-semibold">Login as role</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Choose a seeded employee, then the role you want to act as. Demo year {state.year}.
        </p>

        {!ready ? (
          <p className="text-sm text-muted-foreground">Loading seed data…</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {state.employees.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium">{e.name}</p>
                    <span className="text-xs text-muted-foreground">Grade {e.grade}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {e.jobTitle} · {e.department}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.roles.map((r) => (
                      <Button key={r} size="sm" variant="outline" onClick={() => signIn(e.id, r)}>
                        {ROLE_LABELS[r]}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Configured from LIAT Staff Travel Policy v3 concepts for demo tracking.
        </p>
      </div>
    </div>
  );
}
