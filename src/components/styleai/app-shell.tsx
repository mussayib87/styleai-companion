import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  Home,
  Plus,
  Settings,
  Shirt,
  ShoppingBag,
  Sparkles,
  SquareUser,
  Heart,
  CalendarClock,
  Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/styleai/use-session";
import { useProfile } from "@/lib/styleai/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/wardrobe", label: "My Wardrobe", icon: Shirt },
  { to: "/planner", label: "Outfit Planner", icon: CalendarClock },
  { to: "/stylist", label: "AI Stylist", icon: Sparkles },
  { to: "/try-on", label: "AI Try-On", icon: Wand2 },
  { to: "/shopping", label: "Shopping Assistant", icon: ShoppingBag },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/profile", label: "Style Profile", icon: SquareUser },
  { to: "/analytics", label: "Analytics", icon: ChartNoAxesColumn },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { to: "/stylist", label: "AI Style", icon: Sparkles },
  { to: "/planner", label: "Planner", icon: CalendarClock },
  { to: "/profile", label: "Profile", icon: SquareUser },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="ai-gradient grid size-9 place-items-center rounded-xl">
        <Sparkles className="size-4.5 text-primary-foreground" />
      </div>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Style<span className="ai-text">AI</span>
        </span>
      )}
    </div>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (session && profile && !profile.onboarding_completed && pathname !== "/onboarding") {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [session, profile, pathname, navigate]);

  if (loading || !session || profileLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] flex-col border-r border-border bg-card/70 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link to="/" className="px-2">
          <Logo />
        </Link>
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <n.icon className={cn("size-4.5", active && "text-primary-glow")} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="surface-card mt-4 rounded-2xl p-4">
          <p className="font-display text-sm font-semibold">Add to wardrobe</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Snap a photo and let AI tag it for you.
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link to="/wardrobe/add">
              <Plus className="size-4" /> Add clothes
            </Link>
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[268px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="lg:hidden">
              <Logo compact />
            </span>
            <div className="min-w-0">
              {title && (
                <h1 className="truncate font-display text-lg font-semibold sm:text-xl">{title}</h1>
              )}
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            <Button asChild variant="ghost" size="icon" aria-label="Notifications">
              <Link to="/settings">
                <Bell className="size-4.5" />
              </Link>
            </Button>
            <Link
              to="/profile"
              aria-label="Style profile"
              className="ai-gradient grid size-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground"
            >
              {(profile?.display_name ?? "S").slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 py-2">
          {MOBILE_NAV.map((n, i) => {
            const active = pathname === n.to;
            return (
              <div key={n.to} className={cn(i === 2 && "invisible")}>
                <Link
                  to={n.to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary-glow" : "text-muted-foreground",
                  )}
                >
                  <n.icon className="size-5" />
                  {n.label}
                </Link>
              </div>
            );
          })}
          <Link
            to="/wardrobe/add"
            aria-label="Add clothes"
            className="ai-gradient glow-ring absolute left-1/2 bottom-5 grid size-14 -translate-x-1/2 place-items-center rounded-full text-primary-foreground"
          >
            <Plus className="size-6" />
          </Link>
        </div>
      </nav>
    </div>
  );
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/auth";
}
