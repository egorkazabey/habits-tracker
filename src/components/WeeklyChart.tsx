interface WeeklyChartProps {
  values: number[]
  color: string
  type: 'bar' | 'line'
  max?: number
}

const WIDTH = 280
const HEIGHT = 64
const GAP = 4

export default function WeeklyChart({ values, color, type, max = 7 }: WeeklyChartProps) {
  const x = (i: number) => (values.length > 1 ? (i * WIDTH) / (values.length - 1) : WIDTH / 2)
  const y = (v: number) => HEIGHT - (Math.min(v, max) / max) * HEIGHT

  if (type === 'line') {
    const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
    return (
      <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="weekly-chart">
        <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={2.5} fill={color} />
        ))}
      </svg>
    )
  }

  const barWidth = (WIDTH - GAP * (values.length - 1)) / values.length
  return (
    <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="weekly-chart">
      {values.map((v, i) => {
        const h = Math.max(2, (Math.min(v, max) / max) * HEIGHT)
        return <rect key={i} x={i * (barWidth + GAP)} y={HEIGHT - h} width={barWidth} height={h} rx={3} fill={color} />
      })}
    </svg>
  )
}
