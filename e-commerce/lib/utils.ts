import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateCartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])),
    [[]]
  )
}


export function slugify(text: string): string {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
}