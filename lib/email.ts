import { Resend } from "resend";

export type Product = {
    id: string;
    name: string;
    url: string;
    currency: string;
    image_url?: string;
};

type SendEmailResult = {
    success: boolean;
    error?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
    userEmail: string,
    product: Product,
    oldPrice: number,
    newPrice: number
): Promise<SendEmailResult> {
    try {
        const fromEmail = process.env.RESEND_FROM_EMAIL;

        if (!fromEmail) {
            return {
                success: false,
                error: "Missing RESEND_FROM_EMAIL environment variable",
            };
        }
        const priceDrop = oldPrice - newPrice;
        const priceDropPercentage = ((priceDrop / oldPrice) * 100).toFixed(1);

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Price Drop Alert</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f4f7f9;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                .header {
                    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
                    color: white;
                    padding: 40px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }
                .content {
                    padding: 30px;
                    text-align: center;
                }
                .product-image {
                    width: 200px;
                    height: 200px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }
                .product-name {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 10px;
                    display: block;
                    text-decoration: none;
                }
                .price-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                    margin: 20px 0;
                }
                .old-price {
                    font-size: 18px;
                    color: #718096;
                    text-decoration: line-through;
                }
                .new-price {
                    font-size: 28px;
                    color: #FF6B6B;
                    font-weight: 800;
                }
                .price-drop-badge {
                    background: #EBFFFF;
                    color: #008489;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 14px;
                    margin-top: 10px;
                    display: inline-block;
                }
                .button {
                    display: inline-block;
                    background-color: #FF6B6B;
                    color: white !important;
                    padding: 16px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 25px;
                    transition: all 0.2s;
                }
                .footer {
                    background-color: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #a0aec0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Great News! Price Drop Alert</h1>
                    <p>Something you've been watching just got cheaper.</p>
                </div>
                <div class="content">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="product-image">` : ""}
                    <a href="${product.url}" class="product-name">${product.name}</a>
                    
                    <div class="price-drop-badge">Save ${priceDropPercentage}%</div>
                    
                    <div class="price-container">
                        <span class="old-price">${product.currency} ${oldPrice.toFixed(2)}</span>
                        <span style="font-size: 20px; color: #cbd5e0;">→</span>
                        <span class="new-price">${product.currency} ${newPrice.toFixed(2)}</span>
                    </div>

                    <a href="${product.url}" class="button">View Product Deal</a>
                </div>
                <div class="footer">
                    <p>You received this email because you're tracking this product on Ecommerce Price Tracking.</p>
                    <p>© ${new Date().getFullYear()} Ecommerce Price Tracking. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: userEmail,
            subject: `🔥 Price Drop: ${product.name} is now ${product.currency} ${newPrice.toFixed(2)}!`,
            html: html
        })

        if (error) {
            console.error("Resend error:", error);
            return {
                success: false,
                error: error.message ?? "Email service error",
            };
        }


        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: "Failed to send email",
        };
    }
}
