// app/api/cron/price-tracking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { scrape } from "@/lib/firecrawl";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use service role to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: products, error: productsError } = await supabase
            .from("product")
            .select("*");

        if (productsError) throw productsError;

        console.log(`Found ${products.length} products to check`);

        const results = {
            total: products.length,
            updated: 0,
            failed: 0,
            priceChanges: 0,
            alertsSent: 0,
            errors: [] as any[]
        };

        // Helper to ensure image URLs are absolute
        const getAbsoluteUrl = (url?: string, baseUrl?: string) => {
            if (!url) return undefined;
            if (url.startsWith('http')) return url;
            if (url.startsWith('//')) return `https:${url}`;
            if (baseUrl) {
                try {
                    const base = new URL(baseUrl).origin;
                    return new URL(url, base).toString();
                } catch (e) {
                    return url;
                }
            }
            return url;
        };

        for (const product of products) {
            try {
                console.log(`[CRON] Starting product: ${product.name} (${product.id})`);

                const productData = await scrape(product.url);

                if (!productData || !productData.currentPrice) {
                    const msg = `Failed to scrape or missing price for: ${product.id}`;
                    console.warn(`[CRON] ${msg}`);
                    results.failed++;
                    results.errors.push({ id: product.id, error: msg });
                    continue;
                }

                const newPrice = productData.currentPrice;
                const oldPrice = product.current_price;
                const absoluteImageUrl = getAbsoluteUrl(productData.imageURL || product.image_url, product.url);

                console.log(`[CRON] ${product.name}: Old=${oldPrice}, New=${newPrice}`);
                console.log(`[DEBUG: IMAGE URL] ${absoluteImageUrl}`);

                // Update product table with latest data
                const { error: updateError } = await supabase
                    .from("product")
                    .update({
                        current_price: newPrice,
                        currency: productData.currency || product.currency,
                        name: productData.productName || product.name,
                        image_url: absoluteImageUrl,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", product.id);

                if (updateError) {
                    console.error(`[CRON] Update error for ${product.id}:`, updateError);
                    results.failed++;
                    results.errors.push({ id: product.id, error: `Update failed: ${updateError.message}` });
                    continue;
                }

                results.updated++;

                // Track price history and send alerts
                if (oldPrice !== newPrice) {
                    console.log(`[CHANGE] Price change for ${product.id} (${oldPrice} -> ${newPrice})`);

                    await supabase.from("price_history").insert({
                        product_id: product.id,
                        price: newPrice,
                        currency: productData.currency || product.currency,
                    });

                    results.priceChanges++;

                    if (newPrice < oldPrice) {
                        console.log(`[DROP] Price drop! Fetching user ${product.user_id}`);

                        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
                            product.user_id
                        );

                        if (userError) {
                            console.error(`[EMAIL] Auth error for ${product.user_id}:`, userError);
                        }

                        const user = userData?.user;

                        if (user?.email) {
                            console.log(`[EMAIL] Sending alert to ${user.email}`);

                            const emailResult = await sendEmail(
                                user.email,
                                {
                                    ...product,
                                    name: productData.productName || product.name,
                                    image_url: absoluteImageUrl,
                                },
                                oldPrice,
                                newPrice
                            );

                            if (emailResult.success) {
                                console.log(`[EMAIL] Sent successfully to ${user.email}`);
                                results.alertsSent++;
                            } else {
                                console.error(`[EMAIL] Failed for ${user.email}:`, emailResult.error);
                                results.errors.push({ id: product.id, error: `Email failed: ${emailResult.error}` });
                            }
                        } else {
                            console.warn(`[EMAIL] No email found for user ${product.user_id}`);
                        }
                    }
                }
            } catch (error: any) {
                const errorMsg = error.message || "Unknown error";
                console.error(`[CRON] Unexpected error for product ${product.id}:`, errorMsg);
                results.failed++;
                results.errors.push({ id: product.id, error: errorMsg });
            }
        }

        console.log("Cron job finished successfully", results);
        return NextResponse.json(results);
    } catch (error: any) {
        console.error("Cron error:", error);
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
                stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

// This is important! Export runtime config if needed
export const runtime = 'nodejs'; // or 'edge'
export const dynamic = 'force-dynamic';
// curl.exe -X POST "https://price-tracking-nextjs.vercel.app/api/cron/price-tracking" -H "Authorization: Bearer 8ff30f27bd2d292eb91a610e2d794ff2fc7c8b0d4cd110ad91935e2675e91d3a"
