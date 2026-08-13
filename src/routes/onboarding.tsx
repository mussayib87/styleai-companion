import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/styleai/use-session";
import { useProfile, useUpdateProfile } from "@/lib/styleai/data";
import { Logo } from "@/components/styleai/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your style — StyleAI" },
      { name: "description", content: "Tell StyleAI about your style so it can dress you well." },
      { property: "og:title", content: "Set up your style — StyleAI" },
      {
        property: "og:description",
        content: "Tell StyleAI about your style so it can dress you well.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile?.display_name]);

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-semibold">Let's set up your style</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can refine everything later in your style profile.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">What should we call you?</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={update.isPending}
            onClick={async () => {
              await update.mutateAsync({
                display_name: name || null,
                onboarding_completed: true,
              });
              navigate({ to: "/", replace: true });
            }}
          >
            Start styling
          </Button>
        </div>
      </div>
    </div>
  );
}
