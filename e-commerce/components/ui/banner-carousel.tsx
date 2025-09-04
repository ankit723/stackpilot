"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner, BannerProps } from "./banner";

export interface BannerCarouselItem extends BannerProps {
  id: string;
}

interface BannerCarouselProps {
  items: BannerCarouselItem[];
  className?: string;
}

export default function BannerCarousel({ items, className }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={cn("relative w-full group", className)}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".banner-swiper-button-next",
          prevEl: ".banner-swiper-button-prev",
        }}
        className="w-full"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <Banner {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className="absolute bottom-8 right-16 z-10 flex items-center gap-8 text-white">
        <div className="flex items-center gap-3">
          <div className="banner-swiper-button-prev cursor-pointer p-2 rounded-full transition-colors hover:bg-white/10">
            <ChevronLeft className="h-6 w-6" />
          </div>
          <div className="banner-swiper-button-next cursor-pointer p-2 rounded-full transition-colors hover:bg-white/10">
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>

        <div>
          <span className="text-2xl font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="text-lg text-white/50"> / {String(items.length).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
} 