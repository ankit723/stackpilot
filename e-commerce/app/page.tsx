"use client";
import BannerCarousel, { BannerCarouselItem } from "@/components/ui/banner-carousel";
import CenterZoomCarousel from "@/components/ui/centerZoomCarousel";
import { ProductCard } from "@/components/ui/productCard";
import SlidesPerViewCarousel from "@/components/ui/slidesPerViewCarousel";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Watch, Speaker, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const bannerItems: BannerCarouselItem[] = [
    {
      id: "1",
      bannerTitle: (
        <>
          JKY <span className="text-yellow-400">GROOVE</span>
        </>
      ),
      description: "Our New Drop Is Here!",
      mediaUrl: "https://i.imgur.com/8i4y6aE.jpeg",
      mediaType: "image",
      ctaText: "Explore Now >",
      onCtaClick: () => console.log("Explore now clicked"),
      sideText: (
        <div className="border-l-4 border-yellow-400 pl-4">
          <p className="text-lg font-semibold">COOL</p>
          <p className="text-lg font-semibold">CODED</p>
          <p className="text-lg font-semibold">CASUALS</p>
        </div>
      )
    },
    {
      id: "2",
      bannerTitle: "Urban Collection",
      description: "Street-style essentials for the modern wardrobe.",
      mediaUrl: "https://picsum.photos/1920/1080?24",
      mediaType: "image",
      ctaText: "Shop The Look",
      onCtaClick: () => console.log("Shop the look clicked"),
    }
  ];

  const trendingProducts = [
    { name: "Modern Wireless Headphones", price: 129.99, imageUrl: "https://picsum.photos/400/300?10", rating: 4.5, reviewCount: 150, promoText: "New Arrival" },
    { name: "Classic Leather Watch", price: 249.99, imageUrl: "https://picsum.photos/400/300?11", rating: 4.8, reviewCount: 210, promoText: "Best Seller" },
    { name: "Stylish Running Shoes", price: 89.99, imageUrl: "https://picsum.photos/400/300?12", rating: 4.2, reviewCount: 320 },
    { name: "Smart Home Speaker", price: 79.99, imageUrl: "https://picsum.photos/400/300?13", rating: 4.6, reviewCount: 180, promoText: "Save 20%" },
  ];

  const featuredCategories = [
    { name: "T-Shirts", icon: <Shirt className="w-12 h-12" />, imageUrl: "https://picsum.photos/200/200?14" },
    { name: "Bags", icon: <ShoppingBag className="w-12 h-12" />, imageUrl: "https://picsum.photos/200/200?15" },
    { name: "Watches", icon: <Watch className="w-12 h-12" />, imageUrl: "https://picsum.photos/200/200?16" },
    { name: "Accessories", icon: <Speaker className="w-12 h-12" />, imageUrl: "https://picsum.photos/200/200?17" },
  ];

  const carouselImages = [
    'https://picsum.photos/800/600?18',
    'https://picsum.photos/800/600?19',
    'https://picsum.photos/800/600?20',
    'https://picsum.photos/800/600?21',
    'https://picsum.photos/800/600?22',
  ];

  const trendingSlides = trendingProducts.map((product, index) => <ProductCard key={index} {...product} />);

  return (
    <main className="min-h-screen w-full text-foreground bg-background">
      <BannerCarousel items={bannerItems} />
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-extrabold text-center mb-12">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {featuredCategories.map((category, index) => (
            <Card key={index} className="group relative overflow-hidden rounded-2xl border-none shadow-xl transform transition-all duration-300 hover:scale-105">
              <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40" />
              <CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
                {category.icon}
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
