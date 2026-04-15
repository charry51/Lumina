'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { 
  Settings, 
  Sun, 
  Moon, 
  Type, 
  Check,
  ChevronUp,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FONT_SIZES = [
  { id: 'small', label: 'Estándar', value: '16px' },
  { id: 'medium', label: 'Grande', value: '18px' },
  { id: 'large', label: 'Extra', value: '22px' }
]

export function AccessibilityWidget() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState('small')

  // Evitar desajustes de hidratación
  useEffect(() => {
    setMounted(true)
    const savedSize = localStorage.getItem('lumina-font-size') || 'small'
    updateFontSize(savedSize)
  }, [])

  const updateFontSize = (sizeId: string) => {
    setFontSize(sizeId)
    localStorage.setItem('lumina-font-size', sizeId)
    const val = FONT_SIZES.find(s => s.id === sizeId)?.value || '16px'
    document.documentElement.style.setProperty('--font-size-base', val)
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Panel de Accesibilidad */}
      {isOpen && (
        <div className="cyber-glass-cyan p-6 w-72 mb-2 animate-in fade-in slide-in-from-bottom-4 transition-all border-[#00d2ff]/30 shadow-[0_0_50px_rgba(0,210,255,0.2)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" /> Accesibilidad
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Tema */}
          <div className="space-y-3 mb-8">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Apariencia Visual</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-12 flex flex-col gap-1 border-zinc-800 transition-all ${theme === 'light' ? 'bg-primary/10 border-primary text-primary' : 'bg-zinc-950 text-zinc-500'}`}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase">Claro</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`h-12 flex flex-col gap-1 border-zinc-800 transition-all ${theme === 'dark' ? 'bg-primary/10 border-primary text-primary' : 'bg-zinc-950 text-zinc-500'}`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase">Oscuro</span>
              </Button>
            </div>
          </div>

          {/* Tamaño de Letra */}
          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Tamaño de Texto</p>
            <div className="flex flex-col gap-1.5">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => updateFontSize(size.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                    fontSize === size.id 
                      ? 'bg-primary border-primary text-black' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Type className="w-3.5 h-3.5" />
                    {size.label}
                  </div>
                  {fontSize === size.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,210,255,0.3)] border border-primary/40 group overflow-hidden relative ${
          isOpen ? 'bg-white text-black scale-90' : 'bg-primary text-black'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        {isOpen ? <ChevronUp className="w-6 h-6 relative z-10" /> : <Settings className="w-6 h-6 animate-spin-slow relative z-10" />}
      </button>
    </div>
  )
}
