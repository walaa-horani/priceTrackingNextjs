import Image from "next/image";
import Hero from "./(components)/landing/Hero";
import { FeatureCarousel } from "./(components)/landing/FeatureCarousel";
import FeatureCards from "./(components)/landing/FeatureCards";
import CTA from "./(components)/landing/CTA";
import { createClient } from "@/lib/supabase/server";
import AddProductForm from "./(components)/AddProductForm";
import { getProducts } from "./actions";
import ProductCard from "./(components)/ProductCard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("Logged in user:", user?.email);

  const products = user ? await getProducts() : [];

  return (
    <div className="min-h-screen  ">
      <Hero />
      <AddProductForm user={user} />
      <FeatureCarousel />
      <FeatureCards />
      <CTA />

      {products.length > 0 ? (
        <section className="max-w-7xl mx-auto p-10">

          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Your Products</h3>

            <span>  {products.length} {products.length === 1 ? "product" : "products"}  </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex items-center justify-center">

          <p>No Tracked products yet</p>
        </div>
      )}
    </div>
  );
}
