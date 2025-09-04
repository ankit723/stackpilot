import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const bannerVariants = cva(
  "relative w-full h-[600px] md:h-[700px] overflow-hidden text-white",
  {
    variants: {
      variant: {
        default: "bg-gray-900",
        primary: "bg-primary/10",
        secondary: "bg-secondary/10",
        destructive: "bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof bannerVariants> {
  bannerTitle: React.ReactNode
  description: string
  mediaUrl: string
  mediaType: "image" | "video"
  ctaText?: string
  onCtaClick?: () => void
  sideText?: React.ReactNode
}

const Banner = ({
  className,
  variant,
  bannerTitle,
  description,
  mediaUrl,
  mediaType,
  ctaText,
  onCtaClick,
  sideText,
  ...props
}: BannerProps) => {
  return (
    <div className={cn(bannerVariants({ variant }), className)} {...props}>
      {mediaType === "image" ? (
        <Image
          src={mediaUrl}
          alt={typeof bannerTitle === 'string' ? bannerTitle : 'Banner Image'}
          fill
          className="object-cover"
        />
      ) : (
        <video
          src={mediaUrl}
          autoPlay
          muted
          loop
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="relative z-10 flex h-full items-center container mx-auto px-6">
        <div className="w-1/2 space-y-4">
          <div className="text-6xl font-extrabold">{bannerTitle}</div>
          <p className="text-xl text-white/80">{description}</p>
          {ctaText && onCtaClick && (
            <Button onClick={onCtaClick} size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
              {ctaText}
            </Button>
          )}
        </div>
        {sideText && <div className="absolute bottom-16 right-40 text-right">{sideText}</div>}
      </div>
    </div>
  )
}

export { Banner, bannerVariants }