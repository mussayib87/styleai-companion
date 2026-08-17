import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/styleai/use-session";
import { Logo } from "@/components/styleai/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — StyleAI" },
      { name: "description", content: "Sign in to StyleAI, your AI personal stylist." },
      { property: "og:title", content: "Sign in — StyleAI" },
      { property: "og:description", content: "Sign in to StyleAI, your AI personal stylist." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup" | "verify">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (!error) {
        navigate({ to: "/", replace: true });
        return;
      }
      if (/confirm/i.test(error.message)) {
        setMode("verify");
        return;
      }
      toast.error(error.message);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/", replace: true });
    } else {
      setMode("verify");
      setCooldown(30);
    }
  }

  async function resend() {
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCooldown(30);
    toast.success(`Verification email sent again to ${email}.`);
  }

  if (mode === "verify") {
    return (
      <div className="grid min-h-screen place-items-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="ai-gradient mt-8 grid size-12 place-items-center rounded-2xl text-primary-foreground">
            <MailCheck className="size-6" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Verify your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Open it to activate your
            account.
          </p>
          <div className="surface-card mt-5 rounded-2xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Why can't I get in yet?</p>
            <p className="mt-1.5">
              Your account exists, but StyleAI can't start a session until the email is confirmed —
              so your wardrobe, planner and stylist stay locked. Confirming the link signs you in and
              opens the dashboard.
            </p>
          </div>
          <div className="mt-5 space-y-3">
            <Button className="w-full" onClick={resend} disabled={busy || cooldown > 0}>
              <RefreshCw className="size-4" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setMode("signin");
                setPassword("");
              }}
            >
              I've confirmed — sign in
            </Button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setEmail("");
                setPassword("");
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Use a different email
            </button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Nothing in your inbox? Check spam, and make sure the address above is spelled correctly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI stylist, wardrobe and weekly outfit planner.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
