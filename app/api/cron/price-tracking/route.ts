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
        };

        for (const product of products) {
            try {
                console.log(`Processing product: ${product.name} (${product.id})`);
                const productData = await scrape(product.url);

                if (!productData || !productData.currentPrice) {
                    console.warn(`Failed to scrape or missing price for product: ${product.id}`);
                    results.failed++;
                    continue;
                }

                const newPrice = productData.currentPrice;
                const oldPrice = product.current_price;

                console.log(`Price check for ${product.name}: Old=${oldPrice}, New=${newPrice}`);

                const { error: updateError } = await supabase
                    .from("product")
                    .update({
                        current_price: newPrice,
                        currency: productData.currency || product.currency,
                        name: productData.productName || product.name,
                        image_url: productData.imageURL || product.image_url,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", product.id);

                if (updateError) {
                    console.error(`Error updating product ${product.id}:`, updateError);
                    results.failed++;
                    continue;
                }

                results.updated++;

                if (oldPrice !== newPrice) {
                    await supabase.from("price_history").insert({
                        product_id: product.id,
                        price: newPrice,
                        currency: productData.currency || product.currency,
                    });

                    results.priceChanges++;

                    if (newPrice < oldPrice) {
                        const { data: { user } } = await supabase.auth.admin.getUserById(
                            product.user_id
                        );

                        if (user?.email) {
                            const emailResult = await sendEmail(
                                user.email,
                                product,
                                oldPrice,
                                newPrice
                            );
                            if (emailResult.success) {
                                results.alertsSent++;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing product ${product.id}:`, error);
                results.failed++;
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
