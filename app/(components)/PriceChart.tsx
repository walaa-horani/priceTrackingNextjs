"use client"
import React, { useState, useEffect } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'
import { getPriceHistory } from '@/app/actions'
import { formatCurrency } from '@/lib/utils'

interface PriceChartProps {
    productId: string
}

export default function PriceChart({ productId }: PriceChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true)
            const history = await getPriceHistory(productId)
            console.log("History received in component:", history)
            // Format data for Recharts
            const formattedData = history.map((item: any) => ({
                date: new Date(item.created_at || item.checked_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                price: item.price,
                fullDate: new Date(item.created_at || item.checked_at).toLocaleString(),
            }))
            setData(formattedData)
            setLoading(false)
        }
        fetchHistory()
    }, [productId])

    if (loading) {
        return (
            <div className="h-[200px] w-full flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-100 animate-pulse">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Chart...</span>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="h-[200px] w-full flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">No price data available</span>
            </div>
        )
    }

    return (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price Trend</h4>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Real-time Data</span>
                </div>
            </div>

            <div className="h-[200px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: '#94a3b8',
                                fontSize: 10,
                                fontWeight: 600,
                            }}
                            tickFormatter={(value) => formatCurrency(value, "")}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 shadow-xl border border-gray-100 rounded-lg">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{payload[0].payload.fullDate}</p>
                                            <p className="text-sm font-extrabold text-green-600">
                                                {formatCurrency(payload[0].value as number, "")}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-end">
                <a
                    href={`/product/${productId}`}
                    className="text-[10px] font-bold text-gray-400 hover:text-green-600 uppercase tracking-widest transition-colors flex items-center gap-1 group"
                >
                    Detailed Analysis
                    <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </a>
            </div>
        </div>
    )
}