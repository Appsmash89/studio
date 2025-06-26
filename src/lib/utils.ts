
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const adjustHsl = (hsl: string, h: number, l: number) => {
  const [hue, saturation, lightness] = hsl.match(/\d+/g)!.map(Number);
  return `hsl(${hue + h}, ${saturation}%, ${lightness + l}%)`;
}
