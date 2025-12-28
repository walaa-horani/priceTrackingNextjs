"use server"
import { scrape } from "@/lib/firecrawl";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    redirect("/");
}


export async function addProduct(formData: FormData) {
    const url = formData.get("url");
    if (!url) {
        return { error: "URL is required" };
    }

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                error: "Not authenticated"
            };
        }
        // Scrape product data with Firecrawl
        const productData = await scrape(url as string);
        if (!productData || !productData.productName || !productData.currentPrice) {
            console.log(productData, "productData");
            return { error: "Could not extract product data" };
        }
        const newPrice = productData.currentPrice;
        const currency = productData.currency || "USD";

        const { data: existingProduct } = await supabase.from("product").select
            ("id, current_price").eq("user_id", user.id).eq("url", url).single();

        const isUpdate = !!existingProduct;

        // upsert product (insert or update based on user_id + url)


        const { data: product, error } = await supabase.from("product").upsert({
            user_id: user.id,
            url,
            name: productData.productName,
            current_price: newPrice,
            currency: currency,
            image_url: productData.imageURL,
            updated_at: new Date().toISOString(),
        },
            {
                onConflict: "user_id,url", // Unique constraint on user_id + url
                ignoreDuplicates: false,  // Always update if exists
            }
        )
            .select()
            .single();

        if (error) throw error;
        // Add to price history if it's a new product OR price changed
        const addProductToHistory = !isUpdate || existingProduct.current_price !== newPrice;

        if (addProductToHistory) {
            await supabase.from("price_history").insert({
                product_id: product.id,
                price: newPrice,
                currency: currency,

            })
        }

        revalidatePath("/");
        return {
            success: true,

            product,
            message: isUpdate ? "Product updated" : "Product added",
        };


    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getProducts() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("product")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Get products error:", error);
        return [];
    }
}

export async function getProduct(id: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("product")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get product error:", error);
        return null;
    }
}

export async function getPriceHistory(productId: string) {
    try {
        const supabase = await createClient();
        console.log("Fetching price history for:", productId);
        const { data, error } = await supabase
            .from("price_history")
            .select("*")
            .eq("product_id", productId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Supabase error in getPriceHistory:", error);
            throw error;
        }
        console.log("Price history data:", data?.length, "records found");
        return data || [];
    } catch (error) {
        console.error("Get price history error:", error);
        return [];
    }
}

export async function deleteProduct(productId: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("product")
            .delete()
            .eq("id", productId);

        if (error) throw error;
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Delete product error:", error);
        return { error: error.message };
    }
}


