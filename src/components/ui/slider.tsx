'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'value'> {
  defaultValue?: number[]
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, defaultValue, value: controlledValue, onValueChange, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue?.[0] || controlledValue?.[0] || 0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value)
      setValue(newValue)
      onValueChange?.([newValue])
    }

    return (
      <div className="relative w-full flex items-center group py-4">
        <input
          type="range"
          ref={ref}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-[#D4AF37] hover:accent-amber-700 dark:hover:accent-[#b08d24] transition-all",
            "focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-[#D4AF37]/50",
            className
          )}
          {...props}
        />
        
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: currentColor;
            border: 2px solid var(--background, #fff);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
            transition: all 0.2s ease;
          }
          input[type='range']::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
          }
          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: currentColor;
            border: 2px solid var(--background, #fff);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
          }
          /* This class helps currentColor inherit the accent color definition if needed, though accent-color utility usually applies to the control natively */
        `}</style>
      </div>
    )
  }
)

Slider.displayName = 'Slider'

export { Slider }
