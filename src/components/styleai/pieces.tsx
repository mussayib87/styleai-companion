import type { ReactNode } from "react";
import { Check, Heart, Lock, RefreshCw, Shirt, ThumbsDown, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type GeneratedOutfit, type WardrobeItem } from "@/lib/styleai/types";
import { getAiPickVisual } from "@/lib/styleai/ai-pick-visuals";

export function ItemSwatch({
  item,
  className,
}: {
  item: Pick<WardrobeItem, "color" | "pattern" | "image_url" | "name">;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  if (item.image_url && !imageFailed) {
    return (
      <img
        src={item.image_url}
        alt={item.name}
        loading="lazy"
        className={cn(
          "size-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]",
          className,
        )}
        onError={() => setImageFailed(true)}
      />
    );
  }
  const fallbackVisual = getAiPickVisual(item);
  if (fallbackVisual && !fallbackFailed) {
    return (
      <img
        src={fallbackVisual.imageUrl}
        alt={`${fallbackVisual.category} fashion reference`}
        loading="lazy"
        className={cn(
          "size-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]",
          className,
        )}
        onError={() => setFallbackFailed(true)}
      />
    );
  }
  return (
    <div className={cn("grid size-full place-items-center bg-card px-3 text-center", className)}>
      <div>
        <Shirt className="mx-auto size-8 text-primary/70" strokeWidth={1.25} aria-hidden="true" />
        <span className="mt-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          No image available
        </span>
      </div>
    </div>
  );
}

export function ItemCard({
  item,
  onClick,
  favorite,
  onFavorite,
}: {
  item: WardrobeItem;
  onClick?: () => void;
  favorite?: boolean;
  onFavorite?: () => void;
}) {
  return (
    <div className="group surface-card relative overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left focus-visible:outline-none"
      >
        <div className="relative aspect-4/5 overflow-hidden">
          <ItemSwatch item={item} />
          {item.in_laundry && (
            <Badge className="absolute left-2 top-2 bg-warning/90 text-background">
              In laundry
            </Badge>
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.category} · {item.color} · {item.style}
          </p>
        </div>
      </button>
      {onFavorite && (
        <button
          type="button"
          onClick={onFavorite}
          aria-label="Toggle favorite"
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={cn(
              "size-4",
              favorite ? "fill-primary text-primary" : "text-muted-foreground",
            )}
          />
        </button>
      )}
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span className="ai-gradient inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground">
      {score}% match
    </span>
  );
}

export function OutfitStrip({ outfit }: { outfit: GeneratedOutfit }) {
  return (
    <div className="flex gap-2">
      {outfit.pieces.map((p) => (
        <div
          key={p.item.id}
          className="relative aspect-3/4 flex-1 overflow-hidden rounded-xl border border-border"
        >
          <ItemSwatch item={p.item} />
          <span className="absolute inset-x-1 bottom-1 truncate rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">
            {p.item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OutfitCard({
  outfit,
  rank,
  onLike,
  onDislike,
  onSave,
  onWear,
  onAnother,
  onTryOn,
  locked,
  onLock,
  compact,
}: {
  outfit: GeneratedOutfit;
  rank?: number;
  onLike?: () => void;
  onDislike?: () => void;
  onSave?: () => void;
  onWear?: () => void;
  onAnother?: () => void;
  onTryOn?: () => void;
  locked?: boolean;
  onLock?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="surface-card rise-in overflow-hidden rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {rank !== undefined && (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-glow">
              {rank === 1 ? "#1 Best match" : `#${rank}`}
            </p>
          )}
          <p className="mt-0.5 truncate font-display text-base font-semibold">{outfit.title}</p>
          <p className="text-xs text-muted-foreground">Suitable for {outfit.occasion}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ScorePill score={outfit.score} />
          {onLock && (
            <Button
              size="icon"
              variant={locked ? "default" : "secondary"}
              onClick={onLock}
              aria-label="Lock outfit"
            >
              <Lock className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <OutfitStrip outfit={outfit} />
      </div>

      {!compact && (
        <ul className="mt-3 space-y-1">
          {outfit.reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {onWear && (
          <Button size="sm" onClick={onWear}>
            Wear today
          </Button>
        )}
        {onSave && (
          <Button size="sm" variant="secondary" onClick={onSave}>
            <Heart className="size-4" /> Save
          </Button>
        )}
        {onLike && (
          <Button size="sm" variant="secondary" onClick={onLike} aria-label="Like outfit">
            <Heart className="size-4" /> Like
          </Button>
        )}
        {onDislike && (
          <Button size="sm" variant="ghost" onClick={onDislike}>
            <ThumbsDown className="size-4" /> Not for me
          </Button>
        )}
        {onAnother && (
          <Button size="sm" variant="ghost" onClick={onAnother}>
            <RefreshCw className="size-4" /> Try another
          </Button>
        )}
        {onTryOn && (
          <Button size="sm" variant="ghost" onClick={onTryOn}>
            <Wand2 className="size-4" /> AI Try-On
          </Button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card grid place-items-center rounded-2xl px-6 py-14 text-center">
      {icon && (
        <div className="ai-gradient mb-4 grid size-12 place-items-center rounded-2xl text-primary-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-base font-semibold sm:text-lg">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function ThinkingLines({ label }: { label: string }) {
  return (
    <div className="surface-card shimmer rounded-2xl p-5">
      <p className="text-sm font-medium text-primary-glow">{label}</p>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
