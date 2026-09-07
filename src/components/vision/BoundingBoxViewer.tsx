'use client';

import React, { useState } from 'react';

interface DetectedObject {
  label: string;
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

interface BoundingBoxViewerProps {
  imageUrl: string;
  detectedObjects: DetectedObject[];
}

export default function BoundingBoxViewer({ imageUrl, detectedObjects }: BoundingBoxViewerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative inline-block w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      {/* Element Gambar Utama */}
      <img
        src={imageUrl}
        alt="Analyzed Content"
        className="block w-full h-auto object-contain"
      />

      {/* Overlay Canvas/SVG Bounding Box */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
      >
        {detectedObjects.map((obj, index) => {
          const [ymin, xmin, ymax, xmax] = obj.box_2d;
          const width = xmax - xmin;
          const height = ymax - ymin;
          const isHovered = hoveredIndex === index;

          return (
            <g 
              key={index} 
              className="pointer-events-auto cursor-pointer" 
              onMouseEnter={() => setHoveredIndex(index)} 
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Kotak Bounding Box */}
              <rect
                x={xmin}
                y={ymin}
                width={width}
                height={height}
                fill={isHovered ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                stroke={isHovered ? '#60A5FA' : '#3B82F6'}
                strokeWidth={isHovered ? '6' : '4'}
                className="transition-all duration-150"
              />

              {/* Label Badge */}
              <foreignObject x={xmin} y={Math.max(0, ymin - 40)} width="300" height="40">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold shadow-md">
                  <span>{obj.label}</span>
                  <span className="text-blue-200 text-[10px]">({Math.round(obj.confidence * 100)}%)</span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}