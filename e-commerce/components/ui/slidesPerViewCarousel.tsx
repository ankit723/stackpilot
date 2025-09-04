"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import 'swiper/css'
import 'swiper/css/navigation'
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SlidesPerViewCarouselProps {
  items: React.ReactNode[];
  className?: string;
  slidesPerView?: number;
}

export default function SlidesPerViewCarousel({ items, className, slidesPerView = 3 }: SlidesPerViewCarouselProps) {
  return (
    <div className={cn("relative w-full max-w-6xl mx-auto", className)}>
      <Swiper
        modules={[Navigation]}
        spaceBetween={30}
        slidesPerView={slidesPerView}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        className="!pb-10"
      >
        {items.map((item, index) => (
          <SwiperSlide key={index}>{item}</SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-button-prev absolute top-1/2 -left-4 -translate-y-1/2 z-10">
        <Button variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="swiper-button-next absolute top-1/2 -right-4 -translate-y-1/2 z-10">
        <Button variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
