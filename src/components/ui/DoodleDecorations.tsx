import React from 'react';

// Hand-drawn Heart SVG with natural imperfect stroke
export const DoodleHeart: React.FC<{
  className?: string;
  fill?: string;
  stroke?: string;
  size?: number;
}> = ({ className = '', fill = '#DDA0A5', stroke = '#5E514B', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M20 34C19 33.5 6 25 3.5 17C1.5 10.5 6.5 4 13.5 4.5C17 4.8 19 7 20 8.5C21 7 23 4.8 26.5 4.5C33.5 4 38.5 10.5 36.5 17C34 25 21 33.5 20 34Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'url(#pencil-stroke)' }}
    />
    {/* Colored pencil hatch inside heart */}
    <path
      d="M10 14Q14 11 18 16M9 19Q15 16 21 21M13 25Q17 23 23 27"
      stroke={stroke}
      strokeWidth="1.2"
      strokeOpacity="0.4"
      strokeLinecap="round"
    />
  </svg>
);

// Hand-drawn little flower
export const DoodleFlower: React.FC<{
  className?: string;
  petalColor?: string;
  centerColor?: string;
  size?: number;
}> = ({ className = '', petalColor = '#DDA0A5', centerColor = '#E1C17A', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* 5 Petals with soft colored pencil fill */}
    <circle cx="25" cy="14" r="8" fill={petalColor} stroke="#5E514B" strokeWidth="1.8" />
    <circle cx="35" cy="21" r="8" fill={petalColor} stroke="#5E514B" strokeWidth="1.8" />
    <circle cx="31" cy="33" r="8" fill={petalColor} stroke="#5E514B" strokeWidth="1.8" />
    <circle cx="19" cy="33" r="8" fill={petalColor} stroke="#5E514B" strokeWidth="1.8" />
    <circle cx="15" cy="21" r="8" fill={petalColor} stroke="#5E514B" strokeWidth="1.8" />
    {/* Center */}
    <circle cx="25" cy="24" r="6.5" fill={centerColor} stroke="#5E514B" strokeWidth="1.8" />
    <circle cx="24" cy="23" r="1.5" fill="#5E514B" opacity="0.6" />
  </svg>
);

// Hand-drawn Leaf/Sprig
export const DoodleLeaf: React.FC<{
  className?: string;
  fill?: string;
  size?: number;
}> = ({ className = '', fill = '#A9B99A', size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M8 34C11 26 15 18 32 8C31 22 24 29 8 34Z"
      fill={fill}
      stroke="#5E514B"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 34C15 26 22 18 32 8"
      stroke="#5E514B"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M17 23Q21 21 24 24M13 28Q17 26 19 29"
      stroke="#5E514B"
      strokeWidth="1"
      strokeOpacity="0.6"
      strokeLinecap="round"
    />
  </svg>
);

// Hand-drawn Pencil
export const DoodlePencil: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <g transform="rotate(45 30 30)">
      {/* Pencil Body */}
      <rect x="25" y="14" width="10" height="32" rx="1" fill="#E1C17A" stroke="#5E514B" strokeWidth="1.8" />
      <line x1="28" y1="14" x2="28" y2="46" stroke="#C9A050" strokeWidth="1.2" />
      <line x1="32" y1="14" x2="32" y2="46" stroke="#C9A050" strokeWidth="1.2" />
      {/* Wood tip */}
      <polygon points="25,46 35,46 30,54" fill="#F7F1E5" stroke="#5E514B" strokeWidth="1.8" />
      {/* Graphite Lead Tip */}
      <polygon points="28,51 32,51 30,54" fill="#5E514B" />
      {/* Metal ferrule */}
      <rect x="25" y="10" width="10" height="4" fill="#B7D0D8" stroke="#5E514B" strokeWidth="1.8" />
      {/* Eraser */}
      <rect x="25" y="6" width="10" height="4" rx="2" fill="#DDA0A5" stroke="#5E514B" strokeWidth="1.8" />
    </g>
  </svg>
);

// Hand-drawn Sparkle Star
export const DoodleSparkle: React.FC<{
  className?: string;
  color?: string;
  size?: number;
}> = ({ className = '', color = '#E1C17A', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M15 3C15 10 18 15 27 15C18 15 15 20 15 27C15 20 12 15 3 15C12 15 15 10 15 3Z"
      fill={color}
      stroke="#5E514B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Hand-drawn arrow
export const DoodleArrow: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 36 }) => (
  <svg
    width={size}
    height={size * 0.6}
    viewBox="0 0 50 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M5 18C15 10 28 22 42 12"
      stroke="#5E514B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M36 7L43 12L38 19"
      stroke="#5E514B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
