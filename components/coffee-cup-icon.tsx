export function CoffeeCupIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Steam - three wavy lines with more natural curves */}
      <path
        d="M85 25C85 25 83 15 85 5C87 -5 85 -10 85 -10"
        stroke="#8B4513"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M100 30C100 30 98 20 100 10C102 0 100 -5 100 -5"
        stroke="#8B4513"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M115 25C115 25 113 15 115 5C117 -5 115 -10 115 -10"
        stroke="#8B4513"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Coffee Cup - more rounded and refined */}
      <path
        d="M55 45C55 45 50 50 50 60L60 145C60 155 65 165 80 165H120C135 165 140 155 140 145L150 60C150 50 145 45 145 45H55Z"
        fill="#8B4513"
      />

      {/* Cup Interior - white crescent space */}
      <path
        d="M60 50C60 50 57 53 57 60L65 140C65 147 68 155 80 155H120C132 155 135 147 135 140L143 60C143 53 140 50 140 50H60Z"
        fill="white"
      />

      {/* Handle - more refined D-shape */}
      <path
        d="M145 65C145 65 160 65 165 75C170 85 170 95 165 105C160 115 145 115 145 115"
        stroke="#8B4513"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Saucer - flatter and more extended */}
      <ellipse cx="100" cy="170" rx="85" ry="6" fill="#8B4513" />
    </svg>
  )
}