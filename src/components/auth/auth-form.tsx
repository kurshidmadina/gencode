"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { DemoLoginButtons } from "@/components/demo/demo-login-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? email),
      password: String(formData.get("password") ?? password),
      redirect: false
    });
    setLoading(false);

    if (result?.ok) {
      toast.success("Arena access granted.");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.error("Login failed. Check your credentials or start the database.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter the Arena</CardTitle>
        <CardDescription>Restore your training deck, streak state, Genie memory, and operator profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Email
            <Input name="email" type="email" placeholder="demo@gencode.dev" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Password
            <Input name="password" type="password" placeholder="Local demo password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <div className="grid gap-2 rounded-md border border-cyan-300/15 bg-cyan-300/8 p-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Local demo access
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Use these seeded local accounts when walking through the investor demo flow.
            </p>
            <div className="grid gap-1 rounded-md border border-white/10 bg-black/20 p-2 font-mono text-xs text-slate-300">
              <span>User: demo@gencode.dev / GencodeDemo!2026</span>
              <span>Admin: admin@gencode.dev / GencodeAdmin!2026</span>
            </div>
            <DemoLoginButtons />
          </div>
          <Button disabled={loading} type="submit">
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Checking access..." : "Enter Arena"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name")),
        username: String(formData.get("username")),
        email: String(formData.get("email")),
        password: String(formData.get("password"))
      })
    });
    setLoading(false);

    if (response.ok) {
      const result = await signIn("credentials", {
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        redirect: false
      });
      if (result?.ok) {
        toast.success("Profile created. Calibration is next.");
        router.push("/onboarding/calibration");
        router.refresh();
        return;
      }
      toast.success("Profile created. Login to start calibration.");
      router.push("/login");
      return;
    }

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    toast.error(data?.error ?? "Could not create account.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Operator Profile</CardTitle>
        <CardDescription>Your RPG identity for technical mastery: XP, coins, badges, paths, and mentor history.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Name
            <Input name="name" placeholder="Ada Lovelace" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Username
            <Input name="username" placeholder="ada_codes" required minLength={3} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Email
            <Input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Password
            <Input name="password" type="password" required minLength={8} />
          </label>
          <Button disabled={loading} type="submit">
            {loading ? "Forging profile..." : "Start Training"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function LogoutButton() {
  return (
    <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
