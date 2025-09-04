import Image from "next/image";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Star } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  promoText?: string;
  className?: string;
}

export const ProductCard = ({ name, price, imageUrl, rating, reviewCount, promoText, className }: ProductCardProps) => {
  return (
    <Card className={cn("overflow-hidden rounded-2xl border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1", className)}>
      <CardHeader className="p-0 relative">
        <div className="relative h-64 w-full">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
        {promoText && <Badge className="absolute top-3 right-3" variant="destructive">{promoText}</Badge>}
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold truncate">{name}</h3>
        <p className="mt-2 text-xl font-bold">${price.toFixed(2)}</p>
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="ml-2 text-sm text-muted-foreground">({reviewCount} reviews)</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  );
};