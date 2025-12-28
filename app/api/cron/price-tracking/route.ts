import { getPriceHistory } from "@/app/actions";
import { sendEmail } from "@/lib/email";
import { scrape } from "@/lib/firecrawl";
import { createClient } from "@supabase/supabase-js";



export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        const cronSecret = process.env.CRON_SECRET
        if (!cronSecret || !authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response('Unauthorized', { status: 401 })
        }
        // Use service role to bypass RLS

        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: products, error: productsError } = await supabase.from("products").select("*");
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
                const productData = await scrape(product.url)

                if (!productData || !productData.currentPrice) {
                    results.failed++;
                    continue;
                }
                const newPrice = productData.currentPrice;
                const oldPrice = product.current_price;

                await supabase
                    .from("products")
                    .update({
                        current_price: newPrice,
                        currency: productData.currency || product.currency,
                        name: productData.productName || product.name,
                        image_url: productData.imageURL || product.image_url,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", product.id);

                results.updated++;

                if (oldPrice !== newPrice) {
                    await supabase.from("price_history").insert({
                        product_id: product.id,
                        price: newPrice,
                        currency: productData.currency || product.currency,
                    });
                    results.priceChanges++;

                    if (newPrice < oldPrice) {
                        const {
                            data: { user },
                        } = await supabase.auth.admin.getUserById(product.user_id);
                        if (user?.email) {
                            const emailResult = await sendEmail(user.email, product, oldPrice, newPrice);
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

        return Response.json(results);
    } catch (error: any) {
        console.error("Cron error:", error);
        return new Response(error.message || 'Internal Server Error', { status: 500 })
    }
}
