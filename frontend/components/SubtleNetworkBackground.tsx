"use client";

export default function SubtleNetworkBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-[0.07]" aria-hidden="true">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="globalNetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c17f3a" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#5c3d1e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c17f3a" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Global gentle relationship paths */}
        <path d="M50,120 Q300,160 550,110 T1150,150" fill="none" stroke="url(#globalNetGrad)" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M120,320 Q420,260 720,340 T1320,290" fill="none" stroke="url(#globalNetGrad)" strokeWidth="0.8" />
        <path d="M200,600 Q600,520 950,580 T1450,540" fill="none" stroke="url(#globalNetGrad)" strokeWidth="1" strokeDasharray="3 4" />
        <path d="M400,80 L520,220 L680,140 L820,260" fill="none" stroke="url(#globalNetGrad)" strokeWidth="0.7" />

        {/* Nodes */}
        <circle cx="50" cy="120" r="3" fill="#c17f3a" className="network-node-pulse" />
        <circle cx="550" cy="110" r="3.5" fill="#5c3d1e" />
        <circle cx="1150" cy="150" r="3" fill="#c17f3a" className="network-node-pulse" />
        <circle cx="120" cy="320" r="3" fill="#c17f3a" />
        <circle cx="720" cy="340" r="4" fill="#5c3d1e" />
        <circle cx="1320" cy="290" r="3.5" fill="#c17f3a" />
        <circle cx="200" cy="600" r="3.5" fill="#5c3d1e" />
        <circle cx="950" cy="580" r="3" fill="#c17f3a" />
        <circle cx="520" cy="220" r="3" fill="#c17f3a" />
        <circle cx="680" cy="140" r="3" fill="#5c3d1e" />
      </svg>
    </div>
  );
}
