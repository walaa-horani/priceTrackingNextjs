import { getProduct, getPriceHistory } from "@/app/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function ProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const priceHistory = await getPriceHistory(id);

    const formattedPrice = formatCurrency(product.current_price, product.currency);

    // Simple price change calculation
    const getPriceDiff = () => {
        if (priceHistory.length < 2) return null;
        const latest = priceHistory[priceHistory.length - 1].price;
        const previous = priceHistory[priceHistory.length - 2].price;
        const diff = latest - previous;
        const percentage = ((diff / previous) * 100).toFixed(1);

        return {
            diff,
            percentage,
            isIncrease: diff > 0,
            isDecrease: diff < 0
        };
    };

    const priceDiff = getPriceDiff();

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-5xl mx-auto px-4 pt-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight uppercase tracking-tight">
                                {product.name}
                            </h1>
                            <Link
                                href={product.url}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold text-sm transition-colors border-b border-orange-200"
                            >
                                View on original store
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="flex items-end gap-4 p-8 bg-orange-50/50 rounded-2xl border border-orange-100">
                            <div>
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">Current Price</span>
                                <span className="text-5xl font-extrabold text-orange-500 tracking-tighter">{formattedPrice}</span>
                            </div>

                            {priceDiff && (
                                <div className={`mb-1 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${priceDiff.isDecrease ? 'bg-green-100 text-green-700' :
                                    priceDiff.isIncrease ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                    {priceDiff.isDecrease ? <TrendingDown className="w-4 h-4" /> :
                                        priceDiff.isIncrease ? <TrendingUp className="w-4 h-4" /> :
                                            <Minus className="w-4 h-4" />}
                                    {priceDiff.percentage}%
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Price History</h2>
                            <div className="space-y-3">
                                {priceHistory.length > 0 ? (
                                    [...priceHistory].reverse().map((record, index) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <span className="text-gray-600 text-sm">
                                                {new Date(record.created_at || record.checked_at).toLocaleDateString()} at {new Date(record.created_at || record.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="font-bold text-gray-900 border-b-2 border-orange-100">
                                                {formatCurrency(record.price, record.currency)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No price history available yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
