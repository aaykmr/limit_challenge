'use client';

interface PriorityCaretIconProps {
  level: 1 | 2 | 3;
  size?: number;
  strokeWidth?: number;
}

export default function PriorityCaretIcon({ level, size = 24, strokeWidth = 2.4 }: PriorityCaretIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {level >= 1 && (
        <path
          d="M5 8L12 2L19 8"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {level >= 2 && (
        <path
          d="M5 13L12 7L19 13"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {level >= 3 && (
        <path
          d="M5 18L12 12L19 18"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
