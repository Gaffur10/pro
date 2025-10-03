
'use client'

import type React from "react"

interface ElbowChartProps {
  k_values: number[]
  wcss_values: number[]
  optimal_k: number
}

export function ElbowChart({ k_values, wcss_values, optimal_k }: ElbowChartProps) {
  const width = 500
  const height = 300
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }

  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const xScale = (k: number) => ((k - Math.min(...k_values)) / (Math.max(...k_values) - Math.min(...k_values))) * xMax
  const yScale = (wcss: number) => yMax - ((wcss - Math.min(...wcss_values)) / (Math.max(...wcss_values) - Math.min(...wcss_values))) * yMax

  const points = k_values.map((k, i) => `${xScale(k)},${yScale(wcss_values[i])}`).join(' ')

  return (
    <svg width={width} height={height} className="bg-muted/20 rounded-lg">
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* X-Axis */}
        <g transform={`translate(0, ${yMax})`}>
          <line x1="0" y1="0" x2={xMax} y2="0" stroke="currentColor" />
          {k_values.map(k => (
            <g key={k} transform={`translate(${xScale(k)}, 0)`}>
              <line y2="5" stroke="currentColor" />
              <text dy="1em" y="5" textAnchor="middle" className="text-xs fill-current">{k}</text>
            </g>
          ))}
          <text transform={`translate(${xMax / 2}, 35)`} textAnchor="middle" className="text-sm fill-current">Jumlah Cluster (K)</text>
        </g>

        {/* Y-Axis */}
        <g>
          <line x1="0" y1="0" x2="0" y2={yMax} stroke="currentColor" />
          {Array.from({ length: 5 }).map((_, i) => {
            const wcss = Math.min(...wcss_values) + (i / 4) * (Math.max(...wcss_values) - Math.min(...wcss_values))
            return (
              <g key={i} transform={`translate(0, ${yScale(wcss)})`}>
                <line x2="-5" stroke="currentColor" />
                <text dx="-1em" x="-5" textAnchor="end" dy="0.32em" className="text-xs fill-current">{wcss.toFixed(2)}</text>
              </g>
            )
          })}
          <text transform={`translate(-35, ${yMax / 2}) rotate(-90)`} textAnchor="middle" className="text-sm fill-current">WCSS</text>
        </g>

        {/* Line */}
        <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />

        {/* Points */}
        {k_values.map((k, i) => (
          <circle
            key={k}
            cx={xScale(k)}
            cy={yScale(wcss_values[i])}
            r="4"
            fill={k === optimal_k ? "hsl(var(--primary))" : "hsl(var(--background))"}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        ))}

        {/* Optimal K Line */}
        <line
          x1={xScale(optimal_k)}
          y1={yScale(wcss_values[k_values.indexOf(optimal_k)])}
          x2={xScale(optimal_k)}
          y2={yMax}
          stroke="hsl(var(--primary))"
          strokeDasharray="4 4"
        />
      </g>
    </svg>
  )
}
