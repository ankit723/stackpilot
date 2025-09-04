"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import 'swiper/css'
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CenterZoomCarouselProps {
  images: string[];
  className?: string;
}

export default function CenterZoomCarousel({ images, className }: CenterZoomCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className={cn("w-full max-w-5xl mx-auto py-10", className)}>
      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        centeredSlides={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        loop={true}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} className="flex justify-center items-center">
            <div
              className={cn("relative w-full h-64 rounded-xl overflow-hidden transition-all duration-300 ease-in-out",
                index === activeIndex ? 'scale-110' : 'scale-90 opacity-70'
              )}
            >
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
