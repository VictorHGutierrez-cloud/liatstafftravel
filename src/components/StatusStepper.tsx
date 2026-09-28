import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusStepper({
  stages,
  currentIndex,
  failed,
}: {
  stages: string[];
  currentIndex: number;
  failed?: boolean;
}) {
  return (
    <ol className="flex flex-wrap gap-y-3">
      {stages.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={stage} className="flex min-w-0 flex-1 items-center gap-2 pr-3">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-transparent bg-accent text-accent-foreground",
                active && !failed && "border-transparent bg-primary text-primary-foreground",
                active && failed && "border-transparent bg-destructive text-destructive-foreground",
                !done && !active && "border-border bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "truncate text-xs",
                active ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {stage}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
