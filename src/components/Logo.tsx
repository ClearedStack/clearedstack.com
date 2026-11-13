import { useId } from "react";

/** The ClearedStack mark: a stack of plates with a check on the top one. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const maskId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <mask id={maskId}>
        <path fill="#fff" d="M0 0h64v64H0z" />
        <path
          d="M21.5 19.2l7.2 4L43 14.6"
          fill="none"
          stroke="#000"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </mask>
      <path d="M32 5 59 19 32 33 5 19Z" fill="var(--accent)" mask={`url(#${maskId})`} />
      <path
        d="M5 29.5V35l27 14 27-14v-5.5l-27 14ZM5 41.5V47l27 14 27-14v-5.5l-27 14Z"
        fill="var(--ink)"
      />
    </svg>
  );
}

/** Mark plus wordmark, set in live text so it stays crisp and selectable. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className="font-semibold tracking-[-0.01em] text-ink"
        style={{ fontSize: Math.round(size * 0.68) }}
      >
        Cleared<span className="text-accent">Stack</span>
      </span>
    </span>
  );
}
