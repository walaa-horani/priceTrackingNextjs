import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY as string });


interface ScrapedProduct {
    productName: string;
    currentPrice: number;
    currency?: string;
    imageURL?: string;
}
// Scrape a website:
export async function scrape(url: string) {
    try {
        const result = await firecrawl.scrape(url, {
            formats: [
                {
                    type: "json",
                    schema: {
                        type: "object",
                        required: ["productName", "currentPrice"],
                        properties: {
                            productName: { type: "string" },
                            currentPrice: { type: "number" },
                            currency: { type: "string" },
                            imageURL: { type: "string" },
                        },
                    },
                    prompt:
                        "Extract the product name as 'productName', current price as a number as 'currentPrice', currency (USD, EUR, etc) as 'currency', and product image URL as 'imageURL' if available",
                },
            ],
        })

        const extractedData = result.json as ScrapedProduct | undefined

        if (!extractedData || !extractedData.productName) {
            throw new Error("No data extracted from URL");
        }

        return extractedData;

    } catch (error: any) {
        console.error("Firecrawl scrape error:", error);
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}