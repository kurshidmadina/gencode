"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const demoAccounts = {
  user: {
    email: "demo@gencode.dev",
    password: "GencodeDemo!2026",
    label: "Enter User Demo",
    icon: KeyRound
  },
  admin: {
    email: "admin@gencode.dev",
    password: "GencodeAdmin!2026",
    label: "Enter Admin Demo",
    icon: ShieldCheck
  }
};

export function DemoLoginButtons({ className, compact = false }: { className?: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"user" | "admin" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/admin");
    setReady(true);
  }, [router]);

  async function login(kind: "user" | "admin") {
    const account = demoAccounts[kind];
    setLoading(kind);
    const result = await signIn("credentials", {
      email: account.email,
      password: account.password,
      redirect: false
    });
    setLoading(null);

    if (!result?.ok) {
      toast.error("Demo login failed. Run npm run db:seed:demo and make sure Postgres is running.");
      return;
    }

    toast.success(kind === "admin" ? "Admin demo loaded." : "Demo operator loaded.");
    router.push(kind === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className={className ?? "grid gap-2 sm:grid-cols-2"}>
      {(["user", "admin"] as const).map((kind) => {
        const account = demoAccounts[kind];
        const Icon = account.icon;
        return (
          <Button
            key={kind}
            type="button"
            variant={kind === "admin" ? "secondary" : "gold"}
            onClick={() => login(kind)}
            disabled={!ready || loading !== null}
          >
            <Icon className="h-4 w-4" />
            {!ready ? "Arming demo..." : loading === kind ? "Loading..." : compact ? account.label.replace("Enter ", "") : account.label}
          </Button>
        );
      })}
    </div>
  );
}
