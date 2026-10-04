import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge about the custom tokens from index.css. Without this it
// reads `text-heading` as a text *colour* and drops it when merged with `text-muted`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs', 'lead', 'heading', 'display'],
      tracking: ['display']
    }
  }
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
