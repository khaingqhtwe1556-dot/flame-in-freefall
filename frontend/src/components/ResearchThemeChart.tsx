import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { categoryLabels, investigations } from '../data/investigations'

const colors = ['#52d7f0', '#4b9cf5', '#8279ff', '#edaa59', '#56c99c', '#7b91a8']

const chartData = Object.entries(categoryLabels).map(([category, label]) => ({
  label,
  records: investigations.filter((item) => item.category === category).length,
}))

export function ResearchThemeChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 24 }}>
        <CartesianGrid stroke="#1b2b3d" horizontal={false} />
        <XAxis allowDecimals={false} axisLine={false} tick={{ fill: '#64748b', fontFamily: 'Inter', fontSize: 11 }} tickLine={false} type="number" />
        <YAxis axisLine={false} dataKey="label" tick={{ fill: '#94a3b8', fontFamily: 'Inter', fontSize: 11 }} tickLine={false} type="category" width={145} />
        <Tooltip
          contentStyle={{ background: '#0d1927', border: '1px solid #26384a', borderRadius: 8, color: '#f8fafc', fontFamily: 'Inter' }}
          cursor={{ fill: 'rgba(95, 169, 205, .08)' }}
          formatter={(value) => [`${value} records`, 'Catalog']}
        />
        <Bar dataKey="records" radius={[0, 5, 5, 0]}>
          {chartData.map((item, index) => (
            <Cell fill={colors[index % colors.length]} key={item.label} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
