import { cn } from '@/lib/utils'

export function BrandLogo({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2.5',
        inverse ? 'text-white' : 'text-primary',
      )}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="size-9 shrink-0"
        aria-hidden="true"
      >
        <rect
          width="40"
          height="40"
          rx="12"
          fill={inverse ? '#FFC857' : '#152A3E'}
        />
        <path
          d="M11 30 20 11l9 19"
          stroke={inverse ? '#152A3E' : '#FFC857'}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 24.5h9"
          stroke={inverse ? '#152A3E' : '#FFC857'}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
        <path
          d="M12 34h16"
          stroke={inverse ? '#152A3E' : '#FFC857'}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      {!compact && (
        <span className="flex flex-col">
          <span className="text-[18px] font-bold leading-none tracking-[-0.055em] sm:text-[21px]">
            Auto Machare<span className="ml-0.5 text-xs">.</span>
          </span>
          <span
            className={cn(
              'mt-1.5 text-[9px] font-medium tracking-[0.16em]',
              inverse ? 'text-white/65' : 'text-muted-foreground',
            )}
          >
            車と、次の可能性を。
          </span>
        </span>
      )}
    </span>
  )
}
