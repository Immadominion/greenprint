import { cn } from "@/lib/utils";

/** The Greenprint mark: a squircle "blueprint" tile with a sprout + code slash. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="gp-mark" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-bright)" />
          <stop offset="1" stopColor="var(--brand)" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="14" fill="url(#gp-mark)" />
      {/* faint blueprint grid */}
      <g stroke="white" strokeOpacity="0.16" strokeWidth="1">
        <path d="M16 6v36M32 6v36M6 16h36M6 32h36" />
      </g>
      {/* sprout */}
      <path
        d="M24 34c0-6 0-9 0-11"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 23c-1.6-4.2-5.4-6-9.6-5.6-0.6 4.6 2.4 8.6 7 9.2"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M24 20c1.4-3.4 4.6-5 8-4.6 0.5 3.8-2 7-5.8 7.6"
        fill="white"
      />
      <circle cx="24" cy="36" r="2.4" fill="white" />
    </svg>
  );
}

export function Logo({
  size = 36,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-[1.35rem] font-extrabold tracking-tight leading-none">
          Green<span className="text-gradient-eco">print</span>
        </span>
      )}
    </span>
  );
}
