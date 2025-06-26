
'use client';

import { cn } from "@/lib/utils";
import { SEGMENT_ANGLE, type SEGMENTS_CONFIG } from "@/config/game-config";

// This function is defined locally to make the component self-contained
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
};

export const Wheel = ({ segments, rotation, customTextures, hideText, textureRotation, spinDuration }: { segments: (typeof SEGMENTS_CONFIG); rotation: number; customTextures: Record<string, string>; hideText: boolean; textureRotation: number; spinDuration: number; }) => {
  const radius = 200;
  const center = 210;
  const fullWheelTexture = customTextures['wheel-full'];
  const NUM_SEGMENTS = segments.length;

  const getSegmentPath = (index: number) => {
    const startAngle = index * SEGMENT_ANGLE;
    const endAngle = (index + 1) * SEGMENT_ANGLE;
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    return `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 0 0 ${end.x},${end.y} Z`;
  };

  const getLabelPosition = (index: number, isBonus: boolean) => {
    const angle = (index + 0.5) * SEGMENT_ANGLE;
    const distance = isBonus ? radius * 0.72 : radius * 0.75;
    return polarToCartesian(center, center, distance, angle);
  };
  
  const bulbs = Array.from({ length: NUM_SEGMENTS });
  const uniqueLabelsWithTextures = [...new Set(segments.map(s => s.label))].filter(label => customTextures[`wheel-${label}`]);


  return (
    <div className="relative w-[420px] h-[420px] flex items-center justify-center">
      <div
        className="absolute w-full h-full rounded-full"
        style={{
          transition: `transform ${spinDuration}s cubic-bezier(0.22, 1, 0.36, 1)`,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <svg viewBox="0 0 420 420">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(0,0,0,0.5)" />
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
             {fullWheelTexture && (
                <pattern id="pattern-wheel-full" patternUnits="userSpaceOnUse" width="420" height="420" patternTransform={`rotate(${textureRotation} 210 210)`}>
                    <image href={fullWheelTexture} x="0" y="0" width="420" height="420" preserveAspectRatio="xMidYMid slice" />
                </pattern>
            )}
            {uniqueLabelsWithTextures.map(label => (
              <pattern key={`pattern-wheel-${label}`} id={`pattern-wheel-${label}`} patternUnits="userSpaceOnUse" width="420" height="420">
                <image href={customTextures[`wheel-${label}`]} x="0" y="0" width="420" height="420" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
          </defs>
          <g filter="url(#shadow)">
            {/* Wheel Body */}
            {fullWheelTexture ? (
                <>
                    <circle cx={center} cy={center} r={radius} fill="url(#pattern-wheel-full)" stroke="hsl(43, 78%, 58%)" strokeWidth="2" />
                    {/* Render labels on top of full texture */}
                    {segments.map((segment, index) => {
                        const isBonus = segment.type === 'bonus';
                        const labelPos = getLabelPosition(index, isBonus);
                        return (
                            <text
                                key={segment.id}
                                x={labelPos.x}
                                y={labelPos.y}
                                fill={hideText ? 'transparent' : segment.textColor}
                                textAnchor="middle"
                                dy=".3em"
                                className={cn(
                                    "font-bold uppercase tracking-wider",
                                    isBonus ? "text-[11px] leading-tight" : "text-base"
                                )}
                                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                                transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${labelPos.x}, ${labelPos.y})`}
                            >
                                {segment.label.replace('_', '\n')}
                            </text>
                        );
                    })}
                </>
            ) : (
                /* Original logic for individual segments */
                segments.map((segment, index) => {
                    const textureUrl = customTextures[`wheel-${segment.label}`];
                    const isBonus = segment.type === 'bonus';
                    const labelPos = getLabelPosition(index, isBonus);
                    return (
                        <g key={segment.id}>
                            <path 
                            d={getSegmentPath(index)} 
                            fill={textureUrl ? `url(#pattern-wheel-${segment.label})` : segment.color} 
                            stroke="hsl(43, 78%, 58%)" 
                            strokeWidth={2}
                            filter={isBonus ? 'url(#glow)' : undefined}
                            />
                            <text
                            x={labelPos.x}
                            y={labelPos.y}
                            fill={hideText || textureUrl ? 'transparent' : segment.textColor}
                            textAnchor="middle"
                            dy=".3em"
                            className={cn(
                                "font-bold uppercase tracking-wider",
                                isBonus ? "text-[11px] leading-tight" : "text-base"
                            )}
                            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                            transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${labelPos.x}, ${labelPos.y})`}
                            >
                            {segment.label.replace('_', '\n')}
                            </text>
                        </g>
                    );
                })
            )}

            {/* Rim and bulbs */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--accent))" strokeWidth="6" />
            <g>
                {bulbs.map((_, index) => {
                    const angle = index * (360 / bulbs.length);
                    const pos = polarToCartesian(center, center, radius, angle);
                    return (
                        <circle
                            key={`bulb-${index}`}
                            cx={pos.x}
                            cy={pos.y}
                            r="4"
                            fill="hsl(43, 98%, 68%)"
                            className="animate-bulb-blink"
                            style={{ animationDelay: `${(index % 10) * 150}ms`}}
                        />
                    );
                })}
            </g>

          </g>
        </svg>
      </div>
       <div 
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-background flex items-center justify-center shadow-lg"
         style={{ background: 'radial-gradient(circle, hsl(43, 98%, 68%) 60%, hsl(43, 88%, 48%))' }}
       >
       </div>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[15px]"
        style={{
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          width: '30px',
          height: '40px',
          backgroundColor: 'hsl(var(--accent))',
          filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
};
