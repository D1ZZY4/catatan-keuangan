import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showGradient?: boolean;
}

export function SparklineChart({
  data,
  width = 80,
  height = 32,
  color = '#8CC0EB',
  showGradient = true,
}: SparklineChartProps): React.ReactElement {
  if (data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((value, i) => ({
    x: pad + (i / (data.length - 1)) * w,
    y: pad + h - ((value - min) / range) * h,
  }));

  function buildPath(): string {
    if (points.length < 2) return '';
    let d = `M ${points[0]!.x} ${points[0]!.y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]!;
      const curr = points[i]!;
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  function buildAreaPath(): string {
    const linePath = buildPath();
    const last = points[points.length - 1]!;
    const first = points[0]!;
    return `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
  }

  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {showGradient && (
        <Path d={buildAreaPath()} fill={`url(#${gradId})`} />
      )}
      <Path
        d={buildPath()}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
