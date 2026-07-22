import { cn } from "@/lib/utils";

// The Alon signature: one quiet sine wave. Animated only where it matters
// (hero); static everywhere else.
export function Tideline({
  animated = false,
  className,
}: {
  animated?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 12"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={cn("h-3", className)}
    >
      <path
        d="M0 6 C 10 1, 20 1, 30 6 S 50 11, 60 6 S 80 1, 90 6 S 110 11, 120 6 S 140 1, 150 6 S 170 11, 180 6 S 200 1, 210 6 S 230 11, 240 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        className={animated ? "tideline-draw" : undefined}
      />
    </svg>
  );
}
