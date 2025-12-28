"use client";

import Link from "next/link";
import { ExternalLink, TrendingUp, Clock, Trash2, ChevronDown, ChevronUp, LineChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { deleteProduct, getPriceHistory } from "@/app/actions";
import PriceChart from "./PriceChart";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        current_price: number;
        currency: string;
        image_url: string;
        url: string;
        updated_at: string;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const [showChart, setShowChart] = useState(false);
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const formattedPrice = formatCurrency(product.current_price, product.currency);
    // Split formatted price into currency and amount for specific styling if needed
    // But the user just wants the "INR 8550" look which usually means bold and orange.

    const updatedAt = new Date(product.updated_at).toLocaleDateString();

    const handleToggleChart = async () => {
        if (!showChart && priceHistory.length === 0) {
            setIsLoadingHistory(true);
            const history = await getPriceHistory(product.id);
            setPriceHistory(history);
            setIsLoadingHistory(false);
        }
        setShowChart(!showChart);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to stop tracking this product?")) {
            await deleteProduct(product.id);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* Product Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized // Since these are external URLs that might not be in next.config.ts
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-grow space-y-2">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base ">
                        {product.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-2xl font-extrabold text-green-500">
                            {formattedPrice}
                        </span>

                        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-gray-200">
                            <LineChart className="w-3 h-3" />
                            <span>Tracking</span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap items-center gap-3">
                <button
                    onClick={handleToggleChart}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold transition-all border border-gray-200"
                >
                    {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showChart ? "Hide Chart" : "Show Chart"}
                </button>

                <Link
                    href={product.url}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-all border border-gray-200"
                >
                    <ExternalLink className="w-4 h-4" />
                    View Product
                </Link>

                <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 rounded-lg text-sm font-bold transition-all ml-auto"
                >
                    <Trash2 className="w-4 h-4" />
                    Remove
                </button>
            </div>







            {/* Inline Chart/History */}
            {showChart && (
                <PriceChart productId={product.id} />
            )}
        </div>
    );
}
