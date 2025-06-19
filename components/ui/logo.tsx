import React from 'react'

interface LogoProps {
  width?: number
  height?: number
  className?: string
  iconOnly?: boolean
}

export function Logo({ width = 200, height = 60, className = "", iconOnly = false }: LogoProps) {
  if (iconOnly) {
    // Icon-only version for smaller spaces
    return (
      <svg 
        width={height} 
        height={height} 
        viewBox="0 0 44 44" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Rocket/Growth Symbol */}
        <path d="M22 14L22 30C22 32.2091 20.2091 34 18 34L14 34C11.7909 34 10 32.2091 10 30L10 14C10 9.58172 13.5817 6 18 6L18 6C20.2091 6 22 7.79086 22 10L22 14Z" fill="url(#gradient1-icon)"/>
        
        {/* Rocket Fins */}
        <path d="M10 20L6 24C5.44772 24 5 23.5523 5 23L5 21C5 20.4477 5.44772 20 6 20L10 20Z" fill="url(#gradient2-icon)"/>
        <path d="M22 20L26 24C26.5523 24 27 23.5523 27 23L27 21C27 20.4477 26.5523 20 26 20L22 20Z" fill="url(#gradient2-icon)"/>
        
        {/* Rocket Window */}
        <circle cx="16" cy="16" r="3" fill="#FDFDFD" opacity="0.9"/>
        <circle cx="16" cy="16" r="1.5" fill="#1968FF"/>
        
        {/* Flame/Trail */}
        <path d="M16 34L14 40C15.3333 39.3333 16.6667 39.3333 18 40L16 34Z" fill="url(#gradient3-icon)"/>
        
        {/* Nation/Community Dots */}
        <circle cx="8" cy="10" r="1.5" fill="#1968FF" opacity="0.6"/>
        <circle cx="24" cy="12" r="1.5" fill="#1968FF" opacity="0.6"/>
        <circle cx="6" cy="16" r="1" fill="#1968FF" opacity="0.4"/>
        <circle cx="26" cy="18" r="1" fill="#1968FF" opacity="0.4"/>
        <circle cx="4" cy="22" r="1" fill="#1968FF" opacity="0.3"/>
        <circle cx="28" cy="24" r="1" fill="#1968FF" opacity="0.3"/>
        
        <defs>
          <linearGradient id="gradient1-icon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#1968FF", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#1968FF", stopOpacity:0.8}} />
          </linearGradient>
          <linearGradient id="gradient2-icon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#1968FF", stopOpacity:0.7}} />
            <stop offset="100%" style={{stopColor:"#1968FF", stopOpacity:0.5}} />
          </linearGradient>
          <linearGradient id="gradient3-icon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:"#FF6B6B", stopOpacity:0.8}} />
            <stop offset="50%" style={{stopColor:"#FFE66D", stopOpacity:0.6}} />
            <stop offset="100%" style={{stopColor:"#FF6B6B", stopOpacity:0.4}} />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // Full logo with text
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Logo Icon */}
      <g transform="translate(8, 8)">
        {/* Rocket/Growth Symbol */}
        <path d="M22 14L22 30C22 32.2091 20.2091 34 18 34L14 34C11.7909 34 10 32.2091 10 30L10 14C10 9.58172 13.5817 6 18 6L18 6C20.2091 6 22 7.79086 22 10L22 14Z" fill="url(#gradient1)"/>
        
        {/* Rocket Fins */}
        <path d="M10 20L6 24C5.44772 24 5 23.5523 5 23L5 21C5 20.4477 5.44772 20 6 20L10 20Z" fill="url(#gradient2)"/>
        <path d="M22 20L26 24C26.5523 24 27 23.5523 27 23L27 21C27 20.4477 26.5523 20 26 20L22 20Z" fill="url(#gradient2)"/>
        
        {/* Rocket Window */}
        <circle cx="16" cy="16" r="3" fill="#FDFDFD" opacity="0.9"/>
        <circle cx="16" cy="16" r="1.5" fill="#1968FF"/>
        
        {/* Flame/Trail */}
        <path d="M16 34L14 40C15.3333 39.3333 16.6667 39.3333 18 40L16 34Z" fill="url(#gradient3)"/>
        
        {/* Nation/Community Dots */}
        <circle cx="8" cy="10" r="1.5" fill="#1968FF" opacity="0.6"/>
        <circle cx="24" cy="12" r="1.5" fill="#1968FF" opacity="0.6"/>
        <circle cx="6" cy="16" r="1" fill="#1968FF" opacity="0.4"/>
        <circle cx="26" cy="18" r="1" fill="#1968FF" opacity="0.4"/>
        <circle cx="4" cy="22" r="1" fill="#1968FF" opacity="0.3"/>
        <circle cx="28" cy="24" r="1" fill="#1968FF" opacity="0.3"/>
      </g>
      
      {/* Text */}
      <g transform="translate(52, 12)">
        {/* "Startup" */}
        <text x="0" y="16" fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="700" fontSize="18" fill="url(#textGradient)">Startup</text>
        
        {/* "Nation" */}
        <text x="0" y="36" fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="600" fontSize="16" fill="#C8C8C8">Nation</text>
      </g>
      
      {/* Gradients */}
      <defs>
        {/* Main rocket gradient */}
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#1968FF", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1968FF", stopOpacity:0.8}} />
        </linearGradient>
        
        {/* Fins gradient */}
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#1968FF", stopOpacity:0.7}} />
          <stop offset="100%" style={{stopColor:"#1968FF", stopOpacity:0.5}} />
        </linearGradient>
        
        {/* Flame gradient */}
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FF6B6B", stopOpacity:0.8}} />
          <stop offset="50%" style={{stopColor:"#FFE66D", stopOpacity:0.6}} />
          <stop offset="100%" style={{stopColor:"#FF6B6B", stopOpacity:0.4}} />
        </linearGradient>
        
        {/* Text gradient */}
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#1968FF", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1968FF", stopOpacity:0.8}} />
        </linearGradient>
      </defs>
    </svg>
  )
} 