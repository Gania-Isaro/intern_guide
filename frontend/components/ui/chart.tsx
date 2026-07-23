"use client";


import * as React from "react";
import * as echarts from "echarts";

interface ChartProps {
  option: echarts.EChartsOption;
  height?: number;
  /** read out to screen readers, since a canvas on its own says nothing */
  label: string;
}

export function Chart({ option, height = 260, label }: ChartProps) {
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!boxRef.current) return;

    const chart = echarts.init(boxRef.current);
    chart.setOption(option);

    // ECharts draws onto a fixed-size canvas, so it needs telling when the
    // box around it changes - otherwise the chart stays the old size.
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(boxRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label={label}
      style={{ height }}
      className="w-full"
    />
  );
}
