import React, { useId } from 'react';

export type SparklineColorScheme = 'brand' | 'warning' | 'danger' | 'success' | 'accent' | 'teal';

interface SparklineProps {
  data: number[];
  colorScheme?: SparklineColorScheme;
  height?: number;
  width?: number | string;
  className?: string;
}

const colorMap: Record<SparklineColorScheme, { stroke: string; fillStart: string; fillEnd: string }> = {
  brand: { stroke: '#2451D9', fillStart: 'rgba(36, 81, 217, 0.25)', fillEnd: 'rgba(36, 81, 217, 0.0)' },
  warning: { stroke: '#D97706', fillStart: 'rgba(217, 119, 6, 0.25)', fillEnd: 'rgba(217, 119, 6, 0.0)' },
  danger: { stroke: '#DC5B3E', fillStart: 'rgba(220, 91, 62, 0.25)', fillEnd: 'rgba(220, 91, 62, 0.0)' },
  success: { stroke: '#16A34A', fillStart: 'rgba(22, 163, 74, 0.25)', fillEnd: 'rgba(22, 163, 74, 0.0)' },
  accent: { stroke: '#7C3AED', fillStart: 'rgba(124, 58, 237, 0.25)', fillEnd: 'rgba(124, 58, 237, 0.0)' },
  teal: { stroke: '#0D9488', fillStart: 'rgba(13, 148, 136, 0.25)', fillEnd: 'rgba(13, 148, 136, 0.0)' },
};

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  colorScheme = 'brand',
  height = 42,
  width = '100%',
  className = '',
}) => {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return <div style={{ height }} className="w-full bg-gray-50 rounded-lg animate-pulse" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const effectiveHeight = height - paddingY * 2;
  const viewBoxWidth = 120;

  // Generate SVG path coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * viewBoxWidth;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return { x, y };
  });

  // Build smooth bezier curve
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  const areaPath = `${linePath} L ${viewBoxWidth} ${height} L 0 ${height} Z`;
  const colors = colorMap[colorScheme] || colorMap.brand;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        width={width}
        height={height}
        className="w-full block overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.fillStart} />
            <stop offset="100%" stopColor={colors.fillEnd} />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Sparkline;
