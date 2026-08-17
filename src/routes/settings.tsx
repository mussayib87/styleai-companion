import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell, signOut } from "@/components/styleai/app-shell";
import { SectionTitle } from "@/components/styleai/pieces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpdateProfile } from "@/lib/styleai/data";
import { useSession } from "@/lib/styleai/use-session";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StyleAI" },
      { name: "description", content: "Manage your StyleAI account and reminders." },
      { property: "og:title", content: "Settings — StyleAI" },
      { property: "og:description", content: "Manage your StyleAI account and reminders." },
    ],
  }),
  component: Page,
});

function Page() {
  const { user } = useSession();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const [notifications, setNotifications] = useState(true);
  const [time, setTime] = useState("07:30");

  useEffect(() => {
    if (profile) {
      setNotifications(profile.notifications_enabled);
      setTime((profile.notification_time ?? "07:30").slice(0, 5));
    }
  }, [profile]);

  async function persist(patch: { notifications_enabled?: boolean; notification_time?: string }) {
    try {
      await update.mutateAsync(patch);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save settings");
    }
  }

  return (
    <AppShell title="Settings" subtitle="Manage your StyleAI account and reminders.">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-8">
          <section className="surface-card rounded-3xl p-5">
            <SectionTitle title="Daily outfit reminder" hint="A nudge with your planned look." />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Get your planned outfit each morning.
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={(v) => {
                  setNotifications(v);
                  void persist({ notifications_enabled: v });
                }}
                aria-label="Toggle reminders"
              />
            </div>
            <div className="mt-5 max-w-40 space-y-1.5">
              <Label htmlFor="time">Reminder time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onBlur={() => void persist({ notification_time: time })}
                disabled={!notifications}
              />
            </div>
          </section>

          <section className="surface-card rounded-3xl p-5">
            <SectionTitle title="Account" hint="You're signed in to StyleAI." />
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button variant="outline" className="mt-4" onClick={() => void signOut()}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </section>
        </div>
      )}
    </AppShell>
  );
}
