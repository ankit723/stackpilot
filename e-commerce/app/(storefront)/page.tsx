"use client";
import BannerCarousel from "@/components/ui/banner-carousel";
import CenterZoomCarousel from "@/components/ui/centerZoomCarousel";
import { ProductCard } from "@/components/ui/productCard";
import SlidesPerViewCarousel from "@/components/ui/slidesPerViewCarousel";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Watch, Speaker, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getBannerCarouselItems, getFeaturedCategories, getTrendingProducts } from "@/app/actions/home/actions";

export default async function HomePage() {
  const [bannerItems, featuredCategories, trendingProducts] = await Promise.all([
    getBannerCarouselItems(),
    getFeaturedCategories(),
    getTrendingProducts()
  ]);

  const carouselImages = [
    'https://picsum.photos/800/600?18',
    'https://picsum.photos/800/600?19',
    'https://picsum.photos/800/600?20',
    'https://picsum.photos/800/600?21',
    'https://picsum.photos/800/600?22',
  ];

  const trendingSlides = trendingProducts.map((product, index) => <ProductCard key={index} {...product} />);
  
  const iconMap = {
    "T-Shirts": <Shirt className="w-12 h-12" />,
    "Bags": <ShoppingBag className="w-12 h-12" />,
    "Watches": <Watch className="w-12 h-12" />,
    "Accessories": <Speaker className="w-12 h-12" />,
  }

  return (
    <main className="min-h-screen w-full text-foreground bg-background">
      <BannerCarousel items={bannerItems.map(item => ({...item, onCtaClick: () => console.log("clicked")}))} />
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-extrabold text-center mb-12">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {featuredCategories.map((category, index) => (
            <Card key={index} className="group relative overflow-hidden rounded-2xl border-none shadow-xl transform transition-all duration-300 hover:scale-105">
              <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40" />
              <CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
                {iconMap[category.name as keyof typeof iconMap]}
                <h3 className="text-2xl font-bold mt-4">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="py-16 bg-secondary/20">
        <CenterZoomCarousel images={carouselImages} />
      </div>
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-extrabold text-center mb-12">Trending Now</h2>
        <SlidesPerViewCarousel items={trendingSlides} slidesPerView={3} />
      </div>
    </main>
  );
}
