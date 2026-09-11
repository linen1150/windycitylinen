/** Cute flat-illustration avatar for the chat assistant, "Bridgette". */
export function BridgetteAvatar({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Bridgette"
    >
      <circle cx="50" cy="50" r="50" fill="#FDF0DD" />

      {/* hair, behind face + shoulders */}
      <path
        d="M14,52 Q14,10 50,10 Q86,10 86,52 L86,92 Q86,101 76,101 L24,101 Q14,101 14,92 Z"
        fill="#EAB84D"
      />

      {/* face */}
      <circle cx="50" cy="50" r="29" fill="#FBD7B4" />

      {/* ears */}
      <circle cx="21.5" cy="52" r="5" fill="#FBD7B4" />
      <circle cx="78.5" cy="52" r="5" fill="#FBD7B4" />

      {/* soft rounded bangs, center-parted */}
      <path
        d="M21,46 Q21,14 50,14 Q79,14 79,46 Q79,30 61,27 Q50,25 50,32 Q50,25 39,27 Q21,30 21,46 Z"
        fill="#F5C662"
      />

      {/* little bow */}
      <g transform="translate(74,24) rotate(18)">
        <path d="M0,0 L-9,-6 L-9,6 Z" fill="#E8899B" />
        <path d="M0,0 L9,-6 L9,6 Z" fill="#E8899B" />
        <circle cx="0" cy="0" r="3" fill="#D9677D" />
      </g>

      {/* blush */}
      <ellipse cx="33" cy="58" rx="5.5" ry="3.2" fill="#F5A9A0" opacity="0.6" />
      <ellipse cx="67" cy="58" rx="5.5" ry="3.2" fill="#F5A9A0" opacity="0.6" />

      {/* eyebrows */}
      <path d="M33,39 Q38,35.5 44,38" stroke="#8A5A2B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M56,38 Q62,35.5 67,39" stroke="#8A5A2B" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* eyes, bigger with sparkle */}
      <circle cx="39" cy="47" r="4.2" fill="#4A2F1C" />
      <circle cx="61" cy="47" r="4.2" fill="#4A2F1C" />
      <circle cx="37.3" cy="45.3" r="1.3" fill="#FFFFFF" />
      <circle cx="59.3" cy="45.3" r="1.3" fill="#FFFFFF" />

      {/* nose */}
      <path d="M50,50 Q51.5,53 50,54" stroke="#E3AE86" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* smile */}
      <path
        d="M40,60 Q50,68 60,60"
        stroke="#B15B55"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
