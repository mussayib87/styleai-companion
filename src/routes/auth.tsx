import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
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
      {
        name: "description",
        content:
          "Sign in or create your StyleAI account to plan outfits, scan your wardrobe and chat with your AI stylist.",
      },
      { property: "og:title", content: "Sign in — StyleAI" },
      {
        property: "og:description",
        content: "Sign in or create your StyleAI account to plan outfits with an AI stylist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const schema = z.object({
  displayName: z.string().trim().max(60, "Keep it under 60 characters").optional(),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

function messageFor(raw: string) {
  const m = raw.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That email already has an account. Try signing in instead.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  return raw;
}

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<Mode>("signin");
  const [sentTo, setSentTo] = useState<{ kind: "confirm" | "reset"; email: string } | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: { displayName: "", email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setSentTo(null);
    clearErrors();
  }

  async function onSubmit(values: FormValues) {
    const shape =
      mode === "forgot"
        ? schema.pick({ email: true })
        : mode === "signup"
          ? schema
          : schema.pick({ email: true, password: true });
    const parsed = shape.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof FormValues, { message: issue.message });
      }
      return;
    }

    const email = values.email.trim();

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(messageFor(error.message));
        return;
      }
      setSentTo({ kind: "reset", email });
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: values.password,
      });
      if (error) {
        const msg = messageFor(error.message);
        setError("password", { message: msg });
        toast.error(msg);
        return;
      }
      navigate({ to: "/", replace: true });
      return;
    }

    const displayName = values.displayName?.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        ...(displayName ? { data: { display_name: displayName } } : {}),
      },
    });
    if (error) {
      const msg = messageFor(error.message);
      setError("email", { message: msg });
      toast.error(msg);
      return;
    }
    if (data.session) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setSentTo({ kind: "confirm", email });
  }

  async function resend() {
    const email = sentTo?.email ?? getValues("email");
    if (!email) return;
    if (sentTo?.kind === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      error ? toast.error(messageFor(error.message)) : toast.success("Reset link sent again.");
      return;
    }
    const { error } = await supabase.auth.resend({ type: "signup", email });
    error ? toast.error(messageFor(error.message)) : toast.success("Confirmation email sent again.");
  }

  if (sentTo) {
    return (
      <div className="grid min-h-screen place-items-center px-5 py-10">
        <div className="surface-card w-full max-w-sm rounded-3xl p-7 text-center">
          <div className="ai-gradient mx-auto grid size-12 place-items-center rounded-2xl">
            <MailCheck className="size-5 text-primary-foreground" />
          </div>
          <h1 className="mt-5 font-display text-xl font-semibold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sentTo.kind === "confirm"
              ? "We sent a confirmation link to "
              : "We sent a password reset link to "}
            <span className="text-foreground">{sentTo.email}</span>.
          </p>
          <Button variant="secondary" className="mt-5 w-full" onClick={resend}>
            Resend email
          </Button>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-semibold">
          {mode === "signin"
            ? "Welcome back"
            : mode === "signup"
              ? "Create your account"
              : "Reset your password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "forgot"
            ? "We'll email you a secure link to choose a new password."
            : "Your AI stylist, wardrobe and weekly outfit planner."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                autoComplete="name"
                placeholder="Ava Chen"
                aria-invalid={!!errors.displayName}
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="text-xs text-destructive">{errors.displayName.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : (
                mode === "signup" && (
                  <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                )
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
          {mode === "forgot" && (
            <div>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
